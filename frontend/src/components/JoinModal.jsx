import { useState } from 'react';
import { Modal } from './Modal';

export function JoinModal({ isOpen, onClose, onSubmit }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value.toUpperCase());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="join a party">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="party-code" 
            className="block text-xs font-aileron text-nero-muted mb-1.5"
          >
            party code
          </label>
          <input
            id="party-code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g. NEON-4821"
            maxLength={12}
            className="w-full px-3.5 py-2.5 text-sm font-aileron text-nero-text outline-none transition-all duration-200"
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
          />
          <p className="text-xs font-aileron text-nero-dim mt-2">
            Get the code from whoever's hosting.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black py-2.5 px-7 font-aileron font-medium text-sm transition-all duration-200 hover:bg-gray-200"
          style={{ 
            borderRadius: 'var(--radius-pill)',
            height: '44px'
          }}
        >
          join party →
        </button>
      </form>
    </Modal>
  );
}