import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Home, 
  FileText, 
  CheckSquare, 
  Layout, 
  FileSpreadsheet, 
  Info, 
  Settings, 
  LogOut, 
  LogIn,
  User,
  Shield,
  BarChart3,
  Database,
  Camera,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

interface MobileMenuProps {
  user: any;
  profilePhoto: string | null;
  displayName: string | null;
  logout: () => void;
  toggleMenu: () => void;
}

export default function MobileMenu({ user, profilePhoto, displayName, logout, toggleMenu }: MobileMenuProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const permissions = user?.permissions || [];
  const hasPermission = (pageId: string) => isAdmin || permissions.includes(pageId);

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors ${
      isActive 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
    }`;

  return (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 h-[calc(100vh-4rem)] overflow-y-auto">
      {user && (
        <div className="flex items-center gap-3 pb-6 mb-2 border-b border-slate-100 px-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 bg-blue-50 flex items-center justify-center">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{displayName || user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        {isAdmin && (
          <>
          <NavLink to="/system-stats" onClick={toggleMenu} className={linkClass}>
              <BarChart3 className="w-5 h-5" />
             Dashboard
            </NavLink>
            <NavLink to="/admin" onClick={toggleMenu} className={linkClass}>
              <Shield className="w-5 h-5" />
              User Panel
            </NavLink>
            <NavLink to="/admin/features" onClick={toggleMenu} className={linkClass}>
              <Layout className="w-5 h-5" />
              Feature  
            </NavLink>
          </>
        )}

        {user && !isAdmin && hasPermission('ocr') && (
          <NavLink to="/ocr" onClick={toggleMenu} className={linkClass}>
            <Camera className="w-5 h-5" />
            OCR Scan
          </NavLink>
        )}

        {user && !isAdmin && (
          <NavLink to="/" onClick={toggleMenu} className={linkClass}>
            <Home className="w-5 h-5" />
            Home
          </NavLink>
        )}
        
        {user && !isAdmin && hasPermission('drafts') && (
          <NavLink to="/drafts" onClick={toggleMenu} className={linkClass}>
            <FileText className="w-5 h-5" />
            Drafts
          </NavLink>
        )}
        
        {user && !isAdmin && hasPermission('polls') && (
          <NavLink to="/polls" onClick={toggleMenu} className={linkClass}>
            <CheckSquare className="w-5 h-5" />
            Polls
          </NavLink>
        )}
        
        {user && !isAdmin && hasPermission('qbs') && (
          <NavLink to="/qbs" onClick={toggleMenu} className={linkClass}>
            <Database className="w-5 h-5" />
            QBS
          </NavLink>
        )}

        {user && !isAdmin && hasPermission('photocard') && (
          <NavLink to="/photocard" onClick={toggleMenu} className={linkClass}>
            <Sparkles className="w-5 h-5" />
            PhotoCard
          </NavLink>
        )}
        
        {user && !isAdmin && hasPermission('formats') && (
          <NavLink to="/channel-formats" onClick={toggleMenu} className={linkClass}>
            <Layout className="w-5 h-5" />
            Formats
          </NavLink>
        )}
        
        {user && !isAdmin && hasPermission('csv-modifier') && (
          <NavLink to="/csv-modifier" onClick={toggleMenu} className={linkClass}>
            <FileSpreadsheet className="w-5 h-5" />
            CSV Modifier
          </NavLink>
        )}
        
        {!isAdmin && (
          <NavLink to="/about" onClick={toggleMenu} className={linkClass}>
            <Info className="w-5 h-5" />
            About
          </NavLink>
        )}
        
        {user && (
          <NavLink to="/profile" onClick={toggleMenu} className={linkClass}>
            <User className="w-5 h-5" />
            Profile
          </NavLink>
        )}
        
        {user && (
          <NavLink to="/settings" onClick={toggleMenu} className={linkClass}>
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 px-2">
        {user ? (
          <button 
            onClick={() => { logout(); toggleMenu(); }} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-red-600 w-full text-left hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        ) : (
          <button 
            onClick={() => { navigate('/auth'); toggleMenu(); }} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-blue-600 w-full text-left hover:bg-blue-50 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
