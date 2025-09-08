import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { ChatMessage } from "./useChatMessageActions";

export function useChatBody( messages: ChatMessage[] )
{
    const bottomRef = useRef<HTMLDivElement | null>( null );
    const chatBodyRef = useRef<HTMLDivElement | null>( null );
    const [isMenuOpen, setIsMenuOpen] = useState( false );
    const firstRender = useRef( true );
    const prevMessageCount = useRef( messages.length );
    const [isScrollable, setIsScrollable] = useState( false );

    const blockersRef = useRef<{
        wheel?: ( e: Event ) => void;
        touch?: ( e: Event ) => void;
        key?: ( e: Event ) => void;
    } | null>( null );

    const checkScrollable = useCallback( () =>
    {
        const el = chatBodyRef.current;
        if ( !el ) return;
        const needsScroll = el.scrollHeight > el.clientHeight + 1;
        setIsScrollable( needsScroll );
    }, [] );

    const scrollToBottom = useCallback( ( behavior: ScrollBehavior = "auto" ) =>
    {
        bottomRef.current?.scrollIntoView( { behavior } );
    }, [] );

    // --------------------------
    // Scroll otomatis saat first render / pesan baru
    // --------------------------
    useLayoutEffect( () =>
    {
        const el = chatBodyRef.current;
        if ( !el ) return;

        checkScrollable();

        const mediaEls = el.querySelectorAll( "img, video" );
        let loadedCount = 0;
        const totalMedia = mediaEls.length;

        const onMediaLoad = () =>
        {
            loadedCount++;
            if ( loadedCount === totalMedia )
            {
                scrollToBottom( firstRender.current ? "auto" : "smooth" );
                firstRender.current = false;
            }
        };

        if ( totalMedia === 0 )
        {
            scrollToBottom( firstRender.current ? "auto" : "smooth" );
            firstRender.current = false;
        } else
        {
            mediaEls.forEach( ( m ) => m.addEventListener( "load", onMediaLoad, { once: true } ) );
        }

        const onResize = () => checkScrollable();
        window.addEventListener( "resize", onResize );

        return () =>
        {
            window.removeEventListener( "resize", onResize );
        };
    }, [messages, checkScrollable, scrollToBottom] );

    // --------------------------
    // Blocking scroll saat menu terbuka
    // --------------------------
    useEffect( () =>
    {
        const el = chatBodyRef.current;
        if ( !el ) return;

        const cleanupBlockers = () =>
        {
            if ( !blockersRef.current ) return;
            try
            {
                el.removeEventListener( "wheel", blockersRef.current.wheel as EventListener );
                el.removeEventListener( "touchmove", blockersRef.current.touch as EventListener );
                window.removeEventListener( "keydown", blockersRef.current.key as EventListener );
            } catch { }
            blockersRef.current = null;
        };

        if ( isMenuOpen )
        {
            const wheelHandler = ( e: WheelEvent ) => e.preventDefault();
            const touchHandler = ( e: TouchEvent ) => e.preventDefault();
            const keyHandler = ( e: KeyboardEvent ) =>
            {
                const blockedKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"];
                if ( blockedKeys.includes( e.key ) ) e.preventDefault();
            };

            el.addEventListener( "wheel", wheelHandler as EventListener, { passive: false } as AddEventListenerOptions );
            el.addEventListener( "touchmove", touchHandler as EventListener, { passive: false } as AddEventListenerOptions );
            window.addEventListener( "keydown", keyHandler as EventListener );

            blockersRef.current = { wheel: wheelHandler as any, touch: touchHandler as any, key: keyHandler as any };
        } else
        {
            cleanupBlockers();
        }

        return () => cleanupBlockers();
    }, [isMenuOpen] );

    useEffect( () =>
    {
        prevMessageCount.current = messages.length;
    }, [messages.length] );

    return { bottomRef, chatBodyRef, isMenuOpen, setIsMenuOpen };
}
