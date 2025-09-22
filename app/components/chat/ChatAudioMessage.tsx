import CustomAudioPlayer from "../messageInput/CustomAudioPlayer";
import { MessageMenu } from "./MessageMenu";
import { ChatBubble } from "./ChatBubble";
import { SoftDeletedMessage } from "../../hooks/useSoftDelete";

interface ChatAudioMessageProps
{
    audioUrl?: string;
    time: string;
    duration?: number;
    isSoftDeleted?: boolean;
    textStatus?: string;
    align?: "left" | "right";
    onSoftDeleteClick?: () => void;
    onDeleteClick?: () => void;
    onToggleMenu?: ( isOpen: boolean ) => void;
}

export default function ChatAudioMessage( {
    audioUrl,
    time,
    duration,
    isSoftDeleted,
    textStatus,
    align = "right",
    onSoftDeleteClick,
    onDeleteClick,
    onToggleMenu,
}: ChatAudioMessageProps )
{
    return (
        <ChatBubble variant="media" align={ align }>
            <div className="flex flex-col gap-1 w-full max-w-xs">
                {/* Baris utama: audio player / soft delete, waktu, menu */ }
                <div className="flex items-center justify-between gap-1 w-full">
                    { isSoftDeleted ? (
                        // SoftDeletedMessage menampilkan icon ban + teks + waktu
                        <SoftDeletedMessage text={ textStatus || "" } time={ time } />
                    ) : (
                        <div className="flex items-center gap-3 flex-1">
                            <CustomAudioPlayer src={ audioUrl || "" } manualDuration={ duration } />
                            <span className="text-xs text-gray-700 whitespace-nowrap">{ time }</span>
                        </div>
                    ) }

                    { ( onSoftDeleteClick || onDeleteClick ) && (
                        <MessageMenu
                            isSoftDeleted={ !!isSoftDeleted }
                            onSoftDeleteClick={ onSoftDeleteClick }
                            onDeleteClick={ onDeleteClick }
                            align={ align }
                            onToggle={ onToggleMenu }
                        />
                    ) }
                </div>
            </div>
        </ChatBubble>
    );
}
