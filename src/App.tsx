/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ToastContainer, ToastMessage } from './components/Toast';

const MainContent: React.FC = () => {
  const { currentUser } = useEventContext();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Navbar onShowToast={addToast} />

      {/* Main View Container */}
      <main className="flex-1">
        {!currentUser ? (
          <AuthView onShowToast={addToast} />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard onShowToast={addToast} />
        ) : (
          <StudentDashboard onShowToast={addToast} />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-zinc-200 py-4 px-4 text-center text-xs text-zinc-500">
        <p>PRMCEAM College Event Management System &copy; {new Date().getFullYear()} • All Rights Reserved</p>
      </footer>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <EventProvider>
      <MainContent />
    </EventProvider>
  );
}
