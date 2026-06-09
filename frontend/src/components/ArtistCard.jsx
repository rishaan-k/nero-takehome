import inviteImg from '../../invite2.png';

export function ArtistCard({ artist, width = 160, height = 200 }) {
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: 'var(--radius-md)',
      }}
    >
      <img
        src={artist.img || inviteImg}
        alt={artist.name}
        className="w-full h-full object-cover"
        draggable={false}
        onError={(e) => {
          // Fallback to default image if artist image fails to load
          e.target.src = inviteImg;
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 45%, transparent 75%)',
        }}
      />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="text-white font-bold text-sm leading-tight font-aileron truncate">
          {artist.name}
        </div>
        <div className="text-white/55 text-xs mt-0.5 font-aileron">
          {artist.followers} followers
        </div>
      </div>
    </div>
  );
}
