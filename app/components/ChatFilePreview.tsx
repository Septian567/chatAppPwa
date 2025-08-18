import FilePreview from "./FilePreview";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import AudioPreview from "./AudioPreview";

interface ChatFilePreviewProps
{
    fileUrl: string;
    fileName: string;
    fileExtension?: string;
    isImage: boolean;
    isVideo: boolean;
    isAudio: boolean;
    fileIcon: JSX.Element;
    handleDownload: () => void;
    isSoftDeleted: boolean;
    duration?: string; // durasi dalam format "mm:ss"
    caption?: string;
    time?: string;
}

export function ChatFilePreview( {
    fileUrl,
    fileName,
    fileExtension,
    isImage,
    isVideo,
    isAudio,
    fileIcon,
    handleDownload,
    isSoftDeleted,
    duration,
    caption,
    time,
}: ChatFilePreviewProps )
{
    if ( isSoftDeleted )
    {
        return (
            <div className="text-sm text-gray-500 flex justify-between items-start">
                <div className="italic">Pesan ini sudah dihapus</div>
                { time && <div className="text-xs text-black mt-1">{ time }</div> }
            </div>
        );
    }

    if ( isImage )
    {
        return (
            <div className="flex flex-col">
                <ImagePreview fileUrl={ fileUrl } fileName={ fileName } />
                { caption && (
                    <div className="text-xs text-gray-500 mt-1 break-words">
                        { caption }
                    </div>
                ) }
                { time && (
                    <div className="text-xs text-black mt-1 self-end">
                        { time }
                    </div>
                ) }
            </div>
        );
    }

    if ( isVideo )
        return (
            <VideoPreview
                fileUrl={ fileUrl }
                fileName={ fileName }
                duration={ duration }
                caption={ caption }
                time={ time }
                isSoftDeleted={ isSoftDeleted }
            />
        );

    if ( isAudio )
        return (
            <AudioPreview
                fileUrl={ fileUrl }
                fileName={ fileName }
                duration={ duration }
            />
        );

    return (
        <FilePreview
            fileUrl={ fileUrl }
            fileName={ fileName }
            fileExtension={ fileExtension || "" }
            fileIcon={ fileIcon }
            onDownload={ handleDownload }
        />
    );
}


