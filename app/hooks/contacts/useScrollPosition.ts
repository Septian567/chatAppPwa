import { useRef, useState, useEffect } from "react";

export function useScrollPositions<T extends string>( activeMenu: T )
{
    const scrollRef = useRef<HTMLDivElement>( null );
    const tipTimeoutRef = useRef<NodeJS.Timeout>();
    const [showScrollTip, setShowScrollTip] = useState( false );
    const [scrollPositions, setScrollPositions] = useState<Record<T, number>>(
        {} as Record<T, number>
    );

    const handleScroll = () =>
    {
        if ( !scrollRef.current ) return;

        setScrollPositions( ( prev ) => ( {
            ...prev,
            [activeMenu]: scrollRef.current!.scrollTop,
        } ) );

        if ( !showScrollTip ) setShowScrollTip( true );

        if ( tipTimeoutRef.current ) clearTimeout( tipTimeoutRef.current );
        tipTimeoutRef.current = setTimeout( () => setShowScrollTip( false ), 1000 );
    };

    useEffect( () =>
    {
        if ( scrollRef.current )
        {
            scrollRef.current.scrollTop = scrollPositions[activeMenu] || 0;
        }
    }, [activeMenu, scrollPositions] );

    return { scrollRef, handleScroll, showScrollTip };
}
