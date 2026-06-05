import { prisma } from "../lib/prisma.js";
import { rankSongs } from "./ranking.js";

// In-memory presence tracking
const presence = new Map<string, Set<string>>();

export function getPresence(joinCode: string): Set<string> {
  if (!presence.has(joinCode)) {
    presence.set(joinCode, new Set());
  }
  return presence.get(joinCode)!;
}

export function addToPresence(joinCode: string, participantId: string): void {
  const participantSet = getPresence(joinCode);
  participantSet.add(participantId);
}

export function removeFromPresence(joinCode: string, participantId: string): void {
  const participantSet = getPresence(joinCode);
  participantSet.delete(participantId);
  
  // Clean up empty presence sets
  if (participantSet.size === 0) {
    presence.delete(joinCode);
  }
}

export async function getPartyState(joinCode: string) {
  const party = await prisma.party.findUnique({
    where: { joinCode },
    include: {
      participants: true,
      songs: {
        include: {
          votes: true,
          addedBy: true,
        },
      },
    },
  });

  if (!party) {
    return null;
  }

  const onlineParticipants = getPresence(joinCode);
  const rankedSongs = rankSongs(party.songs);

  return {
    id: party.id,
    joinCode: party.joinCode,
    name: party.name,
    status: party.status,
    hostId: party.hostId,
    maxSongs: party.maxSongs,
    maxDuration: party.maxDuration,
    currentSongId: party.currentSongId,
    currentStartedAt: party.currentStartedAt,
    winnerSongId: party.winnerSongId,
    participants: party.participants.map(participant => ({
      id: participant.id,
      name: participant.name,
      online: onlineParticipants.has(participant.id),
    })),
    songs: rankedSongs.map(song => ({
      id: song.id,
      externalId: song.externalID,
      title: song.title,
      artist: song.artist,
      artworkUrl: song.artworkUrl,
      previewUrl: song.previewUrl,
      addedById: song.addedById,
      addedByName: song.addedBy.name,
      played: song.played,
      score: song.score,
      createdAt: song.createdAt,
      votes: song.votes.map(vote => ({
        participantId: vote.participantId,
        value: vote.value,
      })),
    })),
  };
}