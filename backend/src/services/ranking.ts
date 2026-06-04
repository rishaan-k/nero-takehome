interface Vote {
  value: number;
}

interface Song {
  id: string;
  votes: Vote[];
  createdAt: Date;
  [key: string]: any;
}

interface SongWithScore extends Song {
  score: number;
}

export function scoreSong(votes: Vote[]): number {
  return votes.reduce((sum, vote) => sum + vote.value, 0);
}

export function rankSongs(songs: Song[]): SongWithScore[] {
  const songsWithScores = songs.map(song => ({
    ...song,
    score: scoreSong(song.votes),
  }));

  // Sort by score descending, then createdAt ascending (older songs win ties)
  return songsWithScores.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Higher score first
    }
    return a.createdAt.getTime() - b.createdAt.getTime(); // Older first
  });
}

export function pickWinner(songs: Song[]): Song | null {
  const ranked = rankSongs(songs);
  return ranked.length > 0 ? ranked[0] : null;
}