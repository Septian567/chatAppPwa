import { useFilePreview } from "../../hooks/useFilePreview";
import { ChatFilePreview } from "./ChatFilePreview";
import { MessageMenu } from "./MessageMenu";
import { isSoftDeletedMessage, DEFAULT_FILE_DELETED_TEXT } from "./deletedMessage";
import { ChatBubble } from "./ChatBubble";
import { SoftDeletedMessage } from "./SoftDeletedMessage";

interface ChatFileMessageProps
{
    fileUrl: string;
    fileName?: string;
    caption?: string;
    time: string;
    onEditClick?: () => void;
    onSoftDeleteClick?: () => void;
    onDeleteClick?: () => void;
}

export default function ChatFileMessage( {
    fileUrl,
    fileName = "Dokumen",
    caption,
    time,
    onEditClick,
    onSoftDeleteClick,
    onDeleteClick,
}: ChatFileMessageProps )
{
    const {
        fileExtension,
        isImage,
        isVideo,
        isAudio,
        fileIcon,
        handleDownload,
    } = useFilePreview( fileUrl, fileName );

    // Cek soft delete
    const isSoftDeleted = isSoftDeletedMessage( caption );

    // Caption yang ditampilkan
    const displayCaption = isSoftDeleted ? DEFAULT_FILE_DELETED_TEXT : caption;

    return (
        <ChatBubble variant="media" fixedWidth={ isSoftDeleted ? "cm" : undefined }>
            <div className="flex flex-col gap-1">
                {/* Preview file (hanya kalau belum soft delete) */ }
                { !isSoftDeleted && (
                    <ChatFilePreview
                        fileUrl={ fileUrl }
                        fileName={ fileName }
                        fileExtension={ fileExtension }
                        isImage={ isImage }
                        isVideo={ isVideo }
                        isAudio={ isAudio }
                        fileIcon={ fileIcon }
                        handleDownload={ handleDownload }
                        duration="0:00"
                    />
                ) }

                {/* Baris caption + waktu + tombol MoreVertical */ }
                <div className="flex items-end gap-3">
                    {/* Caption di kiri */ }
                    <div className="flex-1">
                        { isSoftDeleted ? (
                            <div className="flex items-left justify-left w-full min-h-[1.9rem]">
                                <SoftDeletedMessage text={ displayCaption } />
                            </div>
                        ) : (
                            <span
                                className={ `whitespace-pre-line ${ isSoftDeleted
                                        ? "text-gray-500 italic text-sm"
                                        : "text-black"
                                    }` }
                            >
                                { displayCaption }
                            </span>
                        ) }
                    </div>

                    {/* Waktu + tombol MoreVertical di kanan bawah */ }
                    { ( onEditClick || onSoftDeleteClick || onDeleteClick ) && (
                        <div className="flex items-center gap-1 self-end">
                            <span className="text-xs text-gray-700 whitespace-nowrap">
                                { time }
                            </span>
                            <MessageMenu
                                isSoftDeleted={ isSoftDeleted }
                                onEditClick={ onEditClick }
                                onSoftDeleteClick={ onSoftDeleteClick }
                                onDeleteClick={ onDeleteClick }
                            />
                        </div>
                    ) }
                </div>

            </div>
        </ChatBubble>
    );
}
