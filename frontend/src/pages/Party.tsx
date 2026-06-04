import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, ThumbsUp, ThumbsDown, Play, Search, Users, SkipForward, Square } from 'lucide-react';
import { toast } from 'sonner';
import { useParty } from '../hooks/useParty';
import { getIdentity, saveIdentity, clearIdentity } from '../lib/identity';
import { searchSongs } from '../lib/api';
import { Equalizer } from '../components/Equalizer';
import { ProgressBar } from '../components/ProgressBar';

export function Party() {
  const { joinCode } = useParams<{ joinCode: string }>();
  const [nameInput, setNameInput] = useState('');
  const [showNameGate, setShowNameGate] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  if (!joinCode) {
    return <div>Invalid party URL</div>;
  }

  const {
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
    winner,
  } = useParty(joinCode);

  // Handle join gate logic
  useEffect(() => {
    if (!connected) return;

    const handleJoinGate = async () => {
      const identity = getIdentity(joinCode);
      
      if (identity) {
        // Try to rejoin with existing identity
        const result = await rejoin(identity.participantId);
        
        if (result.error) {
          // Rejoin failed, clear identity and show name gate
          clearIdentity(joinCode);
          setShowNameGate(true);
        }
        // If rejoin succeeded, we're good to go
      } else {
        // No identity, show name gate
        setShowNameGate(true);
      }
    };

    handleJoinGate();
  }, [connected, joinCode, rejoin]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || joining) return;

    setJoining(true);
    try {
      const participantId = await join(nameInput.trim());
      saveIdentity(joinCode, {
        participantId,
        name: nameInput.trim(),
      });
      setShowNameGate(false);
    } catch (err) {
      console.error('Failed to join party:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleSearchSongs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;

    setSearching(true);
    try {
      const results = await searchSongs(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddSong = (song: any) => {
    addSong(song);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleVote = (songId: string, value: number) => {
    vote(songId, value);
  };

  const getUserVote = (songVotes: any[]) => {
    return songVotes.find(v => v.participantId === myParticipantId)?.value || 0;
  };

  const getShareableLink = () => {
    return `${window.location.origin}/party/${joinCode}`;
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      toast.success('Join code copied!');
    }
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    toast.success('Link copied!');
  };

  // Show name gate if not joined yet
  if (showNameGate || !myParticipantId) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md mx-auto bg-bg-surface border border-border rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-medium text-text-primary mb-2">Join Party</h1>
            <p className="text-sm text-text-secondary">Enter your name to join the listening party</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-base text-text-primary mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                required
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              disabled={joining || !nameInput.trim()}
              className="w-full bg-white text-black rounded-pill px-6 py-3 text-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
            >
              {joining ? 'Joining...' : 'Join Party'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show loading until party state arrives
  if (!party) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-pulse flex space-x-1">
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
              <div className="equalizer-bar"></div>
            </div>
          </div>
          <h1 className="text-lg text-text-primary mb-2">Loading party...</h1>
          {!connected && <p className="text-sm text-text-secondary">Connecting...</p>}
        </div>
      </div>
    );
  }

  const currentSong = party.currentSongId ? party.songs.find(s => s.id === party.currentSongId) : null;
  const winnerSong = winner ? party.songs.find(s => s.id === winner) : null;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-medium text-text-primary">{party.name}</h1>
            {party.status !== 'ended' && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4" />
                {party.participants.filter(p => p.online).length}/{party.participants.length}
              </div>
            )}
          </div>
        </div>

        {/* Lobby State */}
        {party.status === 'lobby' && (
          <div className="space-y-6">
            {/* Join Code Section */}
            <div className="bg-bg-surface border border-border rounded-lg p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4">Share this party</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-text-secondary">Code:</span>
                    <span className="bg-bg-elevated px-3 py-1 rounded-md text-md font-medium text-text-primary tracking-wider">
                      {party.joinCode}
                    </span>
                  </div>
                  <button
                    onClick={copyJoinCode}
                    className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-fast"
                    title="Copy join code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-bg-elevated border border-border rounded-sm px-3 py-2 text-sm text-text-secondary">
                    {getShareableLink()}
                  </div>
                  <button
                    onClick={copyShareableLink}
                    className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-fast"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Start Button for Host */}
            {isHost && (
              <div className="text-center">
                <button
                  onClick={startParty}
                  disabled={party.songs.length === 0}
                  className="bg-accent-green text-white px-8 py-3 rounded-pill text-md font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast flex items-center gap-2 mx-auto"
                >
                  <Play className="w-4 h-4" />
                  Start Party
                </button>
                {party.songs.length === 0 && (
                  <p className="text-sm text-text-tertiary mt-2">Add some songs first</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active State */}
        {party.status === 'active' && (
          <div className="space-y-6">
            {/* Now Playing */}
            {currentSong && (
              <div className="bg-bg-surface border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={currentSong.artworkUrl} 
                    alt="Album art"
                    className="w-20 h-20 rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Equalizer isActive={true} />
                      <span className="bg-accent-green-bg px-2 py-1 rounded-pill text-xs font-semibold text-accent-green-text uppercase">
                        Now Playing
                      </span>
                    </div>
                    <h3 className="text-md font-medium text-text-primary truncate">{currentSong.title}</h3>
                    <p className="text-sm text-text-secondary mb-3">{currentSong.artist}</p>
                    <ProgressBar startedAt={party.currentStartedAt || null} className="max-w-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Host Controls */}
            {isHost && (
              <div className="flex gap-3">
                <button
                  onClick={nextSong}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border rounded-pill text-sm text-text-primary hover:bg-bg-elevated transition-colors duration-fast"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Song
                </button>
                <button
                  onClick={endParty}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border rounded-pill text-sm text-text-primary hover:bg-bg-elevated transition-colors duration-fast"
                >
                  <Square className="w-4 h-4" />
                  End Party
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ended State */}
        {party.status === 'ended' && (
          <div className="text-center space-y-6">
            {winnerSong && (
              <div className="bg-bg-surface border border-border rounded-lg p-8">
                <div className="mb-4">
                  <span className="bg-accent-green-bg px-3 py-1.5 rounded-pill text-sm font-semibold text-accent-green-text uppercase">
                    Winner
                  </span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={winnerSong.artworkUrl} 
                    alt="Album art"
                    className="w-32 h-32 rounded-lg"
                  />
                  <div>
                    <h3 className="text-xl font-medium text-text-primary mb-1">{winnerSong.title}</h3>
                    <p className="text-md text-text-secondary mb-2">{winnerSong.artist}</p>
                    <p className="text-sm text-accent-green font-medium">Score: {winnerSong.score}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Songs Queue (for lobby and active) */}
        {party.status !== 'ended' && (
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">
                Songs ({party.songs.length})
                {party.maxSongs && ` / ${party.maxSongs}`}
              </h3>
              
              {party.songs.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-text-secondary mb-2">No songs added yet</p>
                  <p className="text-sm text-text-tertiary">Be the first to add a song to get the party started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {party.songs.map((song) => {
                    const userVote = getUserVote(song.votes);
                    const isCurrentSong = song.id === party.currentSongId;
                    
                    return (
                      <div 
                        key={song.id}
                        className={`bg-bg border border-border rounded-md p-4 ${isCurrentSong ? 'ring-1 ring-accent-green' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <img 
                              src={song.artworkUrl} 
                              alt="Album art"
                              className="w-12 h-12 rounded-md"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isCurrentSong && <Equalizer size="sm" />}
                              <h4 className="text-sm font-medium text-text-primary truncate">{song.title}</h4>
                            </div>
                            <p className="text-xs text-text-secondary">{song.artist}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-text-primary w-8 text-center">
                              {song.score > 0 ? '+' : ''}{song.score}
                            </span>
                            
                            <button
                              onClick={() => handleVote(song.id, 1)}
                              className={`p-1.5 rounded-md transition-colors duration-fast ${
                                userVote === 1 
                                  ? 'bg-accent-green-bg text-accent-green-text' 
                                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleVote(song.id, -1)}
                              className={`p-1.5 rounded-md transition-colors duration-fast ${
                                userVote === -1 
                                  ? 'bg-accent-red-bg text-accent-red-text' 
                                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Songs */}
            <div className="bg-bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Add Songs</h3>
              
              <form onSubmit={handleSearchSongs} className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for songs..."
                      className="w-full bg-bg border border-border rounded-sm pl-10 pr-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={searching || !searchQuery.trim()}
                    className="px-6 py-3 bg-white text-black rounded-sm text-base font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((song, index) => (
                    <div 
                      key={index}
                      className="bg-bg border border-border rounded-md p-3 flex items-center gap-3"
                    >
                      <img 
                        src={song.artworkUrl} 
                        alt="Album art"
                        className="w-10 h-10 rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-text-primary truncate">{song.title}</h4>
                        <p className="text-xs text-text-secondary truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => handleAddSong(song)}
                        className="px-3 py-1.5 bg-accent-green text-white rounded-pill text-xs font-medium hover:bg-green-600 transition-colors duration-fast"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="bg-bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Participants ({party.participants.length})
          </h3>
          
          <div className="space-y-2">
            {party.participants.map(participant => (
              <div key={participant.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${participant.online ? 'bg-accent-green' : 'bg-text-tertiary'}`} />
                <span className="text-sm text-text-primary">{participant.name}</span>
                {participant.id === party.hostId && (
                  <span className="bg-skip-badge-bg px-2 py-0.5 rounded-pill text-xs font-semibold text-skip-badge-text uppercase">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}