import { useMemo } from "react";

export function useFilePreview( fileUrl: string | null, fileName: string | null, mimeType?: string )
{
    // Ekstensi file
    const fileExtension = useMemo( () =>
    {
        if ( !fileName ) return "";
        return fileName.split( "." ).pop()?.toLowerCase() || "";
    }, [fileName] );

    // Tentukan tipe file berdasarkan extension + mimeType
    const isImage = useMemo(
        () =>
            ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes( fileExtension ),
        [fileExtension]
    );

    const isVideo = useMemo( () =>
    {
        // Tambahkan mimeType pengecekan untuk video
        if ( mimeType?.startsWith( "video/" ) ) return true;
        return ["mp4", "webm", "ogg"].includes( fileExtension );
    }, [fileExtension, mimeType] );

    const isAudio = useMemo( () =>
    {
        // Tambahkan mimeType pengecekan untuk audio
        if ( mimeType?.startsWith( "audio/" ) ) return true;
        // Tambahkan webm sebagai audio jika mimeType audio
        return ["mp3", "wav", "ogg", "aac", "m4a", "webm"].includes( fileExtension );
    }, [fileExtension, mimeType] );

    const fileIcon = useMemo( () =>
    {
        if ( isImage ) return "🖼️";
        if ( isVideo ) return "🎞️";
        if ( isAudio ) return "🎵";
        if ( fileExtension === "pdf" ) return "📄";
        if ( ["doc", "docx"].includes( fileExtension ) ) return "📝";
        return "📎";
    }, [fileExtension, isImage, isVideo, isAudio] );

    const handleDownload = async () =>
    {
        if ( !fileUrl || !fileName )
        {
            alert( "File tidak tersedia untuk diunduh." );
            return;
        }

        try
        {
            const response = await fetch( fileUrl );
            const blob = await response.blob();

            if ( "showSaveFilePicker" in window )
            {
                const extension = fileExtension || "";
                try
                {
                    const handle = await ( window as any ).showSaveFilePicker( {
                        suggestedName: fileName,
                        types: [
                            {
                                description: `${ extension.toUpperCase() } File`,
                                accept: { [`application/${ extension }`]: [`.${ extension }`] },
                            },
                        ],
                    } );

                    const writable = await handle.createWritable();
                    await writable.write( blob );
                    await writable.close();
                } catch ( err: any )
                {
                    if ( err.name !== "AbortError" )
                    {
                        console.error( "Gagal saat menyimpan file:", err );
                        alert( "Gagal menyimpan file." );
                    }
                }
            } else
            {
                const link = document.createElement( "a" );
                link.href = URL.createObjectURL( blob );
                link.download = fileName;
                document.body.appendChild( link );
                link.click();
                document.body.removeChild( link );
                URL.revokeObjectURL( link.href );
            }
        } catch ( error )
        {
            console.error( "Gagal mengunduh file:", error );
            alert( "Gagal mengunduh file." );
        }
    };

    return {
        fileExtension,
        isImage,
        isVideo,
        isAudio,
        fileIcon,
        handleDownload,
    };
}
