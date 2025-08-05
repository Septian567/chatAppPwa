import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Paperclip, Send } from "react-feather";
import AudioRecorder from "./VoiceRecorder";

interface MessageInputProps
{
    onSend: ( message: string ) => void;
    onSendAudio?: ( audioBlob: Blob ) => void;
    onSendFile?: ( file: File ) => void;
}

export default function MessageInput( { onSend, onSendAudio, onSendFile }: MessageInputProps )
{
    const [message, setMessage] = useState( "" );
    const textareaRef = useRef<HTMLTextAreaElement>( null );

    const handleSend = () =>
    {
        if ( message.trim() )
        {
            onSend( message );
            setMessage( "" );
        }
    };

    const handleKeyDown = ( e: KeyboardEvent<HTMLTextAreaElement> ) =>
    {
        if ( e.key === "Enter" && !e.shiftKey )
        {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = ( e: ChangeEvent<HTMLInputElement> ) =>
    {
        const file = e.target.files?.[0];
        if ( file && onSendFile )
        {
            onSendFile( file );
            // reset input agar bisa pilih file yang sama lagi
            e.target.value = "";
        }
    };

    useEffect( () =>
    {
        const el = textareaRef.current;
        if ( el )
        {
            el.style.height = "auto";
            el.style.height = `${ Math.min( el.scrollHeight, 128 ) }px`;
        }
    }, [message] );

    return (
        <div className="border-t border-black py-2 bg-white w-full px-2">
            <div className="flex items-end gap-3">
                <label className="cursor-pointer text-black ml-2 flex items-center">

                    <input type="file" className="hidden" onChange={ handleFileChange } />
                    <Paperclip size={ 20 } className="relative top-[-6px]" />

                </label>

                <textarea
                    ref={ textareaRef }
                    value={ message }
                    onChange={ ( e ) => setMessage( e.target.value ) }
                    onKeyDown={ handleKeyDown }
                    rows={ 1 }
                    placeholder="Tulis pesan..."
                    className="flex-1 resize-none bg-transparent px-0 py-2 focus:outline-none text-black leading-tight max-h-32 overflow-y-auto"
                />

                { message.trim() === "" ? (
                    onSendAudio && <AudioRecorder onSendAudio={ onSendAudio } />
                ) : (
                    <button className="text-black mr-2" onClick={ handleSend }>
                        <Send size={ 20 } className="relative top-[-8px]" />
                    </button>
                ) }
            </div>
        </div>
    );
}
