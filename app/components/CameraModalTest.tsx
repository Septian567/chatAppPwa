import { X, Camera, Video, RefreshCcw, StopCircle } from "lucide-react";
import { useCameraController } from "../hooks/camera";

interface CameraModalProps
{
    isOpen: boolean;
    onClose: () => void;
    onCapturePhoto?: ( file: File ) => void;
    onCaptureVideo?: ( file: File ) => void;
}

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
        facing,
        flipCamera,
        isRecording,
        handlePhotoClick,
        handleVideoClick,
        error,
    } = useCameraController( { isOpen, onClose, onCapturePhoto, onCaptureVideo } );

    if ( !isOpen ) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={ onClose } />
            <div className="relative bg-white rounded-xl w-[640px] max-w-[90vw] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="text-lg font-semibold">
                        { mode === "photo"
                            ? "Take a photo"
                            : isRecording
                                ? "Recording video..."
                                : "Take a video" }
                    </h3>
                    <button
                        onClick={ onClose }
                        className="p-2 rounded-full hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X size={ 18 } />
                    </button>
                </div>

                <div className="p-5">
                    <div className="relative mx-auto w-full">
                        <div
                            className="relative w-full overflow-hidden rounded-lg bg-black"
                            style={ { aspectRatio: "4 / 3" } }
                        >
                            <button
                                onClick={ flipCamera }
                                className="absolute top-2 left-2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                                title="Flip camera"
                            >
                                <RefreshCcw size={ 18 } />
                            </button>

                            <video
                                ref={ videoRef }
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                    </div>
                    { error && (
                        <p className="mt-3 text-sm text-red-600 text-center">{ error }</p>
                    ) }
                </div>

                <div className="px-5 pb-5 flex justify-center gap-6">
                    { mode === "photo" ? (
                        <>
                            <button
                                onClick={ handlePhotoClick }
                                className="h-12 w-12 rounded-full flex items-center justify-center bg-green-500 text-white hover:bg-green-600"
                                title="Photo"
                            >
                                <Camera size={ 20 } />
                            </button>
                            <button
                                onClick={ handleVideoClick }
                                className={ `h-12 w-12 rounded-full flex items-center justify-center ${ mode === "video"
                                        ? isRecording
                                            ? "bg-red-600 text-white hover:bg-red-700"
                                            : "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }` }
                                title="Video"
                            >
                                { mode === "video" && isRecording ? (
                                    <StopCircle size={ 22 } />
                                ) : (
                                    <Video size={ 20 } />
                                ) }
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={ handleVideoClick }
                                className={ `h-12 w-12 rounded-full flex items-center justify-center ${ isRecording
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-green-500 text-white hover:bg-green-600"
                                    }` }
                                title="Video"
                            >
                                { isRecording ? <StopCircle size={ 22 } /> : <Video size={ 20 } /> }
                            </button>
                            <button
                                onClick={ handlePhotoClick }
                                className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300"
                                title="Photo"
                            >
                                <Camera size={ 20 } />
                            </button>
                        </>
                    ) }
                </div>
            </div>
        </div>
    );
}
