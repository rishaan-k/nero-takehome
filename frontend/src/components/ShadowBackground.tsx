import { useRef, useId, useEffect } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
  if (fromLow === fromHigh) return toLow;
  return toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow);
}

interface Props {
  /** Filled colour — defaults to the nero accent green at low opacity */
  color?: string;
  /** 1–100: how much the turbulence distorts the shape */
  scale?: number;
  /** 1–100: how fast the hue cycles (lower = slower) */
  speed?: number;
}

export function ShadowBackground({
  color = 'rgba(136, 136, 136, 0.45)',
  scale = 38,
  speed = 12,
}: Props) {
  const rawId   = useId();
  const filterId = `shadowoverlay-${rawId.replace(/:/g, '')}`;

  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hue              = useMotionValue(180);
  const animRef          = useRef<AnimationPlaybackControls | null>(null);

  const displacementScale = mapRange(scale, 1, 100, 20, 100);
  const duration          = mapRange(speed, 1, 100, 1000, 50) / 25;

  useEffect(() => {
    if (!feColorMatrixRef.current) return;
    animRef.current?.stop();
    hue.set(0);
    animRef.current = animate(hue, 360, {
      duration,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear',
      onUpdate: (v) => feColorMatrixRef.current?.setAttribute('values', String(v)),
    });
    return () => animRef.current?.stop();
  }, [duration, hue]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -displacementScale,
          filter: `url(#${filterId}) blur(4px)`,
        }}
      >
        {/* SVG turbulence + displacement filter */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id={filterId}>
              <feTurbulence
                result="undulation"
                numOctaves={2}
                baseFrequency={`${mapRange(scale, 0, 100, 0.001, 0.0005)},${mapRange(scale, 0, 100, 0.004, 0.002)}`}
                seed="0"
                type="turbulence"
              />
              <feColorMatrix
                ref={feColorMatrixRef}
                in="undulation"
                type="hueRotate"
                values="180"
              />
              <feColorMatrix
                in="dist"
                result="circulation"
                type="matrix"
                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="circulation"
                scale={displacementScale}
                result="dist"
              />
              <feDisplacementMap
                in="dist"
                in2="undulation"
                scale={displacementScale}
                result="output"
              />
            </filter>
          </defs>
        </svg>

        {/* The coloured masked shape */}
        <div
          style={{
            backgroundColor: color,
            maskImage: `url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')`,
            maskSize: 'cover',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            width: '100%',
            height: '100%',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      </div>
    </div>
  );
}
