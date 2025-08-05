import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "react-feather";

interface CustomAudioPlayerProps
{
    src: string;
}

export default function CustomAudioPlayer( { src }: CustomAudioPlayerProps )
{
    const audioRef = useRef<HTMLAudioElement>( null );
    const [isPlaying, setIsPlaying] = useState( false );
    const [currentTime, setCurrentTime] = useState( 0 );
    const [duration, setDuration] = useState( 0 );

    // Real-time update
    useEffect( () =>
    {
        let rafId: number;

        const update = () =>
        {
            const audio = audioRef.current;
            if ( audio )
            {
                setCurrentTime( audio.currentTime );
                rafId = requestAnimationFrame( update );
            }
        };

        if ( isPlaying )
        {
            rafId = requestAnimationFrame( update );
        }

        return () => cancelAnimationFrame( rafId );
    }, [isPlaying] );

    // Metadata load
    useEffect( () =>
    {
        const audio = audioRef.current;
        if ( !audio ) return;

        const handleLoadedMetadata = () =>
        {
            const d = audio.duration;
            if ( !isNaN( d ) && isFinite( d ) )
            {
                setDuration( d );
            }
        };

        const handleEnded = () =>
        {
            setIsPlaying( false );
            setCurrentTime( 0 );
        };

        audio.addEventListener( "loadedmetadata", handleLoadedMetadata );
        audio.addEventListener( "ended", handleEnded );

        return () =>
        {
            audio.removeEventListener( "loadedmetadata", handleLoadedMetadata );
            audio.removeEventListener( "ended", handleEnded );
        };
    }, [src] );

    const togglePlay = () =>
    {
        const audio = audioRef.current;
        if ( !audio ) return;

        if ( isPlaying )
        {
            audio.pause();
            setIsPlaying( false );
        } else
        {
            audio.play();
            setIsPlaying( true );
        }
    };

    const formatTime = ( time: number ) =>
    {
        if ( !isFinite( time ) || isNaN( time ) ) return "00:00";
        const m = Math.floor( time / 60 )
            .toString()
            .padStart( 2, "0" );
        const s = Math.floor( time % 60 )
            .toString()
            .padStart( 2, "0" );
        return `${ m }:${ s }`;
    };

    return (
        <div className="flex flex-col gap-1 w-full max-w-[270px] bg-transparent">
            <div className="flex items-center gap-2">
                <button onClick={ togglePlay } className="text-black">
                    { isPlaying ? <Pause size={ 18 } /> : <Play size={ 18 } /> }
                </button>
            </div>
            <div className="flex justify-between text-xs text-gray-600 px-8">
                <span>{ formatTime( currentTime ) } / { formatTime( duration ) }</span>
            </div>
            <audio ref={ audioRef } src={ src } preload="metadata" />
        </div>
    );
}
