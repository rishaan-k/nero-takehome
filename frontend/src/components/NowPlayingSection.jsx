import { Play, Pause, SkipBack, SkipForward, StopCircle, Volume2, VolumeX, Share2, Users, Copy, Check } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Modal } from './Modal';

const BAR_COUNT = 30;
const NOW_PLAYING_HEIGHT = 416; // px — consistent across all states

function buildWaveform(count) {
  return Array.from({ length: count }, (_, i) => {
    const v =
      Math.sin(i * 2.3) * 0.4 +
      Math.sin(i * 0.8) * 0.35 +
      Math.sin(i * 0.25) * 0.25;
    return Math.round(10 + ((v + 1) / 2) * 28);
  });
}

function barColor(height) {
  if (height >= 30) return 'var(--accent-green)';
  if (height >= 20) return 'var(--text-secondary)';
  return 'var(--text-tertiary)';
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getInitials(str) {
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function NowPlayingSection({
  currentSong,
  isPlaying = true,
  isHost = false,
  party,
  onPlayPause,
  onPause,
  onResume,
  onSkip,
  onPrevSong,
  onEndParty,
  onAddSong,
  onParticipants,
}) {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const audioState = useAudio({
    currentSongId: currentSong?.id || null,
    currentStartedAt: party?.currentStartedAt || null,
    previewUrl: currentSong?.previewUrl || null,
    isActive: isPlaying,
    isPaused: party?.status === 'paused',
  });

  const handleUserInteraction = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      audioState.handleUserInteraction();
    }
  };

  const handleShare = () => setShowShareModal(true);

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error('Could not copy'));
  };

  useEffect(() => {
    if (!party?.currentStartedAt || !isPlaying) {
      setCurrentTime(0);
      return;
    }
    const tick = () => {
      const elapsed = (Date.now() - new Date(party.currentStartedAt).getTime()) / 1000;
      setCurrentTime(Math.min(Math.max(0, elapsed), 30));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [party?.currentStartedAt, isPlaying]);

  const waveform = useMemo(() => buildWaveform(BAR_COUNT), []);
  const playedBars = Math.round((currentTime / 30) * BAR_COUNT);

  // ── Shared header — same vertical position as Queue label ─────────────────
  const NowOnAirHeader = (
    <div className="pl-3 pr-5 pt-4 mb-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-aileron font-medium uppercase tracking-widest text-nero-text whitespace-nowrap">
          now on air
        </span>
        <div className="flex-1 h-[2px] bg-white" />
      </div>
    </div>
  );

  // ── Shared bottom panel ────────────────────────────────────────────────────
  const BottomPanel = (
    <div className="flex-shrink-0 pb-4 md:pb-6 pt-4 pl-4 md:pl-10 pr-4 md:pr-0 space-y-3" style={{ background: 'var(--bg)' }}>
      <div className="h-px" style={{ background: 'var(--border)' }} />

      {/* Host transport controls */}
      {isHost && (
        <div className="flex flex-col md:flex-row items-center gap-3 md:justify-between pt-1">
          <span
            className="text-xs font-aileron font-medium text-nero-green px-2 py-0.5"
            style={{ background: 'var(--accent-green-bg)', borderRadius: 'var(--radius-pill)' }}
          >
            HOST
          </span>

          <div className="flex items-center gap-2">
            {(() => {
              const hasPrev = party?.songs?.some(s => s.played && s.id !== party.currentSongId);
              return (
                <button
                  onClick={() => onPrevSong?.()}
                  disabled={!hasPrev}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    color: hasPrev ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    opacity: hasPrev ? 1 : 0.35,
                    cursor: hasPrev ? 'pointer' : 'not-allowed',
                  }}
                  aria-label="Previous song"
                >
                  <SkipBack size={14} />
                </button>
              );
            })()}

            {party?.status === 'active' && onPause && (
              <button
                onClick={() => { handleUserInteraction(); onPause(); }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-nero-green text-black hover:bg-nero-green/90 transition-colors"
                aria-label="Pause"
              >
                <Pause size={16} fill="currentColor" />
              </button>
            )}

            {party?.status === 'paused' && onResume && (
              <button
                onClick={() => { handleUserInteraction(); onResume(); }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-nero-green text-black hover:bg-nero-green/90 transition-colors"
                aria-label="Resume"
              >
                <Play size={16} fill="currentColor" />
              </button>
            )}

            {party?.status === 'lobby' && onPlayPause && (
              <button
                onClick={() => { handleUserInteraction(); onPlayPause(); }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-nero-green text-black hover:bg-nero-green/90 transition-colors"
                aria-label="Start party"
              >
                <Play size={16} fill="currentColor" />
              </button>
            )}

            <button
              onClick={() => onSkip?.()}
              className="flex items-center justify-center w-9 h-9 rounded-full text-nero-muted hover:text-nero-text transition-colors"
              style={{ border: '1px solid var(--border)' }}
              aria-label="Skip song"
            >
              <SkipForward size={14} />
            </button>
          </div>

          <button
            onClick={() => onEndParty?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-aileron text-red-400 hover:text-red-300 transition-colors"
            style={{ border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)' }}
          >
            <StopCircle size={12} />
            <span className="hidden sm:inline">End party</span>
            <span className="sm:hidden">End</span>
          </button>
        </div>
      )}

      {/* Action row — responsive buttons */}
      <div className="flex items-stretch gap-2">
        {[
          {
            onClick: onAddSong,
            icon: null,
            label: '+ submit a song',
            shortLabel: '+ song',
          },
          {
            onClick: onParticipants,
            icon: <Users size={14} />,
            label: `${party?.participants?.length ?? 0} people`,
            shortLabel: `${party?.participants?.length ?? 0}`,
          },
          {
            onClick: handleShare,
            icon: <Share2 size={14} />,
            label: 'share',
            shortLabel: 'share',
          },
        ].map(({ onClick, icon, label, shortLabel }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-1 items-center justify-center gap-1 md:gap-2 py-2 md:py-3 text-xs font-aileron font-medium text-nero-text transition-all duration-200"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Empty states ───────────────────────────────────────────────────────────

  const shareModalEl = (
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      party={party}
      copiedLink={copiedLink}
      copiedCode={copiedCode}
      onCopyLink={() => copyToClipboard(window.location.href, setCopiedLink)}
      onCopyCode={() => copyToClipboard(party?.joinCode ?? '', setCopiedCode)}
    />
  );

  if (!currentSong && party?.status === 'lobby') {
    return (
      <div className="flex flex-col h-full">
        {NowOnAirHeader}
        <div className="flex flex-col justify-center pl-10" style={{ height: `${NOW_PLAYING_HEIGHT}px` }}>
          <h2 className="text-4xl font-aileron font-bold text-nero-text leading-tight mb-3">
            Ready to start
          </h2>
          <p className="text-nero-muted font-aileron text-sm">
            {isHost ? 'Hit play to kick things off' : 'Waiting for the host to start'}
          </p>
        </div>
        {BottomPanel}
        <audio ref={audioState.audioRef} />
        {shareModalEl}
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="flex flex-col h-full">
        {NowOnAirHeader}
        <div className="flex flex-col justify-center pl-10" style={{ height: `${NOW_PLAYING_HEIGHT}px` }}>
          <h2 className="text-4xl font-aileron font-bold text-nero-text leading-tight mb-3">
            Queue empty
          </h2>
          <p className="text-nero-muted font-aileron text-sm">
            Add songs to keep the party going
          </p>
        </div>
        {BottomPanel}
        <audio ref={audioState.audioRef} />
        {shareModalEl}
      </div>
    );
  }

  // ── Active song ────────────────────────────────────────────────────────────

  const { title, artist, addedByName, artworkUrl } = currentSong;

  return (
    <div className="flex flex-col h-full" onClick={handleUserInteraction}>

      {/* Shared header — sits at same level as Queue label */}
      {NowOnAirHeader}

      {/* Panel 1: now playing with blurred backdrop */}
      <div
        className="relative overflow-hidden flex flex-col justify-center"
        style={{ height: `${NOW_PLAYING_HEIGHT}px` }}
      >
        <AnimatePresence mode="crossfade">
          {artworkUrl && (
            <motion.div
              key={artworkUrl}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${artworkUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(80px)',
                transform: 'scale(1.2)',
                zIndex: 0,
              }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 pl-4 md:pl-10">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            <div className="flex-shrink-0 cursor-pointer mx-auto md:mx-0">
              {artworkUrl ? (
                <img src={artworkUrl} alt={`${title} by ${artist}`} className="w-32 h-32 md:w-44 md:h-44 rounded-lg object-cover" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
              ) : (
                <div
                  className="w-32 h-32 md:w-44 md:h-44 rounded-lg flex items-center justify-center text-xl md:text-2xl font-aileron text-nero-dim"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  {getInitials(`${title} ${artist}`)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              <h2 className="text-2xl md:text-4xl font-aileron font-bold text-nero-text leading-tight mb-1">
                {title}
              </h2>
                <p className="text-sm font-aileron text-nero-text mb-3 md:mb-5">
                  {artist}<span className="text-nero-muted"> · added by </span><span className="text-white font-medium">{addedByName}</span>
                </p>

              <div className="flex flex-col md:flex-row md:items-end gap-3">
                {/* Column: waveform bars on top, volume slider below */}
                <div className="flex flex-col gap-4 flex-shrink-0">
                  <div className="flex items-end gap-[3px] justify-center md:justify-start">
                    {waveform.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: '4px', height: `${Math.max(h * 0.8, 8)}px`, borderRadius: '2px',
                          background: barColor(h),
                          opacity: i < playedBars ? 1 : 0.15,
                          transition: 'opacity 0.2s',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <button
                      onClick={e => { e.stopPropagation(); handleUserInteraction(); audioState.toggleMute(); }}
                      className="flex-shrink-0 text-nero-muted hover:text-nero-text transition-colors"
                    >
                      {audioState.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <div className="relative w-20 md:flex-1 h-[3px] rounded-full" style={{ background: 'var(--border)' }}>
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${audioState.volume * 100}%`, background: 'var(--accent-green)' }}
                      />
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={audioState.volume}
                        onChange={e => { handleUserInteraction(); audioState.setVolumeLevel(parseFloat(e.target.value)); }}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Time label and audio sync message */}
                <div className="flex flex-col items-center md:items-start gap-1">
                  <span className="text-sm font-aileron text-nero-muted whitespace-nowrap">
                    {formatTime(currentTime)} / 0:30
                  </span>
                  {!audioState.canAutoplay && (
                    <span className="text-xs font-aileron text-nero-dim">tap to sync audio</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: controls — always visible, clean bg */}
      {BottomPanel}

      <audio ref={audioState.audioRef} />
      {shareModalEl}
    </div>
  );
}

function ShareModal({ isOpen, onClose, party, copiedLink, copiedCode, onCopyLink, onCopyCode }) {
  const partyUrl = window.location.href;
  const joinCode = party?.joinCode ?? '—';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite people">
      <div className="space-y-4">
        {/* Join code */}
        <div>
          <p className="text-xs font-aileron uppercase tracking-widest text-nero-muted mb-2">Join code</p>
          <div
            className="flex items-center justify-between gap-3 px-4 py-3"
            style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
          >
            <span className="text-2xl font-aileron font-bold tracking-[0.25em] text-nero-text select-all">
              {joinCode}
            </span>
            <button
              onClick={onCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-aileron font-medium transition-colors flex-shrink-0"
              style={{
                color: copiedCode ? 'var(--accent-green)' : 'var(--text-secondary)',
                border: `1px solid ${copiedCode ? 'var(--accent-green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {copiedCode ? <Check size={12} /> : <Copy size={12} />}
              {copiedCode ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Party link */}
        <div>
          <p className="text-xs font-aileron uppercase tracking-widest text-nero-muted mb-2">Party link</p>
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
          >
            <span className="text-xs font-aileron text-nero-muted truncate flex-1 select-all">
              {partyUrl}
            </span>
            <button
              onClick={onCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-aileron font-medium transition-colors flex-shrink-0"
              style={{
                color: copiedLink ? 'var(--accent-green)' : 'var(--text-secondary)',
                border: `1px solid ${copiedLink ? 'var(--accent-green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {copiedLink ? <Check size={12} /> : <Copy size={12} />}
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
