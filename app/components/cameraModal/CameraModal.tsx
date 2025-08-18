import { useState } from "react";
import { useCameraController } from "../../hooks/camera";
import { CameraHeader } from "./CameraHeader";
import { CameraView } from "./CameraView";
import { CameraControls } from "./CameraControls";
import { CameraPreview } from "./CameraPreview";

export default function CameraModal( {
    isOpen,
    onClose,
    onCapturePhoto,
    onCaptureVideo,
}: CameraModalProps )
{
    const {
        videoRef,
        mode,
        isRecording,
        flipCamera,
        handlePhotoClick,
        handleVideoClick,
        restartCamera, // ✅ pakai ini
        error,
    } = useCameraController( { isOpen, onClose } );

    const [previewFile, setPreviewFile] = useState<File | null>( null );

    if ( !isOpen ) return null;

    // 🔒 pastikan close modal juga reset preview
    const handleClose = () =>
    {
        setPreviewFile( null );
        onClose();
    };

    const handleRetake = async () =>
    {
        setPreviewFile( null );
        await restartCamera(); // ✅ restart kamera saat undo
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */ }
            <div className="absolute inset-0 bg-black/50" onClick={ handleClose } />
            <div className="relative bg-white rounded-xl w-[550px] max-w-[90vw] shadow-2xl overflow-hidden">
                <CameraHeader mode={ mode } isRecording={ isRecording } onClose={ handleClose } />

                { previewFile ? (
                    <CameraPreview
                        file={ previewFile }
                        onRetake={ handleRetake }
                        onSend={ ( file ) =>
                        {
                            if ( mode === "photo" && onCapturePhoto ) onCapturePhoto( file );
                            if ( mode === "video" && onCaptureVideo ) onCaptureVideo( file );
                            setPreviewFile( null );
                            handleClose(); // kamera mati hanya saat modal ditutup
                        } }
                    />
                ) : (
                    <>
                        <CameraView videoRef={ videoRef } flipCamera={ flipCamera } error={ error } />
                        <CameraControls
                            mode={ mode }
                            isRecording={ isRecording }
                            handlePhotoClick={ async () =>
                            {
                                const file = await handlePhotoClick();
                                if ( file ) setPreviewFile( file );
                            } }
                            handleVideoClick={ async () =>
                            {
                                const file = await handleVideoClick();
                                if ( file ) setPreviewFile( file );
                            } }
                        />
                    </>
                ) }
            </div>
        </div>
    );
}
