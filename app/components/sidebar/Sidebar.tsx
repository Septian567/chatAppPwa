"use client";

import { useEffect, useState, useRef } from "react";
import { Phone, Mail, User, LogOut } from "react-feather";
import HorizontalMenu from "./HorizontalMenu";
import MainMenu from "./MainMenu";
import Resizer from "./Resizer";
import Header from "./Header";
import SearchBox from "./SearchBox";
import { useSidebarState } from "../../hooks/useSidebarState";
import { useSidebarData } from "../../hooks/useSidebarData";
import HorizontalMenuContent from "./HorizontalMenuContent";

interface SidebarProps
{
  onMainMenuClick: ( menu: string ) => void;
  width: number | string;
  onResize?: ( newWidth: number ) => void;
  isResizable?: boolean;
}

const MAIN_MENU_ITEMS = [
  { label: "Contacts", icon: <Phone size={ 18 } />, key: "contacts" },
  { label: "Chat", icon: <Mail size={ 18 } />, key: "chat" },
  { label: "Profile", icon: <User size={ 18 } />, key: "profile" },
  { label: "Logout", icon: <LogOut size={ 18 } />, key: null },
];

export default function Sidebar( {
  onMainMenuClick,
  width,
  onResize,
  isResizable = true,
}: SidebarProps )
{
  const {
    isMainMenuVisible,
    toggleMainMenu,
    activeHorizontalMenu,
    updateHorizontalMenu,
    HORIZONTAL_MENU_LABELS,
  } = useSidebarState();

  const {
    contacts,
    setSearchQuery,
    handleAliasSave,
    filteredUsers,
    filteredContacts,
    setActiveContact,
  } = useSidebarData();

  const isDesktop = typeof width === "number";
  const sidebarRef = useRef<HTMLDivElement>( null );

  // --- FIX HYDRATION ---
  const [isClient, setIsClient] = useState( false );
  useEffect( () => setIsClient( true ), [] );

  if ( !isClient )
  {
    return (
      <aside
        className="bg-transparent text-black h-screen p-4 flex flex-col relative shrink-0 border-r border-gray-300 overflow-x-hidden"
        style={ { width: typeof width === "number" ? `${ width }px` : width } }
      >
        <div className="text-gray-400 text-sm p-4">Loading...</div>
      </aside>
    );
  }

  // --- Fungsi klik kontak ---
  const handleContactClick = ( contact: typeof contacts[0] ) =>
  {
    console.log( "DEBUG: Klik kontak:", contact );
    setActiveContact( contact ); // set activeContact di Redux
    onMainMenuClick( "chat" ); // optional: langsung buka tab chat
  };

  return (
    <aside
      ref={ sidebarRef }
      className="bg-transparent text-black h-screen p-4 flex flex-col relative shrink-0 border-r border-gray-300 overflow-x-hidden"
      style={ {
        width: typeof width === "number" ? `${ width }px` : width,
        zIndex: 40,
      } }
    >
      {/* Konten sidebar */ }
      { isDesktop && isResizable && <Resizer onResize={ onResize } /> }

      {/* Bagian Atas */ }
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

      {/* Bagian Bawah */ }
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-2 p-2 text-sm">
        <HorizontalMenuContent
          activeMenu={ activeHorizontalMenu }
          contacts={ contacts }
          filteredUsers={ filteredUsers }
          filteredContacts={ filteredContacts }
          handleAliasSave={ handleAliasSave }
          setActiveContact={ handleContactClick } // override agar otomatis set activeContact.contact_id
          onMainMenuClick={ onMainMenuClick }
        />
      </div>
    </aside>
  );
}
