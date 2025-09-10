import { User, Plus, X, Check, Pencil } from "lucide-react";
import { useAlias } from "../../hooks/useAlias";

interface UserItemProps
{
    name: string;
    email: string;
    alias?: string;
    onAliasSave?: ( name: string, email: string, alias: string ) => void;
    readOnly?: boolean;
    compact?: boolean;
    hideEmail?: boolean;
    hideName?: boolean;
    showAliasAsName?: boolean;
}

export default function UserItem( {
    name,
    email,
    alias: propAlias = "",
    onAliasSave,
    readOnly = false,
    compact = false,
    hideEmail = false,
    hideName = false,
    showAliasAsName = false,
}: UserItemProps )
{
    const {
        alias,
        setAlias,
        addingAlias,
        setAddingAlias,
        inputRef,
        handleSave,
        handleCancel,
        handleKeyDown,
    } = useAlias( email, propAlias );

    return (
        <div className={ `flex items-center justify-between border-b ${ compact ? "py-2 pl-0 pr-2" : "p-4" }` }>
            <div className={ `flex items-center ${ compact ? "gap-2" : "gap-3" }` }>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 -ml-4">
                    <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className={ `flex flex-col ${ compact ? "leading-tight" : "" }` }>
                    { showAliasAsName && alias ? (
                        <span className="font-semibold text-sm truncate max-w-[180px] sm:max-w-[250px]" title={ alias }>
                            { alias }
                        </span>
                    ) : (
                        !hideName && (
                            <span className="font-semibold text-sm truncate max-w-[180px] sm:max-w-[250px]" title={ name }>
                                { name }
                            </span>
                        )
                    ) }

                    { !hideEmail && !showAliasAsName && (
                        <span className="text-sm text-gray-600 truncate max-w-[180px] sm:max-w-[250px]">{ email }</span>
                    ) }

                    { addingAlias && !showAliasAsName && (
                        <div className={ `flex items-center ${ compact ? "mt-1 gap-1" : "mt-2 gap-2" }` }>
                            <input
                                ref={ inputRef }
                                type="text"
                                value={ alias }
                                onChange={ ( e ) => setAlias( e.target.value ) }
                                onKeyDown={ ( e ) => handleKeyDown( e, onAliasSave, name ) }
                                placeholder="alias..."
                                className="border rounded px-2 py-1 text-sm"
                                maxLength={ 15 }
                            />
                            <button onClick={ () => handleSave( onAliasSave, name ) } className="p-1 rounded hover:bg-gray-200">
                                <Check className="w-4 h-4 text-black" />
                            </button>
                            <button onClick={ handleCancel } className="p-1 rounded hover:bg-gray-200">
                                <X className="w-4 h-4 text-black" />
                            </button>
                        </div>
                    ) }

                    { !addingAlias && alias && !showAliasAsName && (
                        <span className="text-sm text-gray-500">alias: { alias }</span>
                    ) }
                </div>
            </div>

            { !addingAlias && !readOnly && !showAliasAsName && (
                <button onClick={ () => setAddingAlias( true ) } className="p-2 rounded hover:bg-gray-100">
                    { alias ? <Pencil className="w-5 h-5 text-gray-600" /> : <Plus className="w-5 h-5 text-gray-600" /> }
                </button>
            ) }
        </div>
    );
}