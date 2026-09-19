import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/Chat/ChatInterface';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { WidgetPreviewContainer } from './components/Chat/WidgetPreviewContainer';
import { apiClient } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'admin'>('chat');
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check if valid admin token already exists
    const checkAuth = async () => {
      const valid = await apiClient.verifyAdminSession();
      setIsAdminAuthenticated(valid);
    };
    checkAuth();
  }, []);

  const handleOpenAdmin = async () => {
    const valid = await apiClient.verifyAdminSession();
    if (valid) {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowLoginModal(false);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    await apiClient.logoutAdmin();
    setIsAdminAuthenticated(false);
    setCurrentView('chat');
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF9F5] text-[#222120] font-sans antialiased">
      {currentView === 'admin' ? (
        <AdminDashboard
          onBackToChat={() => setCurrentView('chat')}
          onLogout={handleLogout}
        />
      ) : isWidgetMode ? (
        <WidgetPreviewContainer
          onOpenAdmin={handleOpenAdmin}
          onExitWidgetMode={() => setIsWidgetMode(false)}
        />
      ) : (
        <div className="h-screen w-full flex flex-col">
          <ChatInterface
            onOpenAdmin={handleOpenAdmin}
            isWidgetMode={false}
            onToggleWidgetMode={() => setIsWidgetMode(true)}
          />
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
