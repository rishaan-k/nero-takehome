import { useRef, useEffect, useState, useCallback } from 'react';

interface UseAudioProps {
  currentSongId: string | null;
  currentStartedAt: string | null;
  previewUrl: string | null;
  isActive: boolean;
}

export function useAudio({ currentSongId, currentStartedAt, previewUrl, isActive }: UseAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [canAutoplay, setCanAutoplay] = useState(false);

  // Handle user interaction to enable autoplay
  const handleUserInteraction = useCallback(() => {
    setHasUserInteracted(true);
    setCanAutoplay(true);
  }, []);

  // Calculate current position based on server timestamps
  const getCurrentPosition = useCallback(() => {
    if (!currentStartedAt) return 0;
    
    const startTime = new Date(currentStartedAt).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - startTime) / 1000);
    
    // Cap at 30 seconds (song duration)
    return Math.min(elapsedSeconds, 30);
  }, [currentStartedAt]);

  // Handle song changes and load new audio source imperatively
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSongId || !previewUrl) return;

    // Set new audio source and load
    audio.src = previewUrl;
    audio.load();

    let metadataListener: (() => void) | null = null;

    // Only proceed with playback if user has interacted
    if (hasUserInteracted && currentStartedAt && isActive) {
      metadataListener = () => {
        try {
          // Calculate synced position
          const startTime = new Date(currentStartedAt).getTime();
          const now = Date.now();
          const elapsedSeconds = Math.max(0, (now - startTime) / 1000);
          const targetPosition = Math.min(elapsedSeconds, 30);

          // Set position and play
          audio.currentTime = targetPosition;
          audio.play().catch((err) => {
            console.warn('Audio play failed:', err);
            setCanAutoplay(false);
            setHasUserInteracted(false);
          });
        } catch (err) {
          console.warn('Audio sync failed:', err);
        }
      };

      audio.addEventListener('loadedmetadata', metadataListener, { once: true });
    }

    return () => {
      if (metadataListener) {
        audio.removeEventListener('loadedmetadata', metadataListener);
      }
    };
  }, [currentSongId, currentStartedAt, previewUrl, hasUserInteracted, isActive, canAutoplay]);

  // Ongoing synchronization for drift correction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSongId || !currentStartedAt || !hasUserInteracted || !isActive) return;

    const syncAudio = () => {
      try {
        const targetPosition = getCurrentPosition();
        const currentTime = audio.currentTime;
        const timeDifference = Math.abs(currentTime - targetPosition);
        
        // If we're too far behind or ahead, seek to correct position
        if (timeDifference > 1) { // Allow 1 second tolerance
          audio.currentTime = targetPosition;
        }

        // Handle play/pause state
        if (isActive && audio.paused && canAutoplay) {
          audio.play().catch((err) => {
            console.warn('Audio play failed during sync:', err);
            setCanAutoplay(false);
          });
        } else if (!isActive && !audio.paused) {
          audio.pause();
        }
      } catch (err) {
        console.warn('Audio sync failed:', err);
      }
    };

    // Sync every 2 seconds to handle drift
    const syncInterval = setInterval(syncAudio, 2000);

    return () => clearInterval(syncInterval);
  }, [currentSongId, currentStartedAt, isActive, hasUserInteracted, canAutoplay, getCurrentPosition]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Update audio properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setVolumeLevel = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  return {
    audioRef,
    hasUserInteracted,
    isPlaying,
    isMuted,
    volume,
    canAutoplay,
    handleUserInteraction,
    toggleMute,
    setVolumeLevel,
  };
}