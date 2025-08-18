import { useEffect, useState, useCallback } from "react";
import { Play } from "lucide-react";

interface VideoPreviewProps
{
    fileUrl: string;
    fileName?: string;
    duration?: string;
    caption?: string;
    time?: string;
    isSoftDeleted?: boolean;
}

// Format durasi video
const formatDuration = ( seconds: number ): string =>
{
    if ( !isFinite( seconds ) || isNaN( seconds ) ) return "00:00";
    const minutes = Math.floor( seconds / 60 );
    const secs = Math.floor( seconds % 60 );
    return `${ minutes }:${ secs.toString().padStart( 2, "0" ) }`;
};

const ThumbnailOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/30 p-3 rounded-md flex items-center justify-center w-12 h-12">
            <Play className="w-6 h-6 text-white" />
        </div>
    </div>
);

const DurationBadge = ( { duration }: { duration: string } ) => (
    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
        { duration }
    </div>
);

const VideoModal = ( { fileUrl, onClose }: { fileUrl: string; onClose: () => void } ) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={ onClose }
    >
        <div
            className="absolute top-4 right-6 text-2xl cursor-pointer z-50"
            onClick={ onClose }
        >
            <span style={ { color: "white", fontWeight: "bold" } }>&times;</span>
        </div>

        <div onClick={ ( e ) => e.stopPropagation() } className="max-w-full max-h-screen">
            <video src={ fileUrl } controls autoPlay className="rounded shadow max-h-screen max-w-full" />
        </div>
    </div>
);

export default function VideoPreview( {
    fileUrl,
    duration = "00:00",
    caption,
    time,
    isSoftDeleted = false,
}: VideoPreviewProps )
{
    const [isModalOpen, setIsModalOpen] = useState( false );
    const [videoDuration, setVideoDuration] = useState( duration );
    const [isPortrait, setIsPortrait] = useState<boolean | null>( null );

    useEffect( () =>
    {
        const handleKeyDown = ( e: KeyboardEvent ) =>
        {
            if ( e.key === "Escape" ) setIsModalOpen( false );
        };
        document.addEventListener( "keydown", handleKeyDown );
        return () => document.removeEventListener( "keydown", handleKeyDown );
    }, [] );

    const handleLoadedMetadata = useCallback( ( e: React.SyntheticEvent<HTMLVideoElement> ) =>
    {
        const video = e.currentTarget;
        setVideoDuration( formatDuration( video.duration ) );
        setIsPortrait( video.videoHeight > video.videoWidth );
    }, [] );

    const videoClassName =
        isPortrait === null
            ? "opacity-0"
            : isPortrait
                ? "h-64 w-auto object-contain"
                : "w-full h-auto object-contain";

    if ( isSoftDeleted )
    {
        return (
            <div className="text-sm text-gray-500 italic">
                Pesan ini sudah dihapus
            </div>
        );
    }

    return (
        <>
            <div
                className="relative mb-2 cursor-pointer rounded-lg overflow-hidden w-full flex justify-center bg-green-100"
                onClick={ () => setIsModalOpen( true ) }
            >
                <video
                    src={ fileUrl || undefined }
                    onLoadedMetadata={ handleLoadedMetadata }
                    className={ videoClassName }
                    muted
                    controls={ false }
                />
                <ThumbnailOverlay />
                <DurationBadge duration={ videoDuration } />
            </div>

            {/* Caption + waktu */ }
            { ( caption || time ) && (
                <div className="flex justify-between mt-1 text-xs text-gray-500 whitespace-pre-line">
                    <div>{ caption }</div>
                    { time && <div>{ time }</div> }
                </div>
            ) }

            { isModalOpen && <VideoModal fileUrl={ fileUrl } onClose={ () => setIsModalOpen( false ) } /> }
        </>
    );
}
