"use client";

import { Phone, Mail, User, LogOut } from "react-feather";
import HorizontalMenu from "./HorizontalMenu";
import MainMenu from "./MainMenu";
import Resizer from "./Resizer";
import Header from "./Header";
import SearchBox from "./SearchBox";
import { useSidebarState } from "../hooks/useSidebarState";
import { HorizontalSubMenu } from "../states/sidebarSlice";

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

const HORIZONTAL_MENU_CONTENT: Record<HorizontalSubMenu, string> = {
  user: "Sidebar says: welcome to horizontal user.",
  contact: "Sidebar says: these are quick contacts.",
  chat: "Sidebar says: recent sidebar chats.",
};

export default function Sidebar( { onMainMenuClick, width }: SidebarProps )
{
  const {
    isMainMenuVisible,
    toggleMainMenu,
    activeHorizontalMenu,
    updateHorizontalMenu,
    HORIZONTAL_MENU_LABELS,
  } = useSidebarState();

  const isDesktop = typeof width === "number";

  return (
    <aside
      className="bg-transparent text-black h-screen p-4 flex flex-col relative shrink-0 border-r border-gray-300"
      style={ { width } }
    >
      { isDesktop && <Resizer /> }
      <Header isExpanded={ isMainMenuVisible } onToggle={ toggleMainMenu } />
      <nav className="flex-1">
        { isMainMenuVisible && (
          <MainMenu items={ MAIN_MENU_ITEMS } onClick={ onMainMenuClick } />
        ) }
        <SearchBox />
        <HorizontalMenu
          active={ activeHorizontalMenu }
          onChange={ updateHorizontalMenu }
          items={ HORIZONTAL_MENU_LABELS }
        />
        <p className="text-sm text-gray-600 p-2">
          { HORIZONTAL_MENU_CONTENT[activeHorizontalMenu] }
        </p>
      </nav>
    </aside>
  );
}
