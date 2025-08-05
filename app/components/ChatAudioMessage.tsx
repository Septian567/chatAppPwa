// ChatAudioMessage.tsx
import CustomAudioPlayer from "./CustomAudioPlayer";

interface ChatAudioMessageProps
{
    audioUrl: string;
    time: string;
    duration?: number;
}

export default function ChatAudioMessage( { audioUrl, time, duration }: ChatAudioMessageProps )
{
    return (
        <div className="flex justify-end mb-4">
            <div className="chat-box bg-green-100 rounded-lg px-3 py-3 shadow border border-green-300 max-w-xs sm:max-w-sm">
                <div className="flex items-end justify-between gap-3">
                    <CustomAudioPlayer src={ audioUrl } manualDuration={ duration } />
                    <span className="text-xs text-gray-700 whitespace-nowrap">{ time }</span>
                </div>
            </div>
        </div>
    );
}
