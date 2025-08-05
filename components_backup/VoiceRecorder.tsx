import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Trash2, Send } from "react-feather";

interface AudioRecorderProps
{
    onSendAudio: ( audio: Blob, url: string ) => void; // ⬅️ ubah di sini
}

export default function AudioRecorder( { onSendAudio }: AudioRecorderProps )
{
    const [recording, setRecording] = useState( false );
    const [paused, setPaused] = useState( false );
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>( null );
    const [recordTime, setRecordTime] = useState( 0 );

    const chunksRef = useRef<Blob[]>( [] );
    const timerRef = useRef<NodeJS.Timeout | null>( null );

    const startRecording = async () =>
    {
        const stream = await navigator.mediaDevices.getUserMedia( { audio: true } );
        const recorder = new MediaRecorder( stream, {
            mimeType: "audio/webm;codecs=opus", // ✅
        } );

        recorder.ondataavailable = ( e ) =>
        {
            if ( e.data.size > 0 ) chunksRef.current.push( e.data );
        };

        recorder.onstop = () =>
        {
            const blob = new Blob( chunksRef.current, {
                type: "audio/webm;codecs=opus",
            } );
            const url = URL.createObjectURL( blob ); // ✅ Penting
            onSendAudio( blob, url ); // ✅ Kirim keduanya
            reset();
        };

        recorder.start();
        setMediaRecorder( recorder );
        setRecording( true );
        setPaused( false );

        timerRef.current = setInterval( () =>
        {
            setRecordTime( ( prev ) => prev + 1 );
        }, 1000 );
    };

    const pauseRecording = () =>
    {
        if ( !mediaRecorder ) return;

        if ( mediaRecorder.state === "recording" )
        {
            mediaRecorder.pause();
            setPaused( true );
            clearInterval( timerRef.current! );
        } else if ( mediaRecorder.state === "paused" )
        {
            mediaRecorder.resume();
            setPaused( false );
            timerRef.current = setInterval( () =>
            {
                setRecordTime( ( prev ) => prev + 1 );
            }, 1000 );
        }
    };

    const stopRecording = () =>
    {
        if ( mediaRecorder && mediaRecorder.state !== "inactive" )
        {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach( ( track ) => track.stop() );
        }
        clearInterval( timerRef.current! );
    };

    const cancelRecording = () =>
    {
        if ( mediaRecorder && mediaRecorder.state !== "inactive" )
        {
            mediaRecorder.onstop = null; 
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach( ( track ) => track.stop() );
        }
        reset();
    };

    const reset = () =>
    {
        chunksRef.current = [];
        setRecording( false );
        setPaused( false );
        setMediaRecorder( null );
        setRecordTime( 0 );
        clearInterval( timerRef.current! );
    };

    const formatTime = ( sec: number ) =>
        `0${ Math.floor( sec / 60 ) }:${ ( sec % 60 ).toString().padStart( 2, "0" ) }`;

    const renderWaveIndicator = () => (
        <div className="flex items-center gap-[2px] w-6 h-4 mt-[2px]">
            <div className="w-[3px] h-full bg-red-500 animate-wave1 rounded"></div>
            <div className="w-[3px] h-full bg-red-500 animate-wave2 rounded"></div>
            <div className="w-[3px] h-full bg-red-500 animate-wave3 rounded"></div>
            <div className="w-[3px] h-full bg-red-500 animate-wave2 rounded"></div>
            <div className="w-[3px] h-full bg-red-500 animate-wave1 rounded"></div>
        </div>
    );

    return (
        <div className="flex items-center gap-2">
            { !recording && (
                <button onClick={ startRecording } className="text-black" title="Mulai rekam">
                    <Mic size={ 20 } className="relative top-[-8px]" />
                </button>
            ) }

            { recording && (
                <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                    {/* Cancel */ }
                    <button onClick={ cancelRecording } title="Batalkan">
                        <Trash2 size={ 18 } className="text-black" />
                    </button>

                    {/* Timer + wave */ }
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 text-sm">● { formatTime( recordTime ) }</span>
                        { renderWaveIndicator() }
                    </div>

                    {/* Pause / Resume */ }
                    <button onClick={ pauseRecording } title={ paused ? "Lanjutkan" : "Pause" }>
                        { paused ? (
                            <Play size={ 18 } className="text-black" />
                        ) : (
                            <Pause size={ 18 } className="text-black" />
                        ) }
                    </button>

                    {/* Send */ }
                    <button onClick={ stopRecording } title="Kirim">
                        <Send size={ 18 } className="text-black" />
                    </button>
                </div>
            ) }
        </div>
    );
}
