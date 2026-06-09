import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArtistCard } from './ArtistCard';
import { artists } from '../data/artists';

const WAVE_AMPLITUDE = 200; // Dramatic vertical wave height
const CARD_DURATION = 18000; // 18 seconds to traverse screen (in ms)
const SPAWN_INTERVAL = 1450; // Spawn every 1.45 seconds (in ms)
const CARD_WIDTH = 160; // Card width for removal calculations

export function WaveformHero({ visible = false }) {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const spawnTimeoutRef = useRef(null);
  const artistIndexRef = useRef(0);
  const nextCardIdRef = useRef(1);
  const startTimeRef = useRef(null);
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [activeCards, setActiveCards] = useState([]);
  
  // Update container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerWidth(width);
        setContainerHeight(height);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate card position based on age and current time
  const calculateCardPosition = useCallback((spawnTime, currentTime, initialProgress = 0) => {
    if (!containerWidth || !containerHeight) return { x: -CARD_WIDTH, y: 0, rotate: 0, visible: false };

    const age = currentTime - spawnTime;
    const progress = Math.min(initialProgress + (age / CARD_DURATION), 1);
    
    // Position calculation: start from initial progress, move to right
    const x = progress * (containerWidth + CARD_WIDTH * 2) - CARD_WIDTH;
    
    // Sine wave calculation
    const wavePhase = progress * Math.PI * 2 - Math.PI / 2;
    const y = Math.sin(wavePhase) * WAVE_AMPLITUDE + containerHeight / 2 - 150;
    
    // Rotation based on wave tangent
    const tangent = Math.cos(wavePhase);
    const rotation = Math.atan(tangent * 0.3) * (180 / Math.PI);
    
    // Visibility and removal logic
    const shouldRemove = x > containerWidth + CARD_WIDTH;
    const visible = x > -CARD_WIDTH && x < containerWidth + CARD_WIDTH;
    
    return { x, y, rotate: rotation, shouldRemove, visible };
  }, [containerWidth, containerHeight]);

  // Spawn a new card
  const spawnCard = useCallback(() => {
    const currentTime = performance.now();
    const artist = artists[artistIndexRef.current % artists.length];
    
    const newCard = {
      id: nextCardIdRef.current++,
      artist,
      spawnTime: currentTime,
      initialProgress: -0.08, // Start slightly off-screen left
    };
    
    setActiveCards(prev => [...prev, newCard]);
    artistIndexRef.current++;
  }, []);

  // Schedule next card spawn
  const scheduleNextSpawn = useCallback(() => {
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
    }
    
    spawnTimeoutRef.current = setTimeout(() => {
      spawnCard();
      scheduleNextSpawn();
    }, SPAWN_INTERVAL);
  }, [spawnCard]);

  // Initialize wave and start continuous spawning
  useEffect(() => {
    if (!visible || !containerWidth || !containerHeight) {
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }
      setActiveCards([]);
      return;
    }

    startTimeRef.current = performance.now();
    const cards = [];
    const cardSpacing = 0.08; // Progress spacing between cards (8% of screen)
    
    // Create initial wave across screen
    for (let i = 0; i < Math.ceil(1 / cardSpacing) + 2; i++) {
      const initialProgress = i * cardSpacing - cardSpacing; // Start some off-screen left
      const artist = artists[i % artists.length];
      
      cards.push({
        id: i,
        artist,
        spawnTime: startTimeRef.current,
        initialProgress,
      });
      
      artistIndexRef.current++;
      nextCardIdRef.current++;
    }
    
    setActiveCards(cards);
    
    // Start continuous spawning
    scheduleNextSpawn();

    return () => {
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }
    };
  }, [visible, containerWidth, containerHeight, scheduleNextSpawn]);

  // Animation loop for updating card positions
  useEffect(() => {
    if (!visible || !containerWidth || !containerHeight || activeCards.length === 0) return;

    const updateCards = () => {
      const currentTime = performance.now();
      
      setActiveCards(prev => 
        prev
          .map(card => ({
            ...card,
            ...calculateCardPosition(card.spawnTime, currentTime, card.initialProgress)
          }))
          .filter(card => !card.shouldRemove)
      );
      
      animationFrameRef.current = requestAnimationFrame(updateCards);
    };

    updateCards();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, containerWidth, containerHeight, activeCards.length, calculateCardPosition]);

  if (!visible) {
    return <section ref={containerRef} className="relative w-full h-full overflow-hidden" />;
  }

  return (
    <section ref={containerRef} className="relative w-full h-full overflow-hidden">
      {activeCards
        .filter(card => card.visible)
        .map(card => (
          <motion.div
            key={card.id}
            className="absolute"
            style={{
              x: card.x,
              y: card.y,
              rotate: card.rotate,
              transformOrigin: 'center center',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              opacity: { duration: 0.3, ease: "easeOut" },
              scale: { duration: 0.3, ease: "easeOut" }
            }}
          >
            <ArtistCard artist={card.artist} width={160} height={200} />
          </motion.div>
        ))
      }
    </section>
  );
}
