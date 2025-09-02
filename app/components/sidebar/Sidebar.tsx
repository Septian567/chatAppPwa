"use client";

import { useEffect, useState, useMemo } from "react";
import { Phone, Mail, User, LogOut } from "react-feather";
import HorizontalMenu from "./HorizontalMenu";
import MainMenu from "./MainMenu";
import Resizer from "./Resizer";
import Header from "./Header";
import SearchBox from "./SearchBox";
import { useSidebarState } from "../../hooks/useSidebarState";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../states";
import { updateAlias, setUsers } from "../../states/usersSlice";
import
  {
    updateContactAlias,
    setContacts,
    setActiveContact, // Tambahan
  } from "../../states/contactsSlice";
import UserItem from "../contacts/UserItem";

interface SidebarProps
{
  onMainMenuClick: ( menu: string ) => void;
  width: number | string;
}

const MAIN_MENU_ITEMS = [
  { label: "Contacts", icon: <Phone size={ 18 } />, key: "contacts" },
  { label: "Chat", icon: <Mail size={ 18 } />, key: "chat" },
  { label: "Profile", icon: <User size={ 18 } />, key: "profile" },
  { label: "Logout", icon: <LogOut size={ 18 } />, key: null },
];

export default function Sidebar( { onMainMenuClick, width }: SidebarProps )
{
  const {
    isMainMenuVisible,
    toggleMainMenu,
    activeHorizontalMenu,
    updateHorizontalMenu,
    HORIZONTAL_MENU_LABELS,
  } = useSidebarState();

  const dispatch = useDispatch();
  const users = useSelector( ( state: RootState ) => state.users.list );
  const contacts = useSelector( ( state: RootState ) => state.contacts.list );

  const [searchQuery, setSearchQuery] = useState( "" );

  // Load data awal dari localStorage
  useEffect( () =>
  {
    const savedUsers = JSON.parse( localStorage.getItem( "users" ) || "[]" );
    const savedContacts = JSON.parse( localStorage.getItem( "contacts" ) || "[]" );
    if ( savedUsers.length > 0 ) dispatch( setUsers( savedUsers ) );
    if ( savedContacts.length > 0 ) dispatch( setContacts( savedContacts ) );
  }, [dispatch] );

  // Update alias
  const handleAliasSave = ( name: string, email: string, alias: string ) =>
  {
    dispatch( updateAlias( { email, alias } ) );
    dispatch( updateContactAlias( { email, alias } ) );

    const updatedUsers = users.map( ( u ) =>
      u.email === email ? { ...u, alias } : u
    );
    const updatedContacts = contacts.map( ( c ) =>
      c.email === email ? { ...c, alias } : c
    );
    localStorage.setItem( "users", JSON.stringify( updatedUsers ) );
    localStorage.setItem( "contacts", JSON.stringify( updatedContacts ) );
  };

  // Filter hasil pencarian (user)
  const filteredUsers = useMemo( () =>
  {
    if ( !searchQuery.trim() ) return users;

    return users.filter( ( u ) =>
    {
      const contact = contacts.find( ( c ) => c.email === u.email );
      const aliasToCheck = contact?.alias || u.alias || "";
      return (
        u.name.toLowerCase().includes( searchQuery.toLowerCase() ) ||
        u.email.toLowerCase().includes( searchQuery.toLowerCase() ) ||
        aliasToCheck.toLowerCase().includes( searchQuery.toLowerCase() )
      );
    } );
  }, [users, contacts, searchQuery] );

  // Filter hasil pencarian (contact)
  const filteredContacts = useMemo( () =>
  {
    if ( !searchQuery.trim() ) return contacts;
    return contacts.filter( ( c ) =>
      ( c.alias || c.name || "" )
        .toLowerCase()
        .includes( searchQuery.toLowerCase() )
    );
  }, [contacts, searchQuery] );

  const isDesktop = typeof width === "number";

  return (
    <aside
      className="bg-transparent text-black h-screen p-4 flex flex-col relative shrink-0 border-r border-gray-300"
      style={ { width } }
    >
      { isDesktop && <Resizer /> }

      {/* Bagian Atas - Non-scrollable */ }
      <div className="flex flex-col gap-2">
        <Header isExpanded={ isMainMenuVisible } onToggle={ toggleMainMenu } />
        { isMainMenuVisible && (
          <MainMenu items={ MAIN_MENU_ITEMS } onClick={ onMainMenuClick } />
        ) }
        <SearchBox onSearch={ setSearchQuery } />
        <HorizontalMenu
          active={ activeHorizontalMenu }
          onChange={ updateHorizontalMenu }
          items={ HORIZONTAL_MENU_LABELS }
        />
      </div>

      {/* Bagian Bawah - Scrollable */ }
      <div className="flex-1 overflow-y-auto mt-2 p-2 text-sm">
        { activeHorizontalMenu === "user" && (
          <div className="space-y-0 -ml-2">
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
        ) }

        { activeHorizontalMenu === "contact" && (
          <div className="space-y-0 -ml-2">
            { filteredContacts.length > 0 ? (
              filteredContacts.map( ( c ) => (
                <div
                  key={ `contact-${ c.email }` }
                  onClick={ () =>
                  {
                    dispatch( setActiveContact( c ) ); // Simpan kontak yang dipilih
                    onMainMenuClick( "chat" ); // Pindah ke halaman chat
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
        ) }

        { activeHorizontalMenu === "chat" && (
          <p className="text-gray-600">Sidebar says: recent sidebar chats.</p>
        ) }
      </div>
    </aside>
  );
}
