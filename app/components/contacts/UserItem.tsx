import { useEffect, useRef, useState } from "react";
import { User, Plus, X, Check, Pencil } from "lucide-react";

interface UserItemProps
{
    name: string;
    email: string;
    onAliasSave?: ( name: string, email: string, alias: string ) => void;
}

export default function UserItem( { name, email, onAliasSave }: UserItemProps )
{
    const [addingAlias, setAddingAlias] = useState( false );
    const [alias, setAlias] = useState( "" );

    const storageKey = `alias_${ email }`;
    const inputRef = useRef<HTMLInputElement>( null );

    useEffect( () =>
    {
        const savedAlias = localStorage.getItem( storageKey );
        if ( savedAlias )
        {
            setAlias( savedAlias );
        }
    }, [storageKey] );

    // Fokus otomatis saat masuk mode tambah/edit
    useEffect( () =>
    {
        if ( addingAlias && inputRef.current )
        {
            inputRef.current.focus();
            inputRef.current.select(); // auto highlight text lama
        }
    }, [addingAlias] );

    const handleSave = () =>
    {
        if ( alias.trim() )
        {
            localStorage.setItem( storageKey, alias );
            setAddingAlias( false );

            if ( onAliasSave )
            {
                onAliasSave( name, email, alias );
            }
        }
    };

    const handleCancel = () =>
    {
        setAddingAlias( false );
        if ( !localStorage.getItem( storageKey ) )
        {
            setAlias( "" );
        }
    };

    const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement> ) =>
    {
        if ( e.key === "Enter" )
        {
            e.preventDefault();
            handleSave();
        }
        if ( e.key === "Escape" )
        {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <div className="flex items-start justify-between p-4 border-b">
            {/* Avatar + Info */ }
            <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                    <p className="font-semibold">{ name }</p>
                    <p className="text-sm text-gray-600">{ email }</p>

                    {/* Alias Section */ }
                    { addingAlias ? (
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                ref={ inputRef }
                                type="text"
                                value={ alias }
                                onChange={ ( e ) => setAlias( e.target.value ) }
                                onKeyDown={ handleKeyDown }
                                placeholder="alias..."
                                className="border rounded px-2 py-1 text-sm"
                                maxLength={15}
                            />
                            <button
                                onClick={ handleSave }
                                className="p-1 rounded hover:bg-gray-200"
                            >
                                <Check className="w-4 h-4 text-black" />
                            </button>
                            <button
                                onClick={ handleCancel }
                                className="p-1 rounded hover:bg-gray-200"
                            >
                                <X className="w-4 h-4 text-black" />
                            </button>
                        </div>
                    ) : (
                        alias && (
                            <p className="text-sm text-gray-500">
                                alias: { alias }
                            </p>
                        )
                    ) }
                </div>
            </div>

            {/* Action button */ }
            { !addingAlias && (
                <button
                    onClick={ () => setAddingAlias( true ) }
                    className="p-2 rounded hover:bg-gray-100"
                >
                    { alias ? (
                        <Pencil className="w-5 h-5 text-gray-600" />
                    ) : (
                        <Plus className="w-5 h-5 text-gray-600" />
                    ) }
                </button>
            ) }
        </div>
    );
}
