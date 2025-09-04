import { useState, useCallback } from "react";

export type ChatSide = "kiri" | "kanan";

/**
 * Custom hook untuk mengelola sisi chat (kiri/kanan).
 * Bisa dipakai di ChatPage, ChatHeader, atau komponen lain.
 */
export function useChatSide( initialSide: ChatSide = "kanan" )
{
    const [chatSide, setChatSide] = useState<ChatSide>( initialSide );

    const selectKiri = useCallback( () => setChatSide( "kiri" ), [] );
    const selectKanan = useCallback( () => setChatSide( "kanan" ), [] );

    const getAlign = useCallback(
        ( side: ChatSide ): "left" | "right" => ( side === "kiri" ? "left" : "right" ),
        []
    );

    return {
        chatSide,
        setChatSide,
        selectKiri,
        selectKanan,
        getAlign,
    };
}
