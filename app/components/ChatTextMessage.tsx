interface ChatTextMessageProps
{
    text: string;
    time: string;
    onEditClick?: () => void;
}

export default function ChatTextMessage( { text, time, onEditClick }: ChatTextMessageProps )
{
    return (
        <div className="flex justify-end mb-4">
            <div className="bg-green-200 rounded-lg px-4 py-2 shadow border border-black w-fit max-w-[85%]">
                <div className="flex items-end justify-between gap-3">
                    <span className="text-black whitespace-pre-line">{ text }</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 whitespace-nowrap">{ time }</span>
                        { onEditClick && (
                            <button
                                onClick={ onEditClick }
                                title="Edit"
                                className="text-gray-600 hover:text-black text-sm"
                            >
                                ✏️
                            </button>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}
