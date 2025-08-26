import { ReactNode } from "react";

interface ChatBubbleProps
{
    children: ReactNode;
    variant?: "text" | "media";
    fixedWidth?: string;
}

export function ChatBubble( { children, variant = "text", fixedWidth }: ChatBubbleProps )
{
    return (
        <div className="flex justify-end mb-4 relative">
            <div
                className={ `bg-green-200 rounded-lg px-3 py-3 shadow border border-black
                ${ fixedWidth
                        ? `w-[${ fixedWidth }]`
                        : variant === "media"
                            ? "w-[7cm] max-w-[5cm] sm:max-w-md"
                            : "max-w-xs sm:max-w-sm"
                    }` }
            >
                { children }
            </div>
        </div>
    );
}
