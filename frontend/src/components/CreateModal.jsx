import { useState } from 'react';
import { Modal } from './Modal';

export function CreateModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    partyName: '',
    songLimit: '10',
    maxTime: '5'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.partyName.trim()) return;

    onSubmit({
      name: formData.partyName.trim(),
      hostName: formData.name.trim(),
      maxSongs: parseInt(formData.songLimit) || 10,
      maxDuration: (parseInt(formData.maxTime) || 5) * 60
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-sm)',
  };

  const onInputFocus = (e) => {
    e.target.style.borderColor = 'rgba(34, 197, 94, 0.5)';
  };

  const onInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="create a party">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="user-name" 
            className="block text-xs font-aileron text-nero-muted mb-1.5"
          >
            your name
          </label>
          <input
            id="user-name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            onKeyDown={handleKeyDown}
            placeholder="your name"
            className="w-full px-3.5 py-2.5 text-sm font-aileron text-nero-text outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />
        </div>

        <div>
          <label 
            htmlFor="party-name" 
            className="block text-xs font-aileron text-nero-muted mb-1.5"
          >
            party name
          </label>
          <input
            id="party-name"
            type="text"
            value={formData.partyName}
            onChange={handleChange('partyName')}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Late Night Tapes"
            className="w-full px-3.5 py-2.5 text-sm font-aileron text-nero-text outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />
        </div>

        <div>
          <label 
            htmlFor="song-limit" 
            className="block text-xs font-aileron text-nero-muted mb-1.5"
          >
            song limit
          </label>
          <input
            id="song-limit"
            type="number"
            min="1"
            max="50"
            value={formData.songLimit}
            onChange={handleChange('songLimit')}
            onKeyDown={handleKeyDown}
            placeholder="10"
            className="w-full px-3.5 py-2.5 text-sm font-aileron text-nero-text outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
          />
        </div>

        <div>
          <label 
            htmlFor="max-time" 
            className="block text-xs font-aileron text-nero-muted mb-1.5"
          >
            max time per song
          </label>
          <div className="flex items-center">
            <input
              id="max-time"
              type="number"
              min="1"
              max="10"
              value={formData.maxTime}
              onChange={handleChange('maxTime')}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3.5 py-2.5 text-sm font-aileron text-nero-text outline-none transition-all duration-200"
              style={inputStyle}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
            <span className="pl-2 text-sm font-aileron text-nero-muted">
              min
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.name.trim() || !formData.partyName.trim()}
          className="w-full py-2.5 px-7 font-aileron font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            borderRadius: 'var(--radius-pill)',
            height: '44px',
            backgroundColor: loading || !formData.name.trim() || !formData.partyName.trim() ? '#666' : 'white',
            color: loading || !formData.name.trim() || !formData.partyName.trim() ? '#ccc' : 'black'
          }}
        >
          {loading ? 'creating...' : 'start the party →'}
        </button>
      </form>
    </Modal>
  );
}