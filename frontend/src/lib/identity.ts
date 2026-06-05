interface Identity {
  participantId: string;
  name: string;
  partyName?: string;
  lastJoined?: number; // timestamp
}

function getStorageKey(joinCode: string): string {
  return `nero:identity:${joinCode}`;
}

export function saveIdentity(joinCode: string, identity: Omit<Identity, 'lastJoined'>): void {
  try {
    const key = getStorageKey(joinCode);
    const identityWithTimestamp = {
      ...identity,
      lastJoined: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(identityWithTimestamp));
  } catch (error) {
    console.error('Failed to save identity to localStorage:', error);
  }
}

export function getIdentity(joinCode: string): Identity | null {
  try {
    const key = getStorageKey(joinCode);
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate the structure
    if (typeof parsed.participantId === 'string' && typeof parsed.name === 'string') {
      return parsed;
    }
    
    // Invalid structure, clear it
    clearIdentity(joinCode);
    return null;
  } catch (error) {
    console.error('Failed to get identity from localStorage:', error);
    return null;
  }
}

export function clearIdentity(joinCode: string): void {
  try {
    const key = getStorageKey(joinCode);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear identity from localStorage:', error);
  }
}

export function updatePartyName(joinCode: string, partyName: string): void {
  try {
    const existing = getIdentity(joinCode);
    if (existing) {
      saveIdentity(joinCode, { ...existing, partyName });
    }
  } catch (error) {
    console.error('Failed to update party name:', error);
  }
}

export function getLastJoinedParty(): { joinCode: string; partyName: string } | null {
  try {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('nero:identity:'));
    let lastJoined: { joinCode: string; partyName: string; timestamp: number } | null = null;
    
    for (const key of allKeys) {
      const stored = localStorage.getItem(key);
      if (!stored) continue;
      
      const parsed = JSON.parse(stored);
      if (parsed.lastJoined && parsed.partyName) {
        const joinCode = key.replace('nero:identity:', '');
        if (!lastJoined || parsed.lastJoined > lastJoined.timestamp) {
          lastJoined = {
            joinCode,
            partyName: parsed.partyName,
            timestamp: parsed.lastJoined
          };
        }
      }
    }
    
    return lastJoined ? { joinCode: lastJoined.joinCode, partyName: lastJoined.partyName } : null;
  } catch (error) {
    console.error('Failed to get last joined party:', error);
    return null;
  }
}