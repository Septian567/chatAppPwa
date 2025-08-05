import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";

interface UseMessageInputProps
{
    onSend: ( message: string ) => void;
    onSendFile?: ( file: File ) => void;
}

export function useMessageInput( { onSend, onSendFile }: UseMessageInputProps )
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
            e.target.value = ""; // reset agar bisa pilih file sama lagi
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

    return {
        message,
        setMessage,
        textareaRef,
        handleSend,
        handleKeyDown,
        handleFileChange,
    };
}
