import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Play, Search, Users, SkipForward, Square, ArrowLeft, Share2, ChevronDown } from 'lucide-react';
import { useParty } from '../hooks/useParty';
import { useAudio } from '../hooks/useAudio';
import { getIdentity, saveIdentity, clearIdentity, updatePartyName } from '../lib/identity';
import { searchSongs } from '../lib/api';
import { Equalizer } from '../components/Equalizer';
import { ProgressBar } from '../components/ProgressBar';
import { TapToListen } from '../components/TapToListen';
import { AudioControls } from '../components/AudioControls';
import { ShareModal } from '../components/ShareModal';
import { IconButton } from '../components/IconButton';
import { NeroLogo } from '../components/NeroLogo';
import { ThemeToggle } from '../components/ThemeToggle';

export function Party() {
  const { joinCode } = useParams<{ joinCode: string }>();
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState('');
  const [showNameGate, setShowNameGate] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRejoining, setIsRejoining] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'votes'>('order');

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

  // Get current song - must be declared before useAudio hook
  const currentSong = party?.currentSongId ? party.songs?.find(s => s.id === party.currentSongId) : null;
  
  // Get host participant for title display
  const hostParticipant = party?.participants?.find(p => p.id === party.hostId);

  // Audio management - must be called before any conditional returns
  const {
    audioRef,
    hasUserInteracted,
    isPlaying,
    isMuted,
    volume,
    handleUserInteraction,
    toggleMute,
    setVolumeLevel,
  } = useAudio({
    currentSongId: party?.currentSongId || null,
    currentStartedAt: party?.currentStartedAt || null,
    previewUrl: currentSong?.previewUrl || null,
    isActive: party?.status === 'active' && !!party?.songs?.find(s => s.id === party?.currentSongId),
  });

  // Sort songs based on selected filter - must be called before any conditional returns
  const sortedSongs = useMemo(() => {
    if (!party?.songs) return [];
    
    if (sortBy === 'votes') {
      return [...party.songs].sort((a, b) => b.score - a.score); // Highest score first
    } else {
      // Sort by creation date (order added) - use createdAt field
      return [...party.songs].sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
  }, [party?.songs, sortBy]);

  // Handle join gate logic
  useEffect(() => {
    if (!connected) return;

    const handleJoinGate = async () => {
      const identity = getIdentity(joinCode);
      
      if (identity) {
        // Try to rejoin with existing identity
        setIsRejoining(true);
        const result = await rejoin(identity.participantId);
        
        if (result.error) {
          // Rejoin failed, clear identity and show name gate
          clearIdentity(joinCode);
          setShowNameGate(true);
          setIsRejoining(false);
          // Show share modal for new join after failed rejoin
          setShowShareModal(true);
        }
        // If rejoin succeeded, we're good to go (no share modal)
      } else {
        // No identity, show name gate
        setShowNameGate(true);
        setIsRejoining(false);
        // Will show share modal after successful new join
      }
    };

    handleJoinGate();
  }, [connected, joinCode, rejoin]);

  // Update party name when party state loads
  useEffect(() => {
    if (party?.name && joinCode) {
      updatePartyName(joinCode, party.name);
    }
  }, [party?.name, joinCode]);

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
      
      // Show share modal only for new joins (not rejoins)
      if (!isRejoining) {
        setShowShareModal(true);
      }
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

  const handleLeaveParty = () => {
    navigate('/');
  };

  // Show name gate if not joined yet
  if (showNameGate || !myParticipantId) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md mx-auto glass-panel rounded-lg p-8">
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
              className="w-full px-6 py-3 text-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
              style={{
                borderRadius: '9999px',
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)'
              }}
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

  const winnerSong = winner ? party?.songs.find(s => s.id === winner) : null;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link to="/" className="text-text-primary hover:text-accent-green transition-colors duration-fast">
              <NeroLogo className="h-6 w-auto" />
            </Link>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <IconButton
                icon={ArrowLeft}
                tooltip="leave"
                onClick={handleLeaveParty}
              />
              <h1 className="text-2xl font-medium">
                <span className="text-text-primary">{party.name}</span>
                {hostParticipant && (
                  <>
                    <span className="text-text-secondary"> by </span>
                    <span style={{ color: 'var(--accent-green)' }}>{hostParticipant.name}</span>
                  </>
                )}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {party.status !== 'ended' && (
                <IconButton
                  icon={Share2}
                  tooltip="share"
                  onClick={() => setShowShareModal(true)}
                />
              )}
              {party.status !== 'ended' && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Users className="w-4 h-4" />
                  {party.participants.filter(p => p.online).length}/{party.participants.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lobby State */}
        {party.status === 'lobby' && (
          <div className="space-y-6">
            {/* Start Button for Host */}
            {isHost && (
              <div className="text-center mb-8">
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

        {/* Active State - Top Section with consistent spacing */}
        {party.status === 'active' && (
          <div className="mb-8">
            {/* Audio Element (hidden) */}
            <audio
              ref={audioRef}
              preload="auto"
            />

            {/* Autoplay Gate */}
            {party.status === 'active' && currentSong && !hasUserInteracted && (
              <div className="mb-6">
                <TapToListen onTap={handleUserInteraction} />
              </div>
            )}

            {/* Now Playing */}
            {currentSong && hasUserInteracted && (
              <div className="glass-panel rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={currentSong.artworkUrl} 
                    alt="Album art"
                    className="w-20 h-20 rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Equalizer isActive={isPlaying} />
                      <span className="bg-accent-green-bg px-2 py-1 rounded-pill text-xs font-semibold text-accent-green-text uppercase">
                        Now Playing
                      </span>
                    </div>
                    <h3 className="text-md font-medium text-text-primary truncate">{currentSong.title}</h3>
                    <p className="text-sm text-text-secondary mb-3">{currentSong.artist}</p>
                    <div className="flex items-center gap-4">
                      <ProgressBar startedAt={party.currentStartedAt || null} className="max-w-xs" />
                      <AudioControls
                        isMuted={isMuted}
                        volume={volume}
                        onToggleMute={toggleMute}
                        onVolumeChange={setVolumeLevel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Host Controls */}
            {isHost && (
              <div className="flex justify-center gap-4">
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
              <div className="glass-panel rounded-lg p-8">
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
                    <p className="text-sm text-text-secondary mb-1">submitted by {winnerSong.addedByName}</p>
                    <p className="text-sm text-accent-green font-medium">Score: {winnerSong.score}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two-Column Layout (for lobby and active) */}
        {party.status !== 'ended' && (
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
            {/* LEFT COLUMN - Songs Queue (wider) */}
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-primary">
                    Songs ({party.songs.length})
                    {party.maxSongs && ` / ${party.maxSongs}`}
                  </h3>
                  
                  {party.songs.length > 0 && (
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'order' | 'votes')}
                        className="appearance-none bg-bg-surface border border-border rounded-pill pl-3 pr-8 py-2 text-sm text-text-primary hover:bg-bg-elevated transition-colors duration-fast focus:border-accent-green focus:outline-none cursor-pointer"
                      >
                        <option value="order">Order Added</option>
                        <option value="votes">By Votes</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-text-tertiary pointer-events-none" />
                    </div>
                  )}
                </div>
                
                {party.songs.length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <p className="text-text-secondary mb-2">No songs added yet</p>
                    <p className="text-sm text-text-tertiary">Be the first to add a song to get the party started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSongs.map((song) => {
                      const userVote = getUserVote(song.votes);
                      const isCurrentSong = song.id === party.currentSongId;
                      
                      return (
                        <div 
                          key={song.id}
                          className={`bg-bg rounded-md p-4 ${
                            isCurrentSong 
                              ? 'border-[1.5px]' 
                              : 'border border-border'
                          }`}
                          style={isCurrentSong ? { borderColor: 'var(--accent-green)' } : {}}
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
                                {isCurrentSong && <Equalizer size="sm" isActive={isPlaying} />}
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
            </div>

            {/* RIGHT COLUMN - Participants and Add Songs (narrower) */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="glass-panel rounded-lg p-6">
                <h3 className="text-lg font-medium text-text-primary mb-4">
                  Participants ({party.participants.length})
                </h3>
                
                <div className="space-y-2">
                  {party.participants.map(participant => {
                    const isHost = participant.id === party.hostId;
                    const isCurrentUser = participant.id === myParticipantId;
                    
                    return (
                      <div key={participant.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${participant.online ? 'bg-accent-green' : 'bg-text-tertiary'}`} />
                        <span 
                          className="text-sm"
                          style={{ 
                            color: isHost ? 'var(--accent-green)' : 'var(--text-primary)' 
                          }}
                        >
                          {participant.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-text-secondary">(you)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Songs */}
              <div className="glass-panel rounded-lg p-6">
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
                      className="px-4 py-3 bg-accent-green text-white rounded-sm text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
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
          </div>
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          joinCode={party.joinCode}
        />

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}