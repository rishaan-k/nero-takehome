import { Crown } from 'lucide-react';
import { Modal } from './Modal';

export function ParticipantsModal({ 
  isOpen, 
  onClose, 
  participants = [], 
  hostId,
  myParticipantId,
  onEndParty
}) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    // Host first, then alphabetical
    if (a.id === hostId) return -1;
    if (b.id === hostId) return 1;
    return a.name.localeCompare(b.name);
  });

  const isCurrentUserHost = hostId === myParticipantId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Participants">
      <div className="space-y-3">
        {/* Participant count */}
        <div className="text-sm font-aileron text-nero-muted mb-4">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </div>

        {/* Participants list */}
        <div className="space-y-2">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-aileron font-medium"
                  style={{
                    background: participant.id === hostId 
                      ? 'var(--accent-green)' 
                      : 'var(--bg-elevated)',
                    color: participant.id === hostId 
                      ? '#000' 
                      : 'var(--text-secondary)'
                  }}
                >
                  {getInitials(participant.name)}
                </div>
              </div>

              {/* Name and status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className={`font-aileron font-medium text-sm truncate ${
                      participant.id === hostId 
                        ? 'text-nero-green' 
                        : 'text-nero-text'
                    }`}
                  >
                    {participant.name}
                    {participant.id === myParticipantId && (
                      <span className="text-nero-muted font-normal"> (you)</span>
                    )}
                  </span>
                  
                  {participant.id === hostId && (
                    <Crown size={14} className="text-nero-green flex-shrink-0" />
                  )}
                </div>
                
                {participant.id === hostId && (
                  <div className="text-xs font-aileron text-nero-muted">
                    Host
                  </div>
                )}
              </div>

              {/* Online status indicator */}
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: participant.online ? 'var(--accent-green)' : 'var(--border)' }}
                aria-label={participant.online ? "Online" : "Offline"}
              />
            </div>
          ))}
        </div>

      </div>
    </Modal>
  );
}