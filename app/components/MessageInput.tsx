import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { X, Check, Paperclip, Send } from "react-feather";

import AudioRecorder from "./VoiceRecorder";

interface MessageInputProps
{
    onSend: ( message: string ) => void;
    onSendAudio?: ( audioBlob: Blob ) => void;
    onSendFile?: ( file: File ) => void;

    isEditing?: boolean;
    initialEditValue?: string;
    onCancelEdit?: () => void;
    onSubmitEdit?: ( editedMessage: string ) => void;
}

export default function MessageInput( {
    onSend,
    onSendAudio,
    onSendFile,
    isEditing = false,
    initialEditValue = "",
    onCancelEdit,
    onSubmitEdit,
}: MessageInputProps )
{
    const [message, setMessage] = useState( "" );
    const textareaRef = useRef<HTMLTextAreaElement>( null );

    useEffect( () =>
    {
        if ( isEditing )
        {
            setMessage( initialEditValue );
        } else
        {
            setMessage( "" );
        }
    }, [isEditing, initialEditValue] );

    useEffect( () =>
    {
        if ( isEditing && textareaRef.current )
        {
            const el = textareaRef.current;
            el.focus();
            el.selectionStart = el.selectionEnd = el.value.length;
        }
    }, [isEditing] );


    const handleSend = () =>
    {
        if ( message.trim() )
        {
            if ( isEditing && onSubmitEdit )
            {
                onSubmitEdit( message.trim() );
            } else
            {
                onSend( message.trim() );
            }
            setMessage( "" );
        }
    };

    const handleKeyDown = ( e: KeyboardEvent<HTMLTextAreaElement> ) =>
    {
        if ( e.key === "Enter" && !e.shiftKey )
        {
            e.preventDefault();
            handleSend();
        } else if ( e.key === "Escape" && isEditing )
        {
            e.preventDefault();
            onCancelEdit?.();
        }
    };

    const handleFileChange = ( e: ChangeEvent<HTMLInputElement> ) =>
    {
        const file = e.target.files?.[0];
        if ( file && onSendFile )
        {
            onSendFile( file );
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
            {/* Preview pesan lama saat edit */ }
            { isEditing && initialEditValue && (
                <div className="bg-green-100 border border-green-300 text-green-800 text-sm rounded px-4 py-2 mb-2 shadow w-full">
                    <div className="font-semibold mb-1 flex items-center gap-1">
                        <span className="text-green-700">✏️ Edit message</span>
                    </div>
                    <div className="whitespace-pre-line text-black">{ initialEditValue }</div>
                </div>
            ) }

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
                    placeholder={ isEditing ? "Edit pesan..." : "Tulis pesan..." }
                    className="flex-1 resize-none bg-transparent px-0 py-2 focus:outline-none text-black leading-tight max-h-32 overflow-y-auto"
                />

                { isEditing ? (
                    <div className="flex mr-2 items-center">
                        <div className="w-9 h-9 hover:bg-gray-200 flex items-center justify-center transition">
                            <button
                                onClick={ onCancelEdit }
                                title="Batal"
                                className="w-full h-full flex items-center justify-center"
                            >
                                <X size={ 18 } />
                            </button>
                        </div>
                        <div className="w-9 h-9 hover:bg-gray-200 flex items-center justify-center transition">
                            <button
                                onClick={ handleSend }
                                title="Simpan"
                                className="w-full h-full flex items-center justify-center"
                            >
                                <Check size={ 18 } />
                            </button>
                        </div>
                    </div>
                ) : message.trim() === "" ? (
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
