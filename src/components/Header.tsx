import React, { useState } from 'react';
import { Settings, LogOut, LogIn, Menu, X, User as UserIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import DesktopNav from './DesktopNav';
import MobileMenu from './MobileMenu';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const profilePhoto = user?.photoURL;
  const displayName = user?.displayName;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to={isAdmin ? "/system-stats" : "/"} className="flex items-center gap-2 text-blue-600">
            <img 
              src="https://i.postimg.cc/RZ8xLzf7/Purple-White-Playful-Quiz-Time-Video-20260318-195033-0000.jpg" 
              alt="TeleQuiz Logo" 
              className="w-9 h-9 object-cover rounded-xl shadow-sm border border-slate-100" 
              referrerPolicy="no-referrer" 
            />
            <h1 className="text-xl font-bold tracking-tight text-blue-600">
              TeleQuiz
            </h1>
          </NavLink>

          {/* Desktop Nav */}
          <DesktopNav user={user} />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleMenu} className="md:hidden p-2 text-slate-500 hover:text-slate-900">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <NavLink to="/settings" className={({ isActive }) => `transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`} title="Settings">
                <Settings className="w-6 h-6" />
              </NavLink>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <NavLink to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 hover:ring-2 ring-blue-400 transition-all flex items-center justify-center bg-blue-50">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt={displayName || user.displayName || 'User'} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-700 font-bold text-sm">
                      {user.email ? user.email.substring(0, 2).toUpperCase() : <UserIcon className="w-5 h-5" />}
                    </div>
                  )}
                </NavLink>
                <button onClick={logout} className="text-slate-500 hover:text-slate-900 transition-colors" title="Logout">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} className="text-slate-500 hover:text-slate-900 transition-colors" title="Sign In">
                <LogIn className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <MobileMenu 
          user={user} 
          profilePhoto={profilePhoto} 
          displayName={displayName} 
          logout={logout} 
          toggleMenu={toggleMenu} 
        />
      )}
    </header>
  );
}
