// VideoPreview.tsx
import { useEffect, useState } from "react";

interface VideoPreviewProps
{
    fileUrl: string;
    fileName: string;
}

export default function VideoPreview( { fileUrl, fileName }: VideoPreviewProps )
{
    const [isModalOpen, setIsModalOpen] = useState( false );

    useEffect( () =>
    {
        const handleKeyDown = ( e: KeyboardEvent ) =>
        {
            if ( e.key === "Escape" ) setIsModalOpen( false );
        };
        document.addEventListener( "keydown", handleKeyDown );
        return () => document.removeEventListener( "keydown", handleKeyDown );
    }, [] );

    return (
        <>
            {/* Thumbnail video di bubble chat */ }
            <div className="mb-2 cursor-pointer" onClick={ () => setIsModalOpen( true ) }>
                <video
                    src={ fileUrl }
                    className="rounded shadow border max-w-full"
                    style={ { width: "8cm" } }
                    muted
                    controls={ false }
                />
                <p className="text-sm mt-1 truncate">{ fileName }</p>
            </div>

            {/* Modal Video */ }
            { isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={ () => setIsModalOpen( false ) }
                >
                    <div
                        className="absolute top-4 right-6 text-2xl cursor-pointer z-50"
                        onClick={ () => setIsModalOpen( false ) }
                    >
                        <span style={ { color: "white", fontWeight: "bold" } }>&times;</span>
                    </div>

                    <div onClick={ ( e ) => e.stopPropagation() } className="max-w-full max-h-screen">
                        <video
                            src={ fileUrl }
                            controls
                            autoPlay
                            className="rounded shadow max-h-screen max-w-full"
                        />
                    </div>
                </div>
            ) }
        </>
    );
}
