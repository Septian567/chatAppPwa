"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import Sidebar from "./components/sidebar/Sidebar";
import { useSidebarLayout } from "./hooks/useSidebarLayout";
import { useSidebarNavigation } from "./hooks/useSidebarNavigation";
import ChatPage from "./components/chat/ChatPage";
import ContactsPage from "./components/contacts/ContactsPage";
import ProfilePage from "./components/profile/ProfilePage";

export default function Home()
{
  const {
    mainContent,
    isMobile,
    showSidebarOnMobile,
    computeSidebarWidth,
    setShowSidebarOnMobile,
  } = useSidebarLayout();

  const { handleMainMenuClick } = useSidebarNavigation( isMobile );

  const [selectedContact, setSelectedContact] = useState<string | null>( null );
  const [isClient, setIsClient] = useState( false );
  const [hydrated, setHydrated] = useState( false ); // <- new

  const [showHomePage, setShowHomePage] = useState( true );

  useEffect( () =>
  {
    setIsClient( true );
  }, [] );

  // Delay render sampai semua state siap
  useEffect( () =>
  {
    if ( isClient && isMobile !== undefined )
    {
      setHydrated( true );
    }
  }, [isClient, isMobile] );

  if ( !hydrated ) return null; // <- jangan render sebelum siap

  const commonProps = {
    isMobile,
    onBack: () => setShowSidebarOnMobile( true ),
  };

  const handleMenuClick = ( menu: string ) =>
  {
    setShowHomePage( false );
    handleMainMenuClick( menu );
  };

  const handleContactClick = ( aliasOrName: string ) =>
  {
    setSelectedContact( aliasOrName );
    setShowHomePage( false );
    handleMainMenuClick( "chat" );
  };

  const renderContent = () =>
  {
    if ( showHomePage )
    {
      return (
        <main className="flex-1 flex flex-col items-center justify-center bg-white relative">
          { isMobile && (
            <button
              onClick={ () => setShowSidebarOnMobile( true ) }
              className="absolute top-4 left-4 flex items-center text-gray-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>menu</span>
            </button>
          ) }

          <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
            </svg>
          </div>

          <p className="text-gray-700 text-center text-lg mt-2">
            Tempat ngobrol cadangan, selalu siap dipakai.
          </p>
        </main>
      );
    }

    switch ( mainContent )
    {
      case "chat":
        return (
          <ChatPage
            { ...commonProps }
            sidebarWidth={ isMobile ? 0 : computeSidebarWidth() }
            contactName={ selectedContact || "Bento" }
          />
        );
      case "contacts":
        return <ContactsPage { ...commonProps } onContactClick={ handleContactClick } />;
      case "profile":
        return <ProfilePage { ...commonProps } />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */ }
      { ( !isMobile || showSidebarOnMobile ) && (
        <Sidebar
          onMainMenuClick={ handleMenuClick }
          width={ isMobile ? "100%" : computeSidebarWidth() }
        />
      ) }

      {/* Konten utama */ }
      <div className="flex-1 flex">{ renderContent() }</div>
    </div>
  );
}
