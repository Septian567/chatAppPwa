import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPreviewProps
{
    fileUrl: string;
    fileName: string;
}

export default function AudioPreview( { fileUrl, fileName }: AudioPreviewProps )
{
    const audioRef = useRef<HTMLAudioElement>( null );
    const [isPlaying, setIsPlaying] = useState( false );
    const [currentTime, setCurrentTime] = useState( 0 );
    const [duration, setDuration] = useState( 0 );

    const togglePlay = () =>
    {
        const audio = audioRef.current;
        if ( !audio ) return;

        if ( isPlaying )
        {
            audio.pause();
        } else
        {
            audio.play();
        }
        setIsPlaying( !isPlaying );
    };

    const handleTimeUpdate = () =>
    {
        const audio = audioRef.current;
        if ( audio )
        {
            setCurrentTime( audio.currentTime );
        }
    };

    const handleLoadedMetadata = () =>
    {
        const audio = audioRef.current;
        if ( audio )
        {
            setDuration( audio.duration );
        }
    };

    const handleSeek = ( e: React.ChangeEvent<HTMLInputElement> ) =>
    {
        const audio = audioRef.current;
        const time = parseFloat( e.target.value );
        if ( audio )
        {
            audio.currentTime = time;
            setCurrentTime( time );
        }
    };

    const formatTime = ( time: number ) =>
    {
        const minutes = Math.floor( time / 60 );
        const seconds = Math.floor( time % 60 ).toString().padStart( 2, "0" );
        return `${ minutes }:${ seconds }`;
    };

    useEffect( () =>
    {
        const audio = audioRef.current;
        const handleEnded = () => setIsPlaying( false );
        if ( audio )
        {
            audio.addEventListener( "ended", handleEnded );
        }
        return () =>
        {
            if ( audio )
            {
                audio.removeEventListener( "ended", handleEnded );
            }
        };
    }, [] );

    return (
        <div className="w-full">
            <audio
                ref={ audioRef }
                src={ fileUrl }
                onTimeUpdate={ handleTimeUpdate }
                onLoadedMetadata={ handleLoadedMetadata }
                className="hidden"
            />
            <div className="flex items-center gap-2">
                <button onClick={ togglePlay } className="p-2 text-black">
                    { isPlaying ? <Pause size={ 20 } /> : <Play size={ 20 } /> }
                </button>
                <input
                    type="range"
                    min={ 0 }
                    max={ duration || 0 }
                    value={ currentTime }
                    onChange={ handleSeek }
                    step="0.1"
                    className="flex-1 h-1 bg-gray-300 rounded-lg accent-green-600"
                />
                <span className="text-xs text-gray-700">{ formatTime( currentTime ) } / { formatTime( duration ) }</span>
            </div>
            <p className="text-sm mt-1 truncate">{ fileName }</p>
        </div>
    );
}
