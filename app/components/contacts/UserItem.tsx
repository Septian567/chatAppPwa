import { User as UserIcon, Plus, X, Check, Pencil } from "lucide-react";
import { useAlias } from "../../hooks/useAlias";

interface UserItemProps
{
    username: string;
    email: string;
    alias?: string;
    avatar_url?: string;
    readOnly?: boolean;
    compact?: boolean;
    hideEmail?: boolean;
    showAliasAsName?: boolean;
    onAliasSave?: ( username: string, email: string, alias: string ) => void;
}

export default function UserItem( {
    username,
    email,
    alias: propAlias = "",
    avatar_url,
    readOnly = false,
    compact = false,
    hideEmail = false,
    showAliasAsName = false,
    onAliasSave,
}: UserItemProps )
{
    const {
        alias,
        setAlias,
        addingAlias,
        setAddingAlias,
        inputRef,
        handleCancel,
        handleKeyDown,
    } = useAlias( email, propAlias );

    const handleSave = () =>
    {
        if ( alias.trim() )
        {
            if ( onAliasSave )
            {
                onAliasSave( username, email, alias );
            }
            setAddingAlias( false );
        }
    };

    return (
        <div
            className={ `flex items-center justify-between border-b ${ compact ? "py-2 pl-0 pr-2" : "p-4"
                }` }
        >
            <div className={ `flex items-center ${ compact ? "gap-2" : "gap-3" }` }>
                {/* Avatar */ }
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 -ml-4 overflow-hidden">
                    { avatar_url ? (
                        <img
                            src={ avatar_url }
                            alt={ username }
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserIcon className="w-6 h-6 text-gray-500" />
                    ) }
                </div>

                {/* Info user */ }
                <div className={ `flex flex-col ${ compact ? "leading-tight" : "" }` }>
                    {/* Username atau alias */ }
                    { showAliasAsName && alias ? (
                        <span
                            className="font-semibold text-sm truncate max-w-[180px] sm:max-w-[250px]"
                            title={ alias }
                        >
                            { alias }
                        </span>
                    ) : (
                        <span
                            className="font-semibold text-sm truncate max-w-[180px] sm:max-w-[250px]"
                            title={ username }
                        >
                            { username }
                        </span>
                    ) }

                    {/* Email */ }
                    { !hideEmail && (
                        <span className="text-sm text-gray-600 truncate max-w-[180px] sm:max-w-[250px]">
                            { email }
                        </span>
                    ) }

                    {/* Input alias */ }
                    { addingAlias && !showAliasAsName && (
                        <div
                            className={ `flex items-center ${ compact ? "mt-1 gap-1" : "mt-2 gap-2"
                                }` }
                        >
                            <input
                                ref={ inputRef }
                                type="text"
                                value={ alias }
                                onChange={ ( e ) => setAlias( e.target.value ) }
                                onKeyDown={ ( e ) => handleKeyDown( e, () => handleSave(), username ) }
                                placeholder="alias..."
                                className="border rounded px-2 py-1 text-sm"
                                maxLength={ 15 }
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
                    ) }

                    {/* Display alias */ }
                    { !addingAlias && alias && !showAliasAsName && (
                        <span className="text-sm text-gray-500">alias: { alias }</span>
                    ) }
                </div>
            </div>

            {/* Tombol edit alias */ }
            { !addingAlias && !readOnly && !showAliasAsName && (
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
