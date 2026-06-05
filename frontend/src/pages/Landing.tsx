import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createParty } from '../lib/api';
import { saveIdentity, getLastJoinedParty } from '../lib/identity';
import { NeroLogo } from '../components/NeroLogo';
import { CreatePartyModal } from '../components/CreatePartyModal';
import { JoinPartyModal } from '../components/JoinPartyModal';
import { ThemeToggle } from '../components/ThemeToggle';

export function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [lastParty, setLastParty] = useState<{ joinCode: string; partyName: string } | null>(null);

  // Load last joined party on mount
  useEffect(() => {
    const lastJoined = getLastJoinedParty();
    setLastParty(lastJoined);
  }, []);

  const handleCreateParty = async (data: {
    name: string;
    hostName: string;
    maxSongs?: number;
    maxDuration?: number;
  }) => {
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
    }
  };

  const handleJoinParty = (joinCode: string) => {
    // Navigate to party page - the join flow happens there
    navigate(`/party/${joinCode}`);
  };

  return (
    <div className="min-h-screen bg-bg relative">
      {/* Header Section */}
      <div className="pt-12 pb-8 px-6">
        <div className="max-w-content mx-auto text-center">
          <div className="flex justify-center mb-4 animate-entrance-1">
            <Link to="/" className="text-text-primary hover:text-accent-green transition-colors duration-fast">
              <NeroLogo className="h-7 w-auto" />
            </Link>
          </div>
          <h1 className="text-3xl font-medium text-text-primary mb-3 animate-entrance-2">
            <div className="inline-flex items-center gap-3 flex-wrap justify-center">
              <span>welcome to</span>
              <span 
                className="inline-block bg-white text-black px-6 py-2 transition-all duration-200 ease-out hover:scale-[1.04] hover:shadow-lg cursor-default"
                style={{ borderRadius: '9999px' }}
              >
                nero party
              </span>
            </div>
          </h1>
          <p className="text-md text-text-secondary animate-entrance-3">
            Create a listening party or join an existing one
          </p>
        </div>
      </div>

      {/* Main Content - Absolutely Centered Buttons */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-6">
        <div className="max-w-sm mx-auto w-full">
          {/* Rejoin Last Party */}
          {lastParty && (
            <div className="flex justify-center mb-8 animate-entrance-4">
              <Link
                to={`/party/${lastParty.joinCode}`}
                className="text-sm px-4 py-2 transition-colors duration-fast"
                style={{ 
                  borderRadius: '9999px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-green)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                Rejoin {lastParty.partyName}
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-8 py-4 text-md font-medium hover:opacity-90 hover:scale-[1.02] transition-all duration-[0.2s] ease-out shadow-sm animate-entrance-5"
              style={{ 
                borderRadius: '9999px',
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)'
              }}
            >
              Create a Party
            </button>
            
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full px-8 py-4 text-md font-medium hover:opacity-80 hover:scale-[1.02] transition-all duration-[0.2s] ease-out animate-entrance-6"
              style={{ 
                borderRadius: '9999px',
                backgroundColor: 'var(--btn-secondary-bg)',
                color: 'var(--btn-secondary-text)'
              }}
            >
              Join a Party
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 px-6">
        <div className="text-center">
          <p className="text-sm text-text-tertiary">
            A listening party where friends add songs, listen together, and crown a winning track.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreatePartyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateParty}
        loading={loading}
      />

      <JoinPartyModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinParty}
        loading={loading}
      />

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}