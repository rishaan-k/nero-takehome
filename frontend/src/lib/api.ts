const API_BASE = 'http://localhost:3000';

interface CreatePartyRequest {
  name: string;
  hostName: string;
  maxSongs?: number;
  maxDuration?: number;
}

interface CreatePartyResponse {
  party: any;
  joinCode: string;
  participantId: string;
}

interface GetPartyResponse {
  party: any;
}

interface SearchSongsResponse {
  results: Array<{
    externalId: string;
    title: string;
    artist: string;
    artworkUrl: string;
    previewUrl: string;
  }>;
}

export async function createParty(data: CreatePartyRequest): Promise<CreatePartyResponse> {
  const response = await fetch(`${API_BASE}/api/parties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create party' }));
    throw new Error(error.error || 'Failed to create party');
  }

  return response.json();
}

export async function getParty(joinCode: string): Promise<GetPartyResponse> {
  const response = await fetch(`${API_BASE}/api/parties/${joinCode}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Party not found');
    }
    const error = await response.json().catch(() => ({ error: 'Failed to get party' }));
    throw new Error(error.error || 'Failed to get party');
  }

  return response.json();
}

export async function searchSongs(q: string): Promise<Array<{
  externalId: string;
  title: string;
  artist: string;
  artworkUrl: string;
  previewUrl: string;
}>> {
  const response = await fetch(`${API_BASE}/api/songs/search?q=${encodeURIComponent(q)}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Search failed' }));
    throw new Error(error.error || 'Search failed');
  }

  const data: SearchSongsResponse = await response.json();
  return data.results;
}