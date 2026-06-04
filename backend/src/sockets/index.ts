import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";
import { getPartyState, addToPresence, removeFromPresence, getPresence } from "../services/partyState.js";
import { pickWinner, rankSongs } from "../services/ranking.js";

// In-memory timer tracking
const timers = new Map<string, NodeJS.Timeout>();

function clearTimer(joinCode: string): void {
  const existingTimer = timers.get(joinCode);
  if (existingTimer) {
    clearTimeout(existingTimer);
    timers.delete(joinCode);
  }
}

function setAutoAdvanceTimer(joinCode: string): void {
  clearTimer(joinCode);
  
  const timer = setTimeout(async () => {
    try {
      await autoAdvanceSong(joinCode);
    } catch (error) {
      console.error(`Auto-advance failed for party ${joinCode}:`, error);
    }
  }, 30000); // 30 seconds
  
  timers.set(joinCode, timer);
}

async function autoAdvanceSong(joinCode: string): Promise<void> {
  const party = await prisma.party.findUnique({
    where: { joinCode },
    include: {
      songs: {
        include: { votes: true },
      },
    },
  });

  if (!party || party.status !== "active") {
    clearTimer(joinCode);
    return;
  }

  // Mark current song as played
  if (party.currentSongId) {
    await prisma.song.update({
      where: { id: party.currentSongId },
      data: { played: true },
    });
  }

  // Get next unplayed song
  const rankedSongs = rankSongs(party.songs);
  const nextSong = rankedSongs.find(song => !song.played);

  if (nextSong) {
    // Advance to next song
    await prisma.party.update({
      where: { id: party.id },
      data: {
        currentSongId: nextSong.id,
        currentStartedAt: new Date(),
      },
    });
    
    // Set timer for next advance
    setAutoAdvanceTimer(joinCode);
  } else {
    // No more songs, clear current song
    await prisma.party.update({
      where: { id: party.id },
      data: {
        currentSongId: null,
        currentStartedAt: null,
      },
    });
    
    clearTimer(joinCode);
  }

  // Broadcast updated party state
  const io = global.socketIO;
  if (io) {
    const updatedState = await getPartyState(joinCode);
    if (updatedState) {
      io.to(joinCode).emit("party-updated", updatedState);
    }
  }
}

export function setupSocketHandlers(io: Server): void {
  // Store io instance globally for timer callbacks
  (global as any).socketIO = io;

  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Join party
    socket.on("join-party", async (data: { joinCode: string; name: string }, ack) => {
      try {
        const { joinCode, name } = data;

        // Validate inputs
        if (!joinCode || !name?.trim()) {
          ack({ error: "Invalid join code or name" });
          return;
        }

        // Find party
        const party = await prisma.party.findUnique({
          where: { joinCode },
        });

        if (!party) {
          ack({ error: "Party not found" });
          return;
        }

        if (party.status === "ended") {
          ack({ error: "Party has ended" });
          return;
        }

        // Create participant
        const participant = await prisma.participant.create({
          data: {
            name: name.trim(),
            partyId: party.id,
          },
        });

        // Join socket room and track presence
        socket.join(joinCode);
        socket.data.joinCode = joinCode;
        socket.data.participantId = participant.id;
        addToPresence(joinCode, participant.id);

        // Broadcast updated party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
        }

        ack({ participantId: participant.id });
      } catch (error) {
        console.error("Error in join-party:", error);
        socket.emit("error", { message: "Failed to join party" });
      }
    });

    // Rejoin party
    socket.on("rejoin-party", async (data: { joinCode: string; participantId: string }, ack) => {
      try {
        const { joinCode, participantId } = data;

        // Find party
        const party = await prisma.party.findUnique({
          where: { joinCode },
        });

        if (!party) {
          if (typeof ack === "function") {
            ack({ error: "Party not found" });
          }
          return;
        }

        // Find participant and validate it belongs to this party
        const participant = await prisma.participant.findUnique({
          where: { id: participantId },
        });

        if (!participant || participant.partyId !== party.id) {
          if (typeof ack === "function") {
            ack({ error: "Participant not found" });
          }
          return;
        }

        // Join socket room and track presence
        socket.join(joinCode);
        socket.data.joinCode = joinCode;
        socket.data.participantId = participantId;
        addToPresence(joinCode, participantId);

        // Broadcast updated party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
        }

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        console.error("Error in rejoin-party:", error);
        if (typeof ack === "function") {
          ack({ error: "Failed to rejoin party" });
        }
      }
    });

    // Add song
    socket.on("add-song", async (data: { 
      joinCode: string; 
      participantId: string; 
      song: { externalId: string; title: string; artist: string; artworkUrl: string; previewUrl: string } 
    }) => {
      try {
        const { joinCode, participantId, song } = data;

        // Find party and validate participant
        const party = await prisma.party.findUnique({
          where: { joinCode },
          include: { songs: true },
        });

        if (!party) {
          socket.emit("error", { message: "Party not found" });
          return;
        }

        const participant = await prisma.participant.findFirst({
          where: { id: participantId, partyId: party.id },
        });

        if (!participant) {
          socket.emit("error", { message: "Invalid participant" });
          return;
        }

        // Check song limit
        if (party.maxSongs && party.songs.length >= party.maxSongs) {
          socket.emit("error", { message: "Song limit reached" });
          return;
        }

        // Create song
        await prisma.song.create({
          data: {
            title: song.title,
            artist: song.artist,
            externalID: song.externalId,
            artworkUrl: song.artworkUrl,
            previewUrl: song.previewUrl,
            partyId: party.id,
            addedById: participantId,
          },
        });

        // Broadcast updated party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
        }
      } catch (error) {
        console.error("Error in add-song:", error);
        socket.emit("error", { message: "Failed to add song" });
      }
    });

    // Vote on song
    socket.on("vote-song", async (data: { joinCode: string; participantId: string; songId: string; value: number }) => {
      try {
        const { joinCode, participantId, songId, value } = data;

        // Validate vote value
        if (value !== 1 && value !== -1) {
          socket.emit("error", { message: "Invalid vote value" });
          return;
        }

        // Find party and validate participant
        const party = await prisma.party.findUnique({ where: { joinCode } });
        if (!party) {
          socket.emit("error", { message: "Party not found" });
          return;
        }

        const participant = await prisma.participant.findFirst({
          where: { id: participantId, partyId: party.id },
        });

        if (!participant) {
          socket.emit("error", { message: "Invalid participant" });
          return;
        }

        // Check for existing vote
        const existingVote = await prisma.vote.findUnique({
          where: {
            songId_participantId: {
              songId,
              participantId,
            },
          },
        });

        if (!existingVote) {
          // Create new vote
          await prisma.vote.create({
            data: {
              songId,
              participantId,
              value,
            },
          });
        } else if (existingVote.value === value) {
          // Same value: delete vote (toggle off)
          await prisma.vote.delete({
            where: { id: existingVote.id },
          });
        } else {
          // Different value: update vote
          await prisma.vote.update({
            where: { id: existingVote.id },
            data: { value },
          });
        }

        // Broadcast updated party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
        }
      } catch (error) {
        console.error("Error in vote-song:", error);
        socket.emit("error", { message: "Failed to vote on song" });
      }
    });

    // Start party (host only)
    socket.on("start-party", async (data: { joinCode: string; participantId: string }) => {
      try {
        const { joinCode, participantId } = data;

        // Find party and validate host
        const party = await prisma.party.findUnique({
          where: { joinCode },
          include: {
            songs: {
              include: { votes: true },
            },
          },
        });

        if (!party) {
          socket.emit("error", { message: "Party not found" });
          return;
        }

        if (party.hostId !== participantId) {
          socket.emit("error", { message: "Only the host can start the party" });
          return;
        }

        if (party.status !== "lobby") {
          socket.emit("error", { message: "Party is not in lobby state" });
          return;
        }

        // Get first unplayed song
        const rankedSongs = rankSongs(party.songs);
        const firstSong = rankedSongs.find(song => !song.played);

        // Update party status and current song
        const updateData: any = {
          status: "active",
          currentStartedAt: new Date(),
        };

        if (firstSong) {
          updateData.currentSongId = firstSong.id;
        }

        await prisma.party.update({
          where: { id: party.id },
          data: updateData,
        });

        // Start auto-advance timer if there's a current song
        if (firstSong) {
          setAutoAdvanceTimer(joinCode);
        }

        // Broadcast updated party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
        }
      } catch (error) {
        console.error("Error in start-party:", error);
        socket.emit("error", { message: "Failed to start party" });
      }
    });

    // Next song (host only)
    socket.on("next-song", async (data: { joinCode: string; participantId: string }) => {
      try {
        const { joinCode, participantId } = data;

        // Find party and validate host
        const party = await prisma.party.findUnique({
          where: { joinCode },
          include: {
            songs: {
              include: { votes: true },
            },
          },
        });

        if (!party) {
          socket.emit("error", { message: "Party not found" });
          return;
        }

        if (party.hostId !== participantId) {
          socket.emit("error", { message: "Only the host can advance songs" });
          return;
        }

        // Mark current song as played
        if (party.currentSongId) {
          await prisma.song.update({
            where: { id: party.currentSongId },
            data: { played: true },
          });
        }

        // Get next unplayed song
        const rankedSongs = rankSongs(party.songs);
        const nextSong = rankedSongs.find(song => !song.played);

        const updateData: any = {
          currentStartedAt: new Date(),
        };

        if (nextSong) {
          updateData.currentSongId = nextSong.id;
        } else {
          updateData.currentSongId = null;
        }

        await prisma.party.update({
          where: { id: party.id },
          data: updateData,
        });

        // Reset auto-advance timer
        if (nextSong) {
          setAutoAdvanceTimer(joinCode);
        } else {
          clearTimer(joinCode);
        }

        // Broadcast updated party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
        }
      } catch (error) {
        console.error("Error in next-song:", error);
        socket.emit("error", { message: "Failed to advance to next song" });
      }
    });

    // End party (host only)
    socket.on("end-party", async (data: { joinCode: string; participantId: string }) => {
      try {
        const { joinCode, participantId } = data;

        // Find party and validate host
        const party = await prisma.party.findUnique({
          where: { joinCode },
          include: {
            songs: {
              include: { votes: true },
            },
          },
        });

        if (!party) {
          socket.emit("error", { message: "Party not found" });
          return;
        }

        if (party.hostId !== participantId) {
          socket.emit("error", { message: "Only the host can end the party" });
          return;
        }

        // Clear auto-advance timer
        clearTimer(joinCode);

        // Determine winner
        const winner = pickWinner(party.songs);
        
        // Update party status
        await prisma.party.update({
          where: { id: party.id },
          data: {
            status: "ended",
            winnerSongId: winner?.id || null,
            currentSongId: null,
            currentStartedAt: null,
          },
        });

        // Broadcast final party state
        const partyState = await getPartyState(joinCode);
        if (partyState) {
          io.to(joinCode).emit("party-updated", partyState);
          io.to(joinCode).emit("party-ended", { winnerSongId: winner?.id || null });
        }
      } catch (error) {
        console.error("Error in end-party:", error);
        socket.emit("error", { message: "Failed to end party" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);
      
      try {
        const { joinCode, participantId } = socket.data;
        
        if (joinCode && participantId) {
          // Remove from presence
          removeFromPresence(joinCode, participantId);
          
          // Clear timer if no one is left in the party
          const presence = getPresence(joinCode);
          if (presence.size === 0) {
            clearTimer(joinCode);
          }
          
          // Broadcast updated party state
          const partyState = await getPartyState(joinCode);
          if (partyState) {
            io.to(joinCode).emit("party-updated", partyState);
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
}