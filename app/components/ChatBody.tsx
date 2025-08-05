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
    onEditTextMessage?: ( index: number ) => void;
}

export default function ChatBody( { messages, onEditTextMessage }: ChatBodyProps )
{
    return (
        <div className="flex-1 py-6 overflow-auto w-full responsive-padding">
            <ChatStaticMessages />

            { messages.map( ( msg, index ) =>
            {
                if ( msg.text )
                {
                    return (
                        <ChatTextMessage
                            key={ index }
                            text={ msg.text }
                            time={ msg.time }
                            onEditClick={ () => onEditTextMessage?.( index ) }
                        />
                    );
                }

                if ( msg.audioUrl )
                {
                    return (
                        <ChatAudioMessage
                            key={ index }
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
                            key={ index }
                            fileUrl={ msg.fileUrl }
                            fileName={ msg.fileName }
                            time={ msg.time }
                        />
                    );
                }

                return null;
            } ) }
        </div>
    );
}
