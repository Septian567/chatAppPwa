// hooks/useAlias.ts
import { useEffect, useRef, useState } from "react";

export function useAlias( email: string, initialAlias: string )
{
    const [alias, setAlias] = useState( initialAlias );
    const [addingAlias, setAddingAlias] = useState( false );
    const inputRef = useRef<HTMLInputElement>( null );
    const storageKey = `alias_${ email }`;

    useEffect( () =>
    {
        setAlias( initialAlias );
    }, [initialAlias] );

    useEffect( () =>
    {
        const savedAlias = localStorage.getItem( storageKey );
        if ( savedAlias ) setAlias( savedAlias );
    }, [storageKey] );

    useEffect( () =>
    {
        if ( addingAlias && inputRef.current )
        {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [addingAlias] );

    const handleSave = ( onAliasSave?: ( name: string, email: string, alias: string ) => void, name?: string ) =>
    {
        if ( alias.trim() )
        {
            localStorage.setItem( storageKey, alias );
            setAddingAlias( false );
            if ( onAliasSave && name ) onAliasSave( name, email, alias );
        }
    };

    const handleCancel = () =>
    {
        setAddingAlias( false );
        if ( !localStorage.getItem( storageKey ) ) setAlias( "" );
    };

    const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement>, onAliasSave?: ( name: string, email: string, alias: string ) => void, name?: string ) =>
    {
        if ( e.key === "Enter" )
        {
            e.preventDefault();
            handleSave( onAliasSave, name );
        }
        if ( e.key === "Escape" )
        {
            e.preventDefault();
            handleCancel();
        }
    };

    return {
        alias,
        setAlias,
        addingAlias,
        setAddingAlias,
        inputRef,
        handleSave,
        handleCancel,
        handleKeyDown,
    };
}