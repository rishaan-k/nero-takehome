interface Identity {
  participantId: string;
  name: string;
}

function getStorageKey(joinCode: string): string {
  return `nero:identity:${joinCode}`;
}

export function saveIdentity(joinCode: string, identity: Identity): void {
  try {
    const key = getStorageKey(joinCode);
    localStorage.setItem(key, JSON.stringify(identity));
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