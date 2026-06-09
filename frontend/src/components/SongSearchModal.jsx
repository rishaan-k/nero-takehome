import { useState, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { Modal } from './Modal';
import { searchSongs } from '../lib/api';
import { toast } from 'sonner';

export function SongSearchModal({ 
  isOpen, 
  onClose, 
  onAddSong 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
    } catch (err) {
      toast.error('Failed to search songs');
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  const handleAddSong = (song) => {
    onAddSong({
      externalId: song.externalId,
      title: song.title,
      artist: song.artist,
      artworkUrl: song.artworkUrl,
      previewUrl: song.previewUrl
    });
    onClose();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a song">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search size={16} className="text-nero-muted" />
          </div>
          
          <input
            type="text"
            placeholder="Search for songs, artists..."
            value={searchQuery}
            onChange={handleQueryChange}
            className="w-full pl-10 pr-4 py-3 text-sm font-aileron text-nero-text outline-none transition-all duration-200 placeholder:text-nero-dim"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-sm)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(34, 197, 94, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
            autoFocus
          />
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {!searchQuery ? (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                style={{
                  background: 'var(--bg-surface)',
                  border: '2px dashed var(--border)'
                }}
              >
                <Search size={24} className="text-nero-dim" />
              </div>
              <p className="text-sm font-aileron text-nero-muted mb-1">
                Search for songs to add
              </p>
              <p className="text-xs font-aileron text-nero-dim">
                Start typing to find songs by title or artist
              </p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-nero-green border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm font-aileron text-nero-muted">
                Searching...
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-aileron text-nero-muted mb-1">
                No songs found
              </p>
              <p className="text-xs font-aileron text-nero-dim">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 transition-all duration-200 hover:bg-nero-surface"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {/* Album Art */}
                  <div className="flex-shrink-0">
                    {song.artworkUrl ? (
                      <img 
                        src={song.artworkUrl}
                        alt={`${song.title} by ${song.artist}`}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded flex items-center justify-center text-xs font-aileron text-nero-dim"
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        {getInitials(`${song.title} ${song.artist}`)}
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-aileron font-medium text-sm text-nero-text truncate mb-1">
                      {song.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-nero-muted">
                      <span>{song.artist}</span>
                      <span>·</span>
                      <span>0:30 preview</span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAddSong(song)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-nero-green text-black font-aileron font-medium text-xs transition-all duration-200 hover:bg-nero-green/90"
                    style={{
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="pt-3 border-t border-nero-border">
          <p className="text-xs font-aileron text-nero-dim text-center">
            Songs will be added to the end of the queue
          </p>
        </div>
      </div>
    </Modal>
  );
}