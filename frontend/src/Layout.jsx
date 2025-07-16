import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function FullScreenPageWrapper({ children, onBack }) {
  return (
    <div className="w-screen h-screen flex flex-col bg-background">
      <div className="flex items-center p-4 bg-white shadow-md">
        <button onClick={onBack} className="mr-2 p-2 rounded hover:bg-primary-light">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default function Layout() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Show sidebar only on root ("/")
  React.useEffect(() => {
    if (location.pathname === "/") {
      setSidebarVisible(true);
    } else {
      setSidebarVisible(false);
    }
  }, [location.pathname]);

  // Handler for module click in Sidebar
  const handleModuleClick = (path) => {
    setSidebarVisible(false);
    navigate(path);
  };

  // Handler for back arrow
  const handleBackToModules = () => {
    setSidebarVisible(true);
    navigate("/");
  };

  return (
    <div className="w-screen h-screen">
      {sidebarVisible ? (
        <Sidebar onModuleClick={handleModuleClick} />
      ) : (
        <FullScreenPageWrapper onBack={handleBackToModules}>
          <Outlet />
        </FullScreenPageWrapper>
      )}
    </div>
  );
}

