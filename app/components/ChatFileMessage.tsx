import { useFilePreview } from "../hooks/useFilePreview";
import { ChatFilePreview } from "./ChatFilePreview";
import { MessageMenu } from "./MessageMenu";

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

    const isSoftDeleted =
        caption === "Pesan telah dihapus" || caption === "Pesan ini sudah dihapus";

    return (
        <div className="flex justify-end mb-4 relative">
            <div className="chat-box bg-green-100 rounded-lg px-3 py-3 shadow border border-green-300 max-w-xs sm:max-w-sm">
                <ChatFilePreview
                    fileUrl={ fileUrl }
                    fileName={ fileName }
                    fileExtension={ fileExtension }
                    isImage={ isImage }
                    isVideo={ isVideo }
                    isAudio={ isAudio }
                    fileIcon={ fileIcon }
                    handleDownload={ handleDownload }
                    isSoftDeleted={ isSoftDeleted }
                    duration="0:00"
                    caption={ caption }
                    time={ time }
                />
            </div>

            { ( onEditClick || onSoftDeleteClick || onDeleteClick ) && (
                <MessageMenu
                    isSoftDeleted={ isSoftDeleted }
                    onEditClick={ onEditClick }
                    onSoftDeleteClick={ onSoftDeleteClick }
                    onDeleteClick={ onDeleteClick }
                />
            ) }
        </div>
    );
}
