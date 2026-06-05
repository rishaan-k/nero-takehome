import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { getIdentity } from '../lib/identity';

interface Vote {
  participantId: string;
  value: number;
}

interface Song {
  id: string;
  externalId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  previewUrl: string;
  addedById: string;
  addedByName: string;
  played: boolean;
  score: number;
  createdAt: string;
  votes: Vote[];
}

interface Participant {
  id: string;
  name: string;
  online: boolean;
}

interface Party {
  id: string;
  joinCode: string;
  name: string;
  status: string;
  hostId: string;
  maxSongs?: number;
  maxDuration?: number;
  currentSongId?: string;
  currentStartedAt?: string;
  winnerSongId?: string;
  participants: Participant[];
  songs: Song[];
}

interface UsePartyResult {
  party: Party | null;
  connected: boolean;
  myParticipantId: string | null;
  isHost: boolean;
  join: (name: string) => Promise<string>;
  rejoin: (participantId: string) => Promise<{ ok?: boolean; error?: string }>;
  addSong: (song: { externalId: string; title: string; artist: string; artworkUrl: string; previewUrl: string }) => void;
  vote: (songId: string, value: number) => void;
  startParty: () => void;
  nextSong: () => void;
  endParty: () => void;
  error: string | null;
  winner: string | null;
}

export function useParty(joinCode: string): UsePartyResult {
  const [party, setParty] = useState<Party | null>(null);
  const [connected, setConnected] = useState(false);
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize myParticipantId from localStorage
  useEffect(() => {
    const identity = getIdentity(joinCode);
    if (identity) {
      setMyParticipantId(identity.participantId);
    }
  }, [joinCode]);

  // Setup socket connection
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('party-updated', (partyData: Party) => {
      setParty(partyData);
      setError(null);
    });

    socket.on('party-ended', (data: { winnerSongId: string | null }) => {
      setWinner(data.winnerSongId);
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      toast.error(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const isHost = party?.hostId === myParticipantId;

  const join = async (name: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('join-party', { joinCode, name }, (response: { participantId?: string; error?: string }) => {
        if (response.error) {
          setError(response.error);
          reject(new Error(response.error));
        } else if (response.participantId) {
          setMyParticipantId(response.participantId);
          setError(null);
          resolve(response.participantId);
        } else {
          const errorMsg = 'Invalid response from server';
          setError(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    });
  };

  const rejoin = async (participantId: string): Promise<{ ok?: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        resolve({ error: 'Socket not connected' });
        return;
      }

      socketRef.current.emit('rejoin-party', { joinCode, participantId }, (response: { ok?: boolean; error?: string }) => {
        if (response.ok) {
          setMyParticipantId(participantId);
          setError(null);
        } else if (response.error) {
          setError(response.error);
        }
        resolve(response);
      });
    });
  };

  const addSong = (song: { externalId: string; title: string; artist: string; artworkUrl: string; previewUrl: string }) => {
    if (!socketRef.current || !myParticipantId) return;
    
    socketRef.current.emit('add-song', {
      joinCode,
      participantId: myParticipantId,
      song,
    });
  };

  const vote = (songId: string, value: number) => {
    if (!socketRef.current || !myParticipantId) return;
    
    socketRef.current.emit('vote-song', {
      joinCode,
      participantId: myParticipantId,
      songId,
      value,
    });
  };

  const startParty = () => {
    if (!socketRef.current || !myParticipantId) return;
    
    socketRef.current.emit('start-party', {
      joinCode,
      participantId: myParticipantId,
    });
  };

  const nextSong = () => {
    if (!socketRef.current || !myParticipantId) return;
    
    socketRef.current.emit('next-song', {
      joinCode,
      participantId: myParticipantId,
    });
  };

  const endParty = () => {
    if (!socketRef.current || !myParticipantId) return;
    
    socketRef.current.emit('end-party', {
      joinCode,
      participantId: myParticipantId,
    });
  };

  return {
    party,
    connected,
    myParticipantId,
    isHost,
    join,
    rejoin,
    addSong,
    vote,
    startParty,
    nextSong,
    endParty,
    error,
    winner,
  };
}