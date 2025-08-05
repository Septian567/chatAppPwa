// ImagePreview.tsx
import { useEffect, useState } from "react";

interface ImagePreviewProps
{
    fileUrl: string;
    fileName: string;
}

export default function ImagePreview( { fileUrl, fileName }: ImagePreviewProps )
{
    const [isModalOpen, setIsModalOpen] = useState( false );
    const [scale, setScale] = useState( 1 );

    useEffect( () =>
    {
        const handleKeyDown = ( e: KeyboardEvent ) =>
        {
            if ( e.key === "Escape" ) setIsModalOpen( false );
        };
        document.addEventListener( "keydown", handleKeyDown );
        return () => document.removeEventListener( "keydown", handleKeyDown );
    }, [] );

    const handleWheel = ( e: React.WheelEvent ) =>
    {
        e.preventDefault();
        setScale( prev => Math.max( 0.5, Math.min( 3, prev + ( e.deltaY > 0 ? -0.1 : 0.1 ) ) ) );
    };

    return (
        <>
            <div className="mb-2 cursor-pointer" onClick={ () => { setIsModalOpen( true ); setScale( 1 ); } }>
                <img src={ fileUrl } alt={ fileName } style={ { width: "8cm" } } className="rounded shadow border" />
            </div>

            { isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={ () => setIsModalOpen( false ) }>
                    <div className="absolute top-4 right-6 text-2xl cursor-pointer z-50" onClick={ () => setIsModalOpen( false ) }>
                        <span style={ { color: "white", fontWeight: "bold" } }>&times;</span>
                    </div>
                    <div onClick={ ( e ) => e.stopPropagation() } onWheel={ handleWheel }>
                        <img src={ fileUrl } alt={ fileName } className="rounded shadow max-h-screen max-w-full transition-transform" style={ { transform: `scale(${ scale })` } } />
                    </div>
                </div>
            ) }
        </>
    );
}
