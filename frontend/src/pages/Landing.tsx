import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createParty } from '../lib/api';
import { saveIdentity } from '../lib/identity';

export function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Create party form state
  const [createForm, setCreateForm] = useState({
    name: '',
    hostName: '',
    maxSongs: '',
    maxDuration: '',
  });

  // Join party form state
  const [joinCode, setJoinCode] = useState('');

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.hostName.trim()) return;

    setLoading(true);

    try {
      const data = {
        name: createForm.name.trim(),
        hostName: createForm.hostName.trim(),
        ...(createForm.maxSongs && { maxSongs: parseInt(createForm.maxSongs, 10) }),
        ...(createForm.maxDuration && { maxDuration: parseInt(createForm.maxDuration, 10) }),
      };

      const response = await createParty(data);
      
      // Save identity for this party
      saveIdentity(response.joinCode, {
        participantId: response.participantId,
        name: createForm.hostName.trim(),
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

  const handleJoinParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    navigate(`/party/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-text-primary mb-3">
            nero party
          </h1>
          <p className="text-md text-text-secondary">
            Create a listening party or join an existing one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Create Party */}
          <div className="bg-bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-text-primary mb-6">Create a Party</h2>
            
            <form onSubmit={handleCreateParty} className="space-y-4">
              <div>
                <label htmlFor="party-name" className="block text-base text-text-primary mb-2">
                  Party Name
                </label>
                <input
                  id="party-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Friday Night Vibes"
                  className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="host-name" className="block text-base text-text-primary mb-2">
                  Your Name
                </label>
                <input
                  id="host-name"
                  type="text"
                  value={createForm.hostName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, hostName: e.target.value }))}
                  placeholder="Alex"
                  className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="max-songs" className="block text-sm text-text-secondary mb-2">
                    Max Songs
                  </label>
                  <input
                    id="max-songs"
                    type="number"
                    min="1"
                    value={createForm.maxSongs}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, maxSongs: e.target.value }))}
                    placeholder="20"
                    className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="max-duration" className="block text-sm text-text-secondary mb-2">
                    Max Duration (min)
                  </label>
                  <input
                    id="max-duration"
                    type="number"
                    min="1"
                    value={createForm.maxDuration}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, maxDuration: e.target.value }))}
                    placeholder="60"
                    className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !createForm.name.trim() || !createForm.hostName.trim()}
                className="w-full bg-white text-black rounded-pill px-6 py-3 text-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast mt-6"
              >
                {loading ? 'Creating...' : 'Create Party'}
              </button>
            </form>
          </div>

          {/* Join Party */}
          <div className="bg-bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-text-primary mb-6">Join a Party</h2>
            
            <form onSubmit={handleJoinParty} className="space-y-4">
              <div>
                <label htmlFor="join-code" className="block text-base text-text-primary mb-2">
                  Join Code
                </label>
                <input
                  id="join-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="ABC123"
                  className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none uppercase tracking-wider"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={!joinCode.trim()}
                className="w-full bg-white text-black rounded-pill px-6 py-3 text-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast mt-6"
              >
                Join Party
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-text-tertiary">
            A listening party where friends add songs, listen together, and crown a winning track
          </p>
        </div>
      </div>
    </div>
  );
}