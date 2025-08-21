"use client";

import React from "react";

interface MainMenuItem
{
    label: string;
    icon: React.ReactNode;
    key: string | null;
}

interface MainMenuProps
{
    items: MainMenuItem[];
    onClick: ( key: string ) => void;
}

export default function MainMenu( { items, onClick }: MainMenuProps )
{
    return (
        <ul className="space-y-1 mb-6">
            { items.map( ( { label, icon, key } ) => (
                <li key={ label }>
                    <button
                        onClick={ () => key && onClick( key ) }
                        className="flex w-full items-center gap-2 p-2 rounded border border-transparent hover:border-gray-300 hover:bg-gray-100 text-left text-black"
                    >
                        { icon } { label }
                    </button>
                </li>
            ) ) }
        </ul>
    );
}
