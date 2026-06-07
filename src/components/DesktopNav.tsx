import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, CheckSquare, Layout, FileSpreadsheet, Info, Shield, BarChart3, Database, Settings, Camera, Sparkles } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function DesktopNav({ user }: { user: any }) {
  const { isAdmin } = useAuth();
  const permissions = user?.permissions || [];
  const hasPermission = (pageId: string) => isAdmin || permissions.includes(pageId);

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-2 text-sm font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`;

  return (
    <nav className="hidden md:flex items-center gap-6">
      {isAdmin && (
        <>
          <NavLink to="/system-stats" className={linkClass}>
            <BarChart3 className="w-4 h-4" />
           Dashboard
          </NavLink>
          <NavLink to="/admin" className={linkClass}>
            <Shield className="w-4 h-4" />
            Users Panel
          </NavLink>
          <NavLink to="/admin/features" className={linkClass}>
            <Layout className="w-4 h-4" />
            Features
          </NavLink>
          <NavLink to="/admin/suffix" className={linkClass}>
            <Settings className="w-4 h-4" />
            Suffix Settings
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
        </>
      )}
      
      {user && !isAdmin && (
        <NavLink to="/" className={linkClass}>
          <Home className="w-4 h-4" />
          Home
        </NavLink>
      )}

      {user && !isAdmin && hasPermission('note') && (
        <NavLink to="/note" className={linkClass}>
          <FileText className="w-4 h-4" />
          Smart Note
        </NavLink>
      )}

      {user && !isAdmin && hasPermission('ocr') && (
        <NavLink to="/ocr" className={linkClass}>
          <Camera className="w-4 h-4" />
          OCR Scan
        </NavLink>
      )}

      {user && !isAdmin && hasPermission('drafts') && (
        <NavLink to="/drafts" className={linkClass}>
          <FileText className="w-4 h-4" />
          Drafts
        </NavLink>
      )}
      {user && !isAdmin && hasPermission('polls') && (
        <NavLink to="/polls" className={linkClass}>
          <CheckSquare className="w-4 h-4" />
          Polls
        </NavLink>
      )}
      {user && !isAdmin && hasPermission('qbs') && (
        <NavLink to="/qbs" className={linkClass}>
          <Database className="w-4 h-4" />
          QBS
        </NavLink>
      )}
      {user && !isAdmin && (
        <NavLink to="/photocard" className={linkClass}>
          <Sparkles className="w-4 h-4" />
          PhotoCard
        </NavLink>
      )}
      {user && !isAdmin && hasPermission('formats') && (
        <NavLink to="/channel-formats" className={linkClass}>
          <Layout className="w-4 h-4" />
          Formats
        </NavLink>
      )}
      {user && !isAdmin && hasPermission('csv-modifier') && (
        <NavLink to="/csv-modifier" className={linkClass}>
          <FileSpreadsheet className="w-4 h-4" />
          CSV Modifier
        </NavLink>
      )}
      
      {!isAdmin && (
        <NavLink to="/about" className={linkClass}>
          <Info className="w-4 h-4" />
          About
        </NavLink>
      )}
      {user && !isAdmin && (
        <NavLink to="/settings" className={linkClass}>
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      )}
    </nav>
  );
}
