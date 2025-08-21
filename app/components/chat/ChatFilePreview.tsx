import FilePreview from "../filePreview/FilePreview";
import ImagePreview from "../filePreview/ImagePreview";
import VideoPreview from "../filePreview/VideoPreview";
import AudioPreview from "../filePreview/AudioPreview";
import { SOFT_DELETED_MESSAGES } from "./deletedMessage";

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
    duration?: string;
    caption?: string;
    time?: string;
}

// Hanya render caption + time, tanpa duplikasi
function CaptionWithTime( { caption, time }: { caption?: string; time?: string } )
{
    if ( !caption && !time ) return null;

    return (
        <div className="flex justify-between items-end mt-1">
            <div className={ `text-base break-words ${ caption ? "text-black" : "invisible" }` }>
                { caption || "placeholder" }
            </div>
            { time && <div className="text-xs text-gray-700 whitespace-nowrap">{ time }</div> }
        </div>
    );
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
    // Soft deleted, tampilkan hanya teks soft delete + time
    if ( isSoftDeleted )
    {
        return (
            <div className="flex justify-between items-end mt-1 text-sm text-gray-500 italic">
                <div>{ SOFT_DELETED_MESSAGES[1] }</div>
                { time && <div className="text-xs text-gray-700">{ time }</div> }
            </div>
        );
    }

    // Render file preview hanya kalau fileUrl ada
    if ( !fileUrl )
    {
        return <CaptionWithTime caption={ caption } time={ time } />;
    }

    // Render file preview sesuai tipe
    if ( isImage )
    {
        return (
            <div className="flex flex-col">
                <ImagePreview fileUrl={ fileUrl } fileName={ fileName } />
                <CaptionWithTime caption={ caption } time={ time } />
            </div>
        );
    }

    if ( isVideo )
    {
        return (
            <div className="flex flex-col">
                <VideoPreview fileUrl={ fileUrl } fileName={ fileName } duration={ duration } />
                <CaptionWithTime caption={ caption } time={ time } />
            </div>
        );
    }

    if ( isAudio )
    {
        return (
            <div className="flex flex-col">
                <AudioPreview fileUrl={ fileUrl } fileName={ fileName } duration={ duration } />
                <CaptionWithTime caption={ caption } time={ time } />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <FilePreview
                fileUrl={ fileUrl }
                fileName={ fileName }
                fileExtension={ fileExtension || "" }
                fileIcon={ fileIcon }
                onDownload={ handleDownload }
            />
            <CaptionWithTime caption={ caption } time={ time } />
        </div>
    );
}
