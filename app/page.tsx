"use client";

import Sidebar from "./components/Sidebar";
import { useSidebarLayout } from "./hooks/useSidebarLayout";
import ChatPage from "./components/pages/ChatPage";
import ContactsPage from "./components/pages/ContactsPage";
import ProfilePage from "./components/pages/ProfilePage";

export default function Home()
{
  const {
    mainContent,
    isMobile,
    showSidebarOnMobile,
    handleMainMenuClick,
    computeSidebarWidth,
    setShowSidebarOnMobile,
  } = useSidebarLayout();

  const renderMainContent = () =>
  {
    const commonProps = {
      isMobile,
      onBack: () => setShowSidebarOnMobile( true ),
    };

    switch ( mainContent )
    {
      case "chat":
        return <ChatPage
          { ...commonProps }
          sidebarWidth={ isMobile ? 0 : computeSidebarWidth() }
        />
      case "contacts":
        return <ContactsPage { ...commonProps } />;
      case "profile":
        return <ProfilePage { ...commonProps } />;
      default:
        return (
          <main className="flex-1 p-6 overflow-auto bg-white">
            <p className="text-gray-700">Silakan pilih menu dari sidebar.</p>
          </main>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      { ( !isMobile || showSidebarOnMobile ) && (
        <Sidebar
          onMainMenuClick={ handleMainMenuClick }
          width={ isMobile ? "100%" : computeSidebarWidth() }
        />
      ) }

      { ( !isMobile || !showSidebarOnMobile ) && renderMainContent() }
    </div>
  );
}
