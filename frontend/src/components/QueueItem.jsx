import { ThumbsUp, ThumbsDown } from 'lucide-react';

export function QueueItem({ 
  song, 
  rank,
  isTop = false,
  played = false,
  onVote,
  myParticipantId
}) {
  const { id, title, artist, addedByName, artworkUrl, votes = [], score } = song;

  const userVote = votes.find(v => v.participantId === myParticipantId);
  const userVoteValue = userVote?.value || 0;

  const handleVote = (direction) => {
    if (!played) onVote?.(id, direction);
  };

  const getInitials = (str) =>
    str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className="group relative flex items-center w-full select-none"
      style={{
        height: '88px',
        cursor: played ? 'default' : 'pointer',
        transition: 'background 0.2s ease',
        background: played
          ? 'var(--bg)'
          : isTop
          ? '#1f2920'
          : 'var(--bg-surface)',
        opacity: played ? 0.45 : 1,
      }}
      onMouseEnter={e => {
        if (!played) e.currentTarget.style.background = '#272727';
      }}
      onMouseLeave={e => {
        if (!played) e.currentTarget.style.background = isTop ? '#1f2920' : 'var(--bg-surface)';
      }}
    >
      {/* Artwork */}
      <div className="flex-shrink-0 ml-4">
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={`${title} by ${artist}`}
            className="w-14 h-14 rounded object-cover"
            style={{ opacity: played ? 0.6 : 1 }}
          />
        ) : (
          <div
            className="w-14 h-14 rounded flex items-center justify-center text-sm font-aileron text-nero-dim"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            {getInitials(`${title} ${artist}`)}
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0 mx-3">
        <p className="font-aileron font-medium text-base text-nero-text truncate leading-tight">
          {title}
        </p>
        <p className="text-sm font-aileron text-nero-muted truncate mt-0.5">
          {artist}
          <span className="text-nero-dim"> · {addedByName}</span>
        </p>
      </div>

      {/* Score + votes */}
      {!played && (
        <div className="flex items-center gap-2 flex-shrink-0 mr-3">
          <button
            onClick={e => { e.stopPropagation(); handleVote('up'); }}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
            style={{
              color: userVoteValue === 1 ? 'var(--accent-green)' : 'var(--text-secondary)',
              background: userVoteValue === 1 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${userVoteValue === 1 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
            aria-label="Upvote"
          >
            <ThumbsUp size={13} />
          </button>

          <span
            className="text-xs font-aileron font-medium min-w-[20px] text-center"
            style={{ color: score > 0 ? 'var(--accent-green)' : score < 0 ? '#f87171' : 'var(--text-secondary)' }}
          >
            {score > 0 ? `+${score}` : score || '0'}
          </span>

          <button
            onClick={e => { e.stopPropagation(); handleVote('down'); }}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
            style={{
              color: userVoteValue === -1 ? '#f87171' : 'var(--text-secondary)',
              background: userVoteValue === -1 ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${userVoteValue === -1 ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
            aria-label="Downvote"
          >
            <ThumbsDown size={13} />
          </button>
        </div>
      )}

    </div>
  );
}
