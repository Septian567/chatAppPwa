import { Play, Pause } from "react-feather";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import WaveAnimation from "./WaveAnimation";

interface CustomAudioPlayerProps {
  src: string;
}

function PlayPauseButton({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="text-black">
      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
    </button>
  );
}

export default function CustomAudioPlayer({ src }: CustomAudioPlayerProps) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handleLoadedMetadata,
    formatTime,
  } = useAudioPlayer(src);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[270px] bg-transparent">
      <div className="flex items-center gap-2">
        <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />

        {/* Ganti progress bar dengan animasi wave */}
        <WaveAnimation isPlaying={isPlaying} />
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>{formatTime(currentTime)}</span>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
}
