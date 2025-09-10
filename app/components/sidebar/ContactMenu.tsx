"use client";

import UserItem from "../contacts/UserItem";

interface ContactMenuProps
{
    filteredContacts: any[];
    setActiveContact: ( c: any ) => void;
    onMainMenuClick: ( menu: string ) => void;
}

export default function ContactMenu( { filteredContacts, setActiveContact, onMainMenuClick }: ContactMenuProps )
{
    return (
        <div className="space-y-0 ml-2">
            { filteredContacts.length > 0 ? (
                filteredContacts.map( ( c ) => (
                    <div
                        key={ `contact-${ c.email }` }
                        onClick={ () =>
                        {
                            setActiveContact( c );
                            onMainMenuClick( "chat" );
                        } }
                        className="cursor-pointer hover:bg-gray-100 rounded-lg"
                    >
                        <UserItem
                            name={ c.alias || c.name }
                            email={ c.email }
                            alias={ c.alias }
                            readOnly
                            compact
                            showAliasAsName
                        />
                    </div>
                ) )
            ) : (
                <p className="text-gray-500 text-sm">No contacts found</p>
            ) }
        </div>
    );
}
