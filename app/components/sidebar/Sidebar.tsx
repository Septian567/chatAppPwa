"use client";

import { Phone, Mail, User, LogOut } from "react-feather";
import HorizontalMenu from "./HorizontalMenu";
import MainMenu from "./MainMenu";
import Resizer from "./Resizer";
import Header from "./Header";
import SearchBox from "./SearchBox";
import { useSidebarState } from "../../hooks/useSidebarState";
import { HorizontalSubMenu } from "../../states/sidebarSlice";
import UserItem from "../contacts/UserItem"; // import UserItem
import { useContactsPage } from "../../hooks/contacts/useContactsPage"; // untuk ambil data users

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

  const { users, handleAliasSave } = useContactsPage(); // ambil users & handler alias

  const isDesktop = typeof width === "number";

  return (
    <aside
      className="bg-transparent text-black h-screen p-4 flex flex-col relative shrink-0 border-r border-gray-300"
      style={ { width } }
    >
      { isDesktop && <Resizer /> }
      <Header isExpanded={ isMainMenuVisible } onToggle={ toggleMainMenu } />
      <nav className="flex-1 overflow-y-auto">
        { isMainMenuVisible && (
          <MainMenu items={ MAIN_MENU_ITEMS } onClick={ onMainMenuClick } />
        ) }
        <SearchBox />
        <HorizontalMenu
          active={ activeHorizontalMenu }
          onChange={ updateHorizontalMenu }
          items={ HORIZONTAL_MENU_LABELS }
        />

        {/* Render isi submenu */ }
        <div className="mt-2 p-2 text-sm">
          { activeHorizontalMenu === "user" && (
            <div className="space-y-2">
              { users.length > 0 ? (
                users.map( ( u ) => (
                  <UserItem
                    key={ u.email }
                    name={ u.name }
                    email={ u.email }
                    onAliasSave={ handleAliasSave }
                  />
                ) )
              ) : (
                <p className="text-gray-500 text-sm">No users available</p>
              ) }
            </div>
          ) }

          { activeHorizontalMenu === "contact" && (
            <p className="text-gray-600">Sidebar says: these are quick contacts.</p>
          ) }

          { activeHorizontalMenu === "chat" && (
            <p className="text-gray-600">Sidebar says: recent sidebar chats.</p>
          ) }
        </div>
      </nav>
    </aside>
  );
}
