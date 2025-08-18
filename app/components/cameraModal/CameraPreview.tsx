import { useState, useEffect } from "react";
import { CornerUpLeft, SendHorizontal, Pencil } from "lucide-react";

interface CameraPreviewProps
{
    file: File;
    onRetake: () => void;
    onSend: ( file: File, caption?: string ) => void;
}

export function CameraPreview( { file, onRetake, onSend }: CameraPreviewProps )
{
    const [url, setUrl] = useState<string | null>( null );

    useEffect( () =>
    {
        const objectUrl = URL.createObjectURL( file );
        setUrl( objectUrl );

        return () =>
        {
            URL.revokeObjectURL( objectUrl );
            setUrl( null );
        };
    }, [file] );

    const isVideo = file.type.startsWith( "video/" );

    return (
        <div className="flex flex-col items-center bg-white rounded-xl shadow-xl p-5 w-[550px] max-w-[90vw]">
            {/* Render preview hanya kalau url sudah siap */ }
            { url &&
                ( isVideo ? (
                    <video
                        src={ url }
                        controls
                        className="max-h-[400px] w-auto rounded-lg shadow-md mb-6"
                    />
                ) : (
                    <img
                        src={ url }
                        alt="Preview"
                        className="max-h-[400px] w-auto rounded-lg shadow-md mb-6"
                    />
                ) ) }

            {/* Tombol aksi bawah */ }
            <div className="flex justify-between items-center w-full">
                <button
                    onClick={ onRetake }
                    className="p-2 text-gray-700 hover:text-black"
                    title="Retake"
                >
                    <CornerUpLeft size={ 22 } />
                </button>

                <div className="flex items-center">
                    <button
                        className="p-2 text-gray-700 hover:text-black mr-5"
                        title="Add caption"
                        onClick={ () =>
                        {
                            console.log( "Tambah caption diklik" );
                        } }
                    >
                        <Pencil size={ 22 } />
                    </button>

                    <button
                        onClick={ () => onSend( file ) }
                        className="p-3 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
                        title="Send"
                    >
                        <SendHorizontal size={ 22 } />
                    </button>
                </div>
            </div>
        </div>
    );
}
