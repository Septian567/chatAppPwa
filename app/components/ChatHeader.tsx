// components/ChatHeader.tsx
import { ArrowLeft, User } from "react-feather";

interface ChatHeaderProps
{
    isMobile: boolean;
    onBack: () => void;
}

export default function ChatHeader( { isMobile, onBack }: ChatHeaderProps )
{
    return (
        <div className="border-b border-black">
            <div className="flex items-center gap-3 pl-6 pr-4 py-3 w-full">
                { isMobile && (
                    <button onClick={ onBack } className="text-black">
                        <ArrowLeft size={ 20 } />
                    </button>
                ) }
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-black p-2 rounded-full">
                        <User size={ 20 } className="text-black" />
                    </div>
                    <h2 className="text-lg font-semibold text-black">
                        Rifqi Ariq Prayoga
                    </h2>
                </div>
            </div>
        </div>
    );
}
