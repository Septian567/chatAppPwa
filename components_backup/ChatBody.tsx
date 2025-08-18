import { useEffect, useRef } from "react";
import ChatTextMessage from "./ChatTextMessage";
import ChatAudioMessage from "./ChatAudioMessage";
import ChatFileMessage from "./ChatFileMessage";
import ChatStaticMessages from "./ChatStaticMessages";

interface ChatMessage
{
    text?: string;
    audioUrl?: string;
    fileUrl?: string;
    fileName?: string;
    duration?: number;
    time: string;
}

interface ChatBodyProps
{
    messages: ChatMessage[];
}

export default function ChatBody( { messages }: ChatBodyProps )
{
    const scrollRef = useRef<HTMLDivElement | null>( null );

    useEffect( () =>
    {
        // Scroll ke bawah setiap kali pesan berubah
        if ( scrollRef.current )
        {
            scrollRef.current.scrollIntoView( { behavior: "smooth" } );
        }
    }, [messages] );

    return (
        <div className="flex-1 py-6 overflow-auto w-full responsive-padding">
            {/* Chat Statis */ }
            <ChatStaticMessages />

            {/* Pesan Dinamis */ }
            { messages.map( ( msg, index ) =>
            {
                if ( msg.text )
                {
                    return <ChatTextMessage key={ `${ msg.time }-${ index }` } text={ msg.text } time={ msg.time } />;
                }

                if ( msg.audioUrl )
                {
                    return (
                        <ChatAudioMessage
                            key={ `${ msg.time }-${ index }` }
                            audioUrl={ msg.audioUrl }
                            time={ msg.time }
                            duration={ msg.duration }
                        />
                    );
                }

                if ( msg.fileUrl )
                {
                    return (
                        <ChatFileMessage
                            key={ `${ msg.time }-${ index }` }
                            fileUrl={ msg.fileUrl }
                            fileName={ msg.fileName }
                            time={ msg.time }
                        />
                    );
                }

                return null;
            } ) }

            {/* Elemen dummy di akhir untuk scroll otomatis */ }
            <div ref={ scrollRef } />
        </div>
    );
}
