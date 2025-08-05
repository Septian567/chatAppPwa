interface ChatTextMessageProps
{
    text: string;
    time: string;
}

export default function ChatTextMessage( { text, time }: ChatTextMessageProps )
{
    return (
        <div className="flex justify-end mb-4">
            <div className="bg-green-200 rounded-lg px-4 py-2 shadow border border-black w-fit max-w-[85%]">
                <div className="flex items-end justify-between gap-3">
                    <span className="text-black whitespace-pre-line">{ text }</span>
                    <span className="text-xs text-gray-700 whitespace-nowrap">{ time }</span>
                </div>
            </div>
        </div>
    );
}
