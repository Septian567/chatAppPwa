"use client";

import UserItem from "../contacts/UserItem";

interface UserMenuProps
{
    filteredUsers: any[];
    contacts: any[];
    handleAliasSave: ( email: string, alias: string ) => void;
}

export default function UserMenu( { filteredUsers, contacts, handleAliasSave }: UserMenuProps )
{
    return (
        <div className="space-y-0 ml-2">
            { filteredUsers.length > 0 ? (
                filteredUsers.map( ( u ) =>
                {
                    const contact = contacts.find( ( c ) => c.email === u.email );
                    return (
                        <UserItem
                            key={ `user-${ u.email }` }
                            name={ u.name }
                            email={ u.email }
                            alias={ contact?.alias || u.alias }
                            onAliasSave={ handleAliasSave }
                            readOnly
                            compact
                        />
                    );
                } )
            ) : (
                <p className="text-gray-500 text-sm">No users found</p>
            ) }
        </div>
    );
}
