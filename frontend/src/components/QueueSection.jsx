import { useState } from 'react';
import { Plus } from 'lucide-react';
import { QueueItem } from './QueueItem';

export function QueueSection({ 
  queue = [], 
  isHost = false,
  onVote,
  onAddSong,
  onSkip,
  myParticipantId
}) {
  const [sortMode, setSortMode] = useState('added'); // 'added' | 'votes'

  const unplayed = [...queue]
    .filter(s => !s.played)
    .sort((a, b) =>
      sortMode === 'votes'
        ? b.score - a.score
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const played = [...queue].filter(s => s.played);

  return (
    <div className="flex flex-col h-full md:h-full min-h-0">
      {/* Header */}
      <div className="pl-3 pr-5 mb-4 pt-4">
        {/* Label + line extending to right edge */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-aileron font-medium uppercase tracking-widest text-nero-text whitespace-nowrap">
            Queue
          </span>
          <div className="flex-1 h-[2px] bg-white" />
        </div>

        {/* Count + actions row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-aileron" style={{ color: 'var(--text-secondary)' }}>
            {unplayed.length} song{unplayed.length !== 1 ? 's' : ''} up next
          </span>
          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            <div
              className="flex items-center text-xs font-aileron"
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
            >
              {['added', 'votes'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className="px-2.5 py-1 font-medium capitalize transition-colors duration-150"
                  style={{
                    background: sortMode === mode ? 'var(--bg-elevated)' : 'transparent',
                    color: sortMode === mode ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {isHost && unplayed.length > 0 && (
              <button
                onClick={onSkip}
                className="px-3 py-1 text-xs font-aileron font-medium transition-colors duration-200"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Skip →
              </button>
            )}
            <button
              onClick={onAddSong}
              className="flex items-center gap-1.5 px-3 py-1 bg-nero-green text-black font-aileron font-medium text-xs transition-all duration-200 hover:bg-nero-green/90"
              style={{ borderRadius: 'var(--radius-pill)' }}
            >
              <Plus size={11} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Bar list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-96 md:max-h-none">
        {unplayed.length === 0 && played.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center pr-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'var(--bg-surface)',
                border: '2px dashed var(--border)',
              }}
            >
              <Plus size={22} className="text-nero-dim" />
            </div>
            <p className="text-sm font-aileron text-nero-muted mb-1">No songs yet</p>
            <p className="text-xs font-aileron text-nero-dim">Add the first song to get started</p>
          </div>
        ) : (
          <>
            {unplayed.map((song, index) => (
              <QueueItem
                key={song.id}
                song={song}
                rank={index + 1}
                isTop={index === 0}
                onVote={onVote}
                myParticipantId={myParticipantId}
              />
            ))}

            {played.length > 0 && (
              <>
                <div className="py-2 pl-4">
                  <span className="text-xs font-aileron text-nero-dim uppercase tracking-widest">
                    Played
                  </span>
                </div>
                {played.map((song) => (
                  <QueueItem
                    key={song.id}
                    song={song}
                    played
                    onVote={onVote}
                    myParticipantId={myParticipantId}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
