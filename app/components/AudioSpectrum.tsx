import React, { useEffect, useRef } from "react";

interface AudioSpectrumProps
{
    audioRef: React.RefObject<HTMLAudioElement>;
    width?: number;
    height?: number;
}

export default function AudioSpectrum( {
    audioRef,
    width = 270,
    height = 60,
}: AudioSpectrumProps )
{
    const canvasRef = useRef<HTMLCanvasElement>( null );
    const audioContextRef = useRef<AudioContext | null>( null );
    const analyserRef = useRef<AnalyserNode | null>( null );
    const dataArrayRef = useRef<Uint8Array | null>( null );
    const animationIdRef = useRef<number | null>( null );
    const sourceRef = useRef<MediaElementAudioSourceNode | null>( null );

    useEffect( () =>
    {
        if ( !audioRef.current ) return;

        // Setup AudioContext and AnalyserNode
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // number of bars (half of fftSize)

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array( bufferLength );

        sourceRef.current = audioContextRef.current.createMediaElementSource(
            audioRef.current
        );
        sourceRef.current.connect( analyserRef.current );
        analyserRef.current.connect( audioContextRef.current.destination );

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext( "2d" );

        function draw()
        {
            if ( !ctx || !analyserRef.current || !dataArrayRef.current ) return;

            const width = canvas.width;
            const height = canvas.height;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = dataArrayRef.current;

            analyserRef.current.getByteFrequencyData( dataArray );

            ctx.clearRect( 0, 0, width, height );

            const barWidth = width / bufferLength;
            for ( let i = 0; i < bufferLength; i++ )
            {
                const barHeight = ( dataArray[i] / 255 ) * height;
                const x = i * barWidth;
                const y = height - barHeight;

                ctx.fillStyle = `rgb(${ barHeight + 100 },50,150)`; // colorful bars
                ctx.fillRect( x, y, barWidth - 2, barHeight );
            }

            animationIdRef.current = requestAnimationFrame( draw );
        }

        draw();

        return () =>
        {
            if ( animationIdRef.current )
            {
                cancelAnimationFrame( animationIdRef.current );
            }
            if ( audioContextRef.current )
            {
                audioContextRef.current.close();
            }
        };
    }, [audioRef] );

    return (
        <canvas
            ref={ canvasRef }
            width={ width }
            height={ height }
            style={ { width: "100%", maxWidth: width, background: "transparent" } }
        />
    );
}
