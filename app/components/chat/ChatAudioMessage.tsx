import CustomAudioPlayer from "../messageInput/CustomAudioPlayer";
import { DEFAULT_SOFT_DELETED_TEXT } from "./deletedMessage";
import { MessageMenu } from "./MessageMenu";
import { ChatBubble } from "./ChatBubble";

interface ChatAudioMessageProps
{
    audioUrl: string;
    time: string;
    duration?: number;
    isSoftDeleted?: boolean;
    textStatus?: string;
    onSoftDeleteClick?: () => void;
    onDeleteClick?: () => void;
}

export default function ChatAudioMessage( {
    audioUrl,
    time,
    duration,
    isSoftDeleted,
    textStatus,
    onSoftDeleteClick,
    onDeleteClick,
}: ChatAudioMessageProps )
{
    return (
        <ChatBubble variant="media">
            <div className="flex flex-col gap-1 w-full max-w-xs">
                {/* Baris utama: play, wave, waktu, menu */ }
                <div className="flex items-center justify-between gap-3">
                    { isSoftDeleted ? (
                        <span className="text-sm text-gray-500 italic">
                            { textStatus || DEFAULT_SOFT_DELETED_TEXT }
                        </span>
                    ) : (
                        <div className="flex items-center gap-3 flex-1">
                            <CustomAudioPlayer src={ audioUrl } manualDuration={ duration } />
                            <span className="text-xs text-gray-700 whitespace-nowrap">
                                { time }
                            </span>
                        </div>
                    ) }

                    { ( onSoftDeleteClick || onDeleteClick ) && (
                        <MessageMenu
                            isSoftDeleted={ !!isSoftDeleted }
                            onSoftDeleteClick={ onSoftDeleteClick }
                            onDeleteClick={ onDeleteClick }
                        />
                    ) }
                </div>

                {/* Indikator waktu di bawah */ }
                { !isSoftDeleted && (
                    <div className="flex justify-between text-[11px] text-gray-500 pl-7">
                        <span>0:00</span>
                        <span>{ duration ? `${ Math.floor( duration / 60 ) }:${ String( Math.floor( duration % 60 ) ).padStart( 2, "0" ) }` : "--:--" }</span>
                    </div>
                ) }
            </div>
        </ChatBubble>
    );
}
