// components/MainContent.tsx

"use client";

import { ReactNode } from "react";

interface MainContentProps
{
    content: ReactNode;
    isMobile: boolean;
    onBack: () => void;
}

export default function MainContent( { content, isMobile, onBack }: MainContentProps )
{
    return (
        <main className="flex-1 p-6 overflow-auto relative bg-gray-50">
            { isMobile && (
                <button onClick={ onBack } className="mb-4 text-indigo-600 underline">
                    ← Kembali ke Sidebar
                </button>
            ) }

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Hello World!</h1>
                <section className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-indigo-700 mb-4">Main Content</h2>
                    { content }
                </section>
            </div>
        </main>
    );
}
