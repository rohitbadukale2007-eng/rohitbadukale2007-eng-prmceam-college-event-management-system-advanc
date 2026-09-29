import React from 'react';
import { useEventContext } from '../context/EventContext';
import { Sparkles, UserCircle, LogOut, ShieldCheck, GraduationCap, Building } from 'lucide-react';

interface NavbarProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onShowToast }) => {
  const { currentUser, logout } = useEventContext();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <Building className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-zinc-950 tracking-tight text-lg">
                  PRMCEAM <span className="font-medium text-indigo-600">Events</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Portal
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                Campus Event Registration • FIFO Waiting List • Attendance Management
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 pl-3 sm:border-l sm:border-zinc-200">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-100/90 text-amber-900 border border-amber-300/80'
                        : 'bg-indigo-100/90 text-indigo-900 border border-indigo-300/80'
                    }`}
                  >
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-5 h-5 text-amber-700" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-indigo-700" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">
                        {currentUser.name}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold tracking-wide uppercase px-1.5 py-0.2 rounded-sm ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono block truncate max-w-[160px]">
                      {currentUser.rollNumber ? `${currentUser.rollNumber}` : currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    onShowToast('info', 'You have been logged out.');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 transition-all border border-zinc-200 hover:border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                <UserCircle className="w-4 h-4 text-zinc-400" />
                <span>Sign In Required</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
