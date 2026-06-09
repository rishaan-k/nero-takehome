import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PartyNavBar } from './PartyNavBar';
import { QueueSection } from './QueueSection';
import { NowPlayingSection } from './NowPlayingSection';
import { ParticipantsModal } from './ParticipantsModal';
import { SongSearchModal } from './SongSearchModal';
import { useParty } from '../hooks/useParty';
import { getIdentity, saveIdentity } from '../lib/identity';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';

export function PartyPage() {
  const { joinCode } = useParams();
  const navigate = useNavigate();
  
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
    prevSong,
    pauseParty,
    resumeParty,
    endParty,
    error
  } = useParty(joinCode);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Track if we've attempted rejoin to prevent loops
  const [hasAttemptedRejoin, setHasAttemptedRejoin] = useState(false);

  // Try to rejoin on mount
  useEffect(() => {
    if (!joinCode || !connected || hasAttemptedRejoin) return;

    const attemptRejoin = async () => {
      setHasAttemptedRejoin(true);
      setLoading(true);
      
      // Check if we have identity for this party
      const identity = getIdentity(joinCode);
      
      if (identity) {
        const result = await rejoin(identity.participantId);
        if (result.error) {
          toast.error(result.error);
          // Clear invalid identity and prompt for name
          setJoining(true);
        } else {
          // Rejoin was successful, we should have party data now
          setJoining(false);
        }
      } else {
        // No identity found, prompt for name
        setJoining(true);
      }
      
      setLoading(false);
    };

    attemptRejoin();
  }, [joinCode, connected, hasAttemptedRejoin]); // Removed rejoin from dependencies

  // Stop loading when we have party data
  useEffect(() => {
    if (party && !joining) {
      setLoading(false);
    }
  }, [party, joining]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && connected) {
        setLoading(false);
        setJoining(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading, connected]);

  // Handle join prompt
  const handleJoin = async (name) => {
    if (!name.trim()) return;

    try {
      const participantId = await join(name.trim());
      
      // Save identity
      if (party) {
        saveIdentity(joinCode, {
          participantId,
          name: name.trim(),
          partyName: party.name
        });
      }
      
      setJoining(false);
    } catch (err) {
      toast.error(err.message || 'Failed to join party');
    }
  };

  // Find current song
  const currentSong = party?.songs?.find(song => song.id === party.currentSongId) || null;

  const handleVote = (songId, direction) => {
    const value = direction === 'up' ? 1 : -1;
    vote(songId, value);
  };

  const handleAddSong = (song) => {
    addSong(song);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-nero-bg text-nero-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nero-green mx-auto mb-4"></div>
          <p className="text-nero-muted">Loading party...</p>
        </div>
      </div>
    );
  }

  // Show join prompt
  if (joining) {
    return (
      <div className="min-h-screen bg-nero-bg text-nero-text flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-aileron font-bold mb-2">Join Party</h1>
            <p className="text-nero-muted">What's your name?</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleJoin(formData.get('name'));
          }} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Your name"
              required
              className="w-full px-4 py-3 bg-nero-surface border border-nero-border rounded-lg text-nero-text placeholder-nero-muted focus:outline-none focus:border-nero-green"
            />
            <button
              type="submit"
              className="w-full bg-nero-green text-black font-aileron font-medium py-3 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Join Party
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show winner screen when party has ended
  if (party?.status === 'ended') {
    return (
      <div className="min-h-screen bg-nero-bg text-nero-text">
        <PartyNavBar
          partyName={party.name}
          participantCount={party.participants.length}
          isLive={false}
          onBackClick={handleBack}
          onLogoClick={handleBack}
          onParticipantsClick={() => setShowParticipants(true)}
        />
        <PartyEndedScreen party={party} />
        <ParticipantsModal
          isOpen={showParticipants}
          onClose={() => setShowParticipants(false)}
          participants={party.participants}
          hostId={party.hostId}
          myParticipantId={myParticipantId}
        />
      </div>
    );
  }

  // Show error if party not found or connection error
  if (error || (!party && !loading && !joining)) {
    return (
      <div className="min-h-screen bg-nero-bg text-nero-text flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-aileron font-bold mb-2">
            {error ? 'Connection Error' : 'Party Not Found'}
          </h1>
          <p className="text-nero-muted mb-4">
            {error || 'This party doesn\'t exist or has ended.'}
          </p>
          <button
            onClick={handleBack}
            className="bg-nero-green text-black px-6 py-2 rounded-lg font-aileron font-medium hover:bg-opacity-90 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show connection status
  if (!connected) {
    return (
      <div className="min-h-screen bg-nero-bg text-nero-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nero-green mx-auto mb-4"></div>
          <p className="text-nero-muted">Connecting to party...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nero-bg text-nero-text">
      {/* Navigation */}
      <PartyNavBar
        partyName={party.name}
        participantCount={party.participants.length}
        isLive={party.status === 'active'}
        onBackClick={handleBack}
        onLogoClick={handleBack}
        onParticipantsClick={() => setShowParticipants(true)}
      />

      {/* Main Content — responsive layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] pb-6">
        {/* Now Playing — full width on mobile, left side on desktop */}
        <div className="flex-1 min-w-0 md:pr-6">
          <NowPlayingSection
            currentSong={currentSong}
            isPlaying={party.status === 'active' || party.status === 'paused'}
            isHost={isHost}
            party={party}
            onPlayPause={isHost && party.status === 'lobby' ? startParty : undefined}
            onPause={isHost && party.status === 'active' ? pauseParty : undefined}
            onResume={isHost && party.status === 'paused' ? resumeParty : undefined}
            onSkip={isHost ? () => nextSong() : undefined}
            onPrevSong={isHost ? () => prevSong() : undefined}
            onEndParty={isHost ? () => endParty() : undefined}
            onAddSong={() => setShowSongSearch(true)}
            onParticipants={() => setShowParticipants(true)}
          />
        </div>

        {/* Queue — stacked below on mobile, right side on desktop */}
        <div className="w-full md:w-[42%] flex-shrink-0 overflow-hidden md:overflow-visible">
          <QueueSection
            queue={party.songs}
            isHost={isHost}
            onVote={handleVote}
            onAddSong={() => setShowSongSearch(true)}
            onSkip={() => nextSong()}
            myParticipantId={myParticipantId}
          />
        </div>
      </div>

      {/* Modals */}
      <ParticipantsModal
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={party.participants}
        hostId={party.hostId}
        myParticipantId={myParticipantId}
        onEndParty={isHost ? () => {
          setShowParticipants(false);
          endParty();
        } : undefined}
      />

      <SongSearchModal
        isOpen={showSongSearch}
        onClose={() => setShowSongSearch(false)}
        onAddSong={handleAddSong}
      />
    </div>
  );
}

function PartyEndedScreen({ party }) {
  const winner = party?.songs?.find(s => s.id === party.winnerSongId);
  const winnerScore = winner
    ? (winner.votes ?? []).reduce((sum, v) => sum + v.value, 0)
    : null;
  const addedBy = winner
    ? party.participants?.find(p => p.id === winner.addedById)?.name
    : null;

  // Rank all songs by votes, tiebreak by oldest
  const ranked = [...(party?.songs ?? [])]
    .map(s => ({ ...s, score: (s.votes ?? []).reduce((sum, v) => sum + v.value, 0) }))
    .sort((a, b) => b.score !== a.score ? b.score - a.score : new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="relative text-nero-text">
      {/* Blurred winner art backdrop */}
      {winner?.artworkUrl && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 0,
            backgroundImage: `url(${winner.artworkUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(90px)',
            transform: 'scale(1.3)',
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>

        {/* Left: winner card — centered, fixed, no scroll */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 gap-6 md:gap-8 py-8">
          <h1 className="text-2xl md:text-4xl font-aileron font-bold text-nero-text">{party.name}</h1>

          {winner ? (
            <div className="flex flex-col items-center gap-4 md:gap-5 w-full max-w-xs">
              <div className="flex items-center gap-2 text-xs font-aileron uppercase tracking-widest" style={{ color: 'var(--accent-green)' }}>
                <Trophy size={14} />
                <span>Winner</span>
              </div>

              {winner.artworkUrl ? (
                <img
                  src={winner.artworkUrl}
                  alt={winner.title}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-xl object-cover"
                  style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                />
              ) : (
                <div
                  className="w-32 h-32 md:w-48 md:h-48 rounded-xl flex items-center justify-center text-2xl md:text-4xl font-aileron"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  {winner.title?.[0]}
                </div>
              )}

              <div className="text-center space-y-1">
                <h2 className="text-xl md:text-2xl font-aileron font-bold text-nero-text">{winner.title}</h2>
                <p className="text-nero-muted font-aileron text-sm">
                  {winner.artist}
                  {addedBy && <span> · <span className="text-nero-text">{addedBy}</span></span>}
                </p>
                {winnerScore !== null && (
                  <p className="text-sm font-aileron" style={{ color: 'var(--accent-green)' }}>
                    {winnerScore > 0 ? '+' : ''}{winnerScore} vote{Math.abs(winnerScore) !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-nero-muted font-aileron">No songs were played.</p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px md:h-auto md:w-px flex-shrink-0 md:self-stretch my-4 md:my-8" style={{ background: 'var(--border)' }} />

        {/* Right: scrollable scoreboard */}
        {ranked.length > 0 && (
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col px-6 py-4 md:py-8 overflow-hidden">
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
              <span className="text-sm font-aileron font-medium uppercase tracking-widest text-nero-text whitespace-nowrap">All songs</span>
              <div className="flex-1 h-[2px] bg-white" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-96 md:max-h-none">
              {ranked.map((song, i) => (
                <div
                  key={song.id}
                  className="flex items-center gap-2 md:gap-3 py-2 px-2 md:px-3 rounded"
                  style={{
                    background: song.id === party.winnerSongId ? 'rgba(74,222,128,0.07)' : 'transparent',
                    border: song.id === party.winnerSongId ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
                  }}
                >
                  <span className="text-xs font-aileron w-3 md:w-4 text-right flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {i + 1}
                  </span>
                  {song.artworkUrl && (
                    <img src={song.artworkUrl} alt={song.title} className="w-6 h-6 md:w-8 md:h-8 rounded object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-aileron text-nero-text truncate">{song.title}</p>
                    <p className="text-xs font-aileron text-nero-muted truncate">{song.artist}</p>
                  </div>
                  <span
                    className="text-xs font-aileron font-medium flex-shrink-0"
                    style={{ color: song.score > 0 ? 'var(--accent-green)' : 'var(--text-secondary)' }}
                  >
                    {song.score > 0 ? '+' : ''}{song.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}