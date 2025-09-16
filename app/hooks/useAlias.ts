import { useEffect, useRef, useState } from "react";

export function useAlias( email: string, initialAlias: string )
{
    const [alias, setAlias] = useState( initialAlias );
    const [addingAlias, setAddingAlias] = useState( false );
    const inputRef = useRef<HTMLInputElement>( null );

    useEffect( () =>
    {
        setAlias( initialAlias );
    }, [initialAlias] );

    useEffect( () =>
    {
        if ( addingAlias && inputRef.current )
        {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [addingAlias] );

    const handleSave = ( onAliasSave?: ( username: string, email: string, alias: string ) => void, username?: string ) =>
    {
        if ( alias.trim() )
        {
            setAddingAlias( false );
            if ( onAliasSave && username ) onAliasSave( username, email, alias );
        }
    };

    const handleCancel = () =>
    {
        setAddingAlias( false );
        setAlias( initialAlias ); // kembalikan ke alias dari API
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        onAliasSave?: ( username: string, email: string, alias: string ) => void,
        username?: string
    ) =>
    {
        if ( e.key === "Enter" )
        {
            e.preventDefault();
            handleSave( onAliasSave, username );
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
