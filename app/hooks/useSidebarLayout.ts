"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import
    {
        setMainContent,
        setSidebarWidth,
        setIsMobile,
        setShowSidebarOnMobile,
        loadLayoutFromStorage,
    } from "../states/layoutSlice";
import { RootState } from "../store";
import { BREAKPOINTS, MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH } from "../lib/constants";

export function useSidebarLayout()
{
    const dispatch = useDispatch();

    const {
        mainContent,
        sidebarWidth,
        isMobile,
        showSidebarOnMobile,
    } = useSelector( ( state: RootState ) => state.layout );

    const [hasMounted, setHasMounted] = useState( false );

    // Mark component as mounted to avoid hydration issues
    useEffect( () =>
    {
        setHasMounted( true );
    }, [] );

    // Load initial values from localStorage
    useEffect( () =>
    {
        if ( hasMounted )
        {
            dispatch( loadLayoutFromStorage() );
        }
    }, [dispatch, hasMounted] );

    // Set isMobile on resize
    useEffect( () =>
    {
        if ( !hasMounted ) return;

        const updateIsMobile = () =>
        {
            dispatch( setIsMobile( window.innerWidth <= BREAKPOINTS.MOBILE_MAX_WIDTH ) );
        };

        updateIsMobile();
        window.addEventListener( "resize", updateIsMobile );
        return () => window.removeEventListener( "resize", updateIsMobile );
    }, [dispatch, hasMounted] );

    // Sidebar resizing
    useEffect( () =>
    {
        if ( !hasMounted ) return;

        let isResizing = false;

        const onMouseMove = ( e: MouseEvent ) =>
        {
            if ( !isResizing ) return;
            const newWidth = Math.min(
                Math.max( MIN_SIDEBAR_WIDTH, e.clientX ),
                MAX_SIDEBAR_WIDTH
            );
            dispatch( setSidebarWidth( newWidth ) );
        };

        const onMouseUp = () =>
        {
            isResizing = false;
        };

        const onMouseDown = () =>
        {
            isResizing = true;
        };

        const resizer = document.getElementById( "resizer" );
        if ( resizer )
        {
            resizer.addEventListener( "mousedown", onMouseDown );
        } else
        {
            console.warn( "Resizer element not found" );
        }

        window.addEventListener( "mousemove", onMouseMove );
        window.addEventListener( "mouseup", onMouseUp );

        return () =>
        {
            resizer?.removeEventListener( "mousedown", onMouseDown );
            window.removeEventListener( "mousemove", onMouseMove );
            window.removeEventListener( "mouseup", onMouseUp );
        };
    }, [dispatch, hasMounted] );

    const handleMainMenuClick = useCallback( ( menu: string ) =>
    {
        const validMenus = ["chat", "contacts", "profile"];
        dispatch( setMainContent( validMenus.includes( menu ) ? menu : "" ) );

        if ( isMobile )
        {
            dispatch( setShowSidebarOnMobile( false ) );
        }
    }, [dispatch, isMobile] );

    const computeSidebarWidth = useCallback( () =>
    {
        if ( !hasMounted ) return sidebarWidth;

        const width = window.innerWidth;

        if ( BREAKPOINTS.SPECIAL_WIDTHS.includes( width ) ) return 250;
        if ( width <= 540 ) return 220;

        return sidebarWidth;
    }, [sidebarWidth, hasMounted] );

    if ( !hasMounted )
    {
        // Optional: safe fallback to prevent mismatches during SSR
        return {
            mainContent: "",
            sidebarWidth: 260,
            isMobile: false,
            showSidebarOnMobile: true,
            handleMainMenuClick: () => { },
            computeSidebarWidth: () => 260,
            setShowSidebarOnMobile: () => { },
        };
    }

    return {
        mainContent,
        sidebarWidth,
        isMobile,
        showSidebarOnMobile,
        handleMainMenuClick,
        computeSidebarWidth,
        setShowSidebarOnMobile: ( val: boolean ) => dispatch( setShowSidebarOnMobile( val ) ),
    };
}
