import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WaveformHero } from './WaveformHero';
import { JoinModal } from './JoinModal';
import { CreateModal } from './CreateModal';
import { ShadowBackground } from './ShadowBackground';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { toast } from 'sonner';
import { createParty } from '../lib/api';
import { saveIdentity, getLastJoinedParty } from '../lib/identity';

const LogoSVG = () => (
  <h1>
    <div className="inline-flex items-center gap-3">
      <svg
        width="32"
        height="32"
        viewBox="0 0 115 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-current text-white h-12 w-auto"
      >
        <title>nero graphic</title>
        <path d="M21.7036 41.3086C25.2768 31.3858 25.6261 19.7041 24.3513 8.98464C24.0326 6.28383 24.6047 4.10193 26.0674 2.43895C28.09 0.140606 31.3506 -0.631636 34.2434 0.545117C36.0024 1.25607 37.363 2.86798 38.9627 4.19182C40.9566 5.84663 44.0395 8.80077 48.2112 13.0542C69.0128 34.2787 85.7876 65.0336 71.9485 94.8508C68.0505 103.241 61.9768 112.373 58.2014 119.048C54.5976 125.428 51.8947 132.072 51.8518 139.463C51.8477 139.751 51.7981 140.037 51.7047 140.309C50.2746 144.53 47.4145 146.328 43.1242 145.702C42.8108 145.658 42.502 145.573 42.2049 145.451C19.8772 136.209 -0.440157 122.823 0.00725378 95.3902C0.19725 83.3775 4.08912 72.5844 10.4571 62.4104C14.8821 55.3315 19.0069 48.792 21.7036 41.3086ZM39.2936 25.2018C38.9382 33.9457 37.126 42.2422 33.8573 50.0913C30.9461 57.066 26.6436 63.8446 22.6414 70.2984C17.8363 78.0453 14.7963 85.9884 14.496 95.2369C13.9505 111.895 24.5168 120.739 38.3682 127.775C38.4125 127.798 38.461 127.811 38.5106 127.813C38.5602 127.816 38.6098 127.809 38.6564 127.792C38.703 127.774 38.7455 127.748 38.7813 127.713C38.8172 127.679 38.8455 127.637 38.8646 127.591C38.9096 127.477 39.2221 126.511 39.8023 124.693C43.7187 112.404 53.145 101.262 59.1207 88.0293C69.4296 65.1746 54.8243 41.5476 39.6614 25.0669C39.6325 25.0372 39.5956 25.0166 39.5552 25.0074C39.5149 24.9982 39.4727 25.0009 39.4338 25.0151C39.3949 25.0294 39.361 25.0546 39.3361 25.0877C39.3112 25.1208 39.2965 25.1604 39.2936 25.2018Z" />
        <path d="M72.5518 16.767C75.3834 16.626 77.4304 18.1276 79.2507 20.5608C96.7917 43.9242 104.71 72.6443 93.6414 100.047C90.8875 106.874 87.6228 113.071 83.8474 118.636C79.502 125.04 69.4015 121.173 70.756 113.206C70.8949 112.376 71.563 111.03 72.7602 109.167C76.8992 102.707 80.0291 95.9526 82.1497 88.9044C87.9476 69.6412 81.3345 48.5883 70.1186 32.6838C68.7028 30.6735 66.1838 27.9523 65.6568 25.4026C64.7374 20.9285 68.0532 16.9815 72.5518 16.767Z" />
        <path d="M101.027 129.284C96.663 135.18 91.5208 140.33 85.6003 144.735C79.1526 144.11 71.185 142.522 74.8808 135.37C75.2444 134.667 76.2618 133.664 77.933 132.361C82.3499 128.916 86.1641 125.02 89.3757 120.673C92.5913 116.325 95.1982 111.534 97.1962 106.3C97.9521 104.323 98.6119 103.056 99.1758 102.5C104.931 96.8741 113.971 102.433 111.274 110.008C108.802 116.959 105.386 123.384 101.027 129.284Z" />
      </svg>
      <span className="text-white text-[48px] leading-none tracking-tight select-none font-aileron">
        <span className="font-bold">nero</span>{' '}
        <span className="font-medium">party</span>
      </span>
    </div>
  </h1>
);

// How far down the logo starts before flying up
const LOGO_START_Y = 'calc(100vh - 3.5rem)';
// Where the logo rests at the top
const LOGO_TOP = '1.75rem';

export function Landing() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [phase, setPhase] = useState(reducedMotion ? 'done' : 'enter');
  const [logoAtTop, setLogoAtTop] = useState(!!reducedMotion);
  const [contentVisible, setContentVisible] = useState(!!reducedMotion);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastParty, setLastParty] = useState(null);
  const [wipePosition, setWipePosition] = useState(0);

  // Load last joined party on mount
  useEffect(() => {
    const lastJoined = getLastJoinedParty();
    setLastParty(lastJoined);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('done');
      setLogoAtTop(true);
      setContentVisible(true);
      return;
    }

    // Small delay so the initial paint at the bottom is visible before fly-up starts
    const t1 = setTimeout(() => setLogoAtTop(true), 60);
    // Start wipe after logo has decelerated to its resting position
    const t2 = setTimeout(() => {
      setPhase('wipe');
    }, 1200);
    // Wrap up — remove overlay, reveal buttons
    const t3 = setTimeout(() => {
      setPhase('done');
      setContentVisible(true);
    }, 1950);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [reducedMotion]);

  const handleCreateParty = async (data) => {
    setLoading(true);

    try {
      const response = await createParty(data);
      
      // Save identity for this party
      saveIdentity(response.joinCode, {
        participantId: response.participantId,
        name: data.hostName,
        partyName: data.name,
      });

      toast.success('Party created successfully!');

      // Navigate to the party
      navigate(`/party/${response.joinCode}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create party');
    } finally {
      setLoading(false);
      setModal(null);
    }
  };

  const handleJoinParty = (joinCode) => {
    // Navigate to party page - the join flow happens there
    navigate(`/party/${joinCode}`);
    setModal(null);
  };

  return (
    <>
      {/* ── Animated background — always behind everything ── */}
      <ShadowBackground />

      {/* ── Green intro overlay ── */}
      {phase !== 'done' && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ background: 'var(--accent-green)' }}
        >
          {phase === 'wipe' && (
            <div
              ref={(el) => {
                if (el) {
                  // Use a ref to get the actual CSS animation and sync with it
                  const animation = el.getAnimations()[0];
                  if (animation) {
                    const updateWipePosition = () => {
                      const progress = animation.currentTime / animation.effect.getTiming().duration;
                      
                      // Screen wipe position (from 0 to window width)
                      const screenWipePosition = Math.min(progress * window.innerWidth, window.innerWidth);
                      
                      // Logo is horizontally centered, so calculate when wipe reaches logo center
                      const logoCenterX = window.innerWidth / 2;
                      
                      // Only start logo wipe when screen wipe reaches the logo center
                      if (screenWipePosition >= logoCenterX) {
                        // Calculate how far past the logo center we are
                        const logoWipeProgress = (screenWipePosition - logoCenterX) / (window.innerWidth - logoCenterX);
                        const logoWipePosition = logoWipeProgress * logoCenterX; // Wipe from logo center to logo end
                        setWipePosition(logoWipePosition);
                      } else {
                        // Haven't reached logo yet, keep logo fully inverted
                        setWipePosition(0);
                      }
                      
                      if (animation.playState === 'running') {
                        requestAnimationFrame(updateWipePosition);
                      }
                    };
                    
                    // Start updating immediately
                    updateWipePosition();
                  }
                }
              }}
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                animation: 'wipeIn 0.7s cubic-bezier(0.76, 0, 0.24, 1) forwards',
              }}
            >
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ background: 'var(--bg)' }}
              />
              <ShadowBackground />
            </div>
          )}
        </div>
      )}

      {/* ── Logo — fixed above everything, animates from bottom → top ── */}
      <div
        className="fixed left-1/2 z-50 pointer-events-none"
        style={{
          top: LOGO_TOP,
          // translateX(-50%) keeps it centered; translateY drives the fly-in
          transform: `translateX(-50%) translateY(${logoAtTop ? '0px' : LOGO_START_Y})`,
          transition: logoAtTop
            ? 'transform 1.05s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'none',
        }}
      >
        {/* Base logo - black during enter/wipe, white when done */}
        <div
          style={{
            filter: phase === 'done' ? 'invert(0)' : 'invert(1)',
          }}
        >
          <LogoSVG />
        </div>
        {/* White logo overlay - only during wipe phase with clip */}
        {phase === 'wipe' && wipePosition > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              filter: 'invert(0)', // White logo
              clipPath: `polygon(0 0, ${wipePosition}px 0, ${wipePosition}px 100%, 0 100%)`,
            }}
          >
            <LogoSVG />
          </div>
        )}
      </div>

      {/* ── Wave Background (full screen) ── */}
      <div className="absolute inset-0 z-0">
        <WaveformHero visible={contentVisible} />
      </div>

      {/* ── Main page (centered content) ── */}
      <main className="w-screen h-screen overflow-hidden flex flex-col items-center relative z-10">
        {/* Central content container with constrained width */}
        <div className="flex flex-col items-center max-w-sm w-full px-6 mt-32">
          {/* Subheading */}
          <div
            className="shrink-0 mb-8"
            style={{
              opacity: contentVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-out 0.2s',
            }}
          >
            <p className="text-white font-aileron font-bold text-lg text-center">
              Join thousands of live music queues and discover your next <span className="text-nero-green">favorite artist</span>
            </p>
          </div>

          {/* Buttons */}
          <div
            className="shrink-0 flex flex-col gap-3 w-full"
            style={{
              opacity: contentVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            <button
              onClick={() => setModal('join')}
              className="w-full px-7 bg-nero-green text-black font-aileron font-medium text-sm transition-all duration-200 hover:bg-opacity-90"
              style={{ height: '44px', borderRadius: 'var(--radius-pill)' }}
            >
              Join a party
            </button>
            <button
              onClick={() => setModal('create')}
              className="w-full px-7 bg-white text-black font-aileron font-medium text-sm transition-all duration-200 hover:bg-gray-200"
              style={{ height: '44px', borderRadius: 'var(--radius-pill)' }}
            >
              Create a party
            </button>

            {/* Rejoin Last Party */}
            {lastParty && contentVisible && (
              <button
                onClick={() => navigate(`/party/${lastParty.joinCode}`)}
                className="w-full px-7 bg-white text-black font-aileron font-medium text-sm transition-all duration-200 hover:bg-gray-200"
                style={{ height: '44px', borderRadius: 'var(--radius-pill)' }}
              >
                Rejoin {lastParty.partyName}
              </button>
            )}
          </div>
        </div>
      </main>

      <JoinModal 
        isOpen={modal === 'join'} 
        onClose={() => setModal(null)} 
        onSubmit={handleJoinParty}
      />
      <CreateModal 
        isOpen={modal === 'create'} 
        onClose={() => setModal(null)} 
        onSubmit={handleCreateParty}
        loading={loading}
      />
    </>
  );
}