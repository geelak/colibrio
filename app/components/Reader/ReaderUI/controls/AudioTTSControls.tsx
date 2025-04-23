import React from 'react';

interface AudioTTSControlsProps {
  show: boolean;
  onClose: () => void;
  onTTSPlay: () => void;
  onTTSPause: () => void;
  onTTSStop: () => void;
  onTTSPrev: () => void;
  onTTSNext: () => void;
  ttsVoices: { label: string; value: string }[];
  ttsVoice?: string;
  onVoiceChange?: (voice: string) => void;
  ttsSpeed: number;
  onSpeedChange?: (speed: number) => void;
  ttsState: 'playing' | 'paused' | 'stopped';
  ttsSupportsNextPrev?: boolean;
}

const AudioTTSControls: React.FC<AudioTTSControlsProps> = ({
  show,
  onClose,
  onTTSPlay,
  onTTSPause,
  onTTSStop,
  onTTSPrev,
  onTTSNext,
  ttsVoices,
  ttsVoice,
  onVoiceChange,
  ttsSpeed,
  onSpeedChange,
  ttsState,
  ttsSupportsNextPrev = true,
}) => {
  return (
    <div
      className={`fixed left-0 right-0 bottom-0 w-full flex justify-center transition-all duration-300 z-50 ${
        show ? 'opacity-100 max-h-[200px] pointer-events-auto' : 'opacity-0 max-h-0 pointer-events-none'
      }`}
      style={{
        overflow: 'hidden',
      }}
    >
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-white/40 dark:border-neutral-700/60 shadow-lg p-2 backdrop-blur-md"
        style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.22)', alignItems: 'center' }}
      >
        {/* Playback controls */}
        <button onClick={onTTSPrev} title="Previous" aria-label="Previous"
          className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center"
          disabled={!ttsSupportsNextPrev}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        {ttsState === 'playing' ? (
          <button onClick={onTTSPause} title="Pause" aria-label="Pause"
            className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          </button>
        ) : (
          <button onClick={onTTSPlay} title="Play" aria-label="Play"
            className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </button>
        )}
        <button onClick={onTTSStop} title="Stop" aria-label="Stop"
          className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
        </button>
        <button onClick={onTTSNext} title="Next" aria-label="Next"
          className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center"
          disabled={!ttsSupportsNextPrev}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        {/* Playback state */}
        <span className="text-xs ml-2" style={{ minWidth: 60 }}>
          {ttsState === 'playing' ? 'Playing' : ttsState === 'paused' ? 'Paused' : 'Stopped'}
        </span>
        {/* Voice select */}
        <div className="flex items-center gap-1 ml-4">
          <label htmlFor="tts-voice-select" className="text-xs">Voice:</label>
          <select
            id="tts-voice-select"
            value={ttsVoice}
            onChange={e => onVoiceChange?.(e.target.value)}
            className="text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ minWidth: 80 }}
          >
            {ttsVoices.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        {/* Speed slider */}
        <div className="flex items-center gap-1 ml-4">
          <label htmlFor="tts-speed-slider" className="text-xs">Speed:</label>
          <input
            id="tts-speed-slider"
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={ttsSpeed}
            onChange={e => onSpeedChange?.(parseFloat(e.target.value))}
            className="flex-1 min-w-0 w-full max-w-[120px] sm:max-w-[180px] md:max-w-[240px] h-2 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700"
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <span className="text-xs" style={{ minWidth: 32 }}>{ttsSpeed.toFixed(2)}x</span>
        </div>
        {/* Optional close button */}
        <button
          onClick={onClose}
          title="Close audio controls"
          aria-label="Close audio controls"
          className="ml-4 p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AudioTTSControls; 