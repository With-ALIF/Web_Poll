import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  CalendarCheck, 
  Clock, 
  CreditCard, 
  Receipt, 
  Info, 
  UserCircle,
  Sparkles,
  BarChart3,
  Shield,
  Settings,
  Home,
  Camera,
  FileText,
  CheckSquare,
  Database,
  FileSpreadsheet,
  Layout,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
      isActive 
        ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {({ isActive }) => (
      <>
        {isActive && <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />}
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
        <span className="text-sm font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const permissions = user?.permissions || [];
  const hasPermission = (pageId: string) => isAdmin || permissions.includes(pageId);

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col p-4">
      {/* Brand Section */}
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <img 
            src="https://i.postimg.cc/RZ8xLzf7/Purple-White-Playful-Quiz-Time-Video-20260318-195033-0000.jpg" 
            alt="Logo" 
            className="w-8 h-8 object-cover rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">TELE</p>
          <h2 className="text-xl font-black text-gray-950 tracking-tight leading-none uppercase">QUIZ</h2>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {isAdmin ? (
          <>
            <NavItem to="/system-stats" icon={BarChart3} label="Dashboard" />
            <NavItem to="/admin" icon={Shield} label="Users Panel" />
            <NavItem to="/admin/features" icon={Layout} label="Features" />
          </>
        ) : (
          <>
            <NavItem to="/" icon={Home} label="Home" />
            {hasPermission('ocr') && <NavItem to="/ocr" icon={Camera} label="OCR Scan" />}
            {hasPermission('drafts') && <NavItem to="/drafts" icon={FileText} label="Drafts" />}
            {hasPermission('polls') && <NavItem to="/polls" icon={CheckSquare} label="Polls" />}
            {hasPermission('qbs') && <NavItem to="/qbs" icon={Database} label="QBS" />}
            {hasPermission('exam-paper') && <NavItem to="/exam-paper" icon={FileText} label="ExamPaper" />}
            {hasPermission('photocard') && <NavItem to="/photocard" icon={Sparkles} label="PhotoCard" />}
            {hasPermission('formats') && <NavItem to="/channel-formats" icon={Layout} label="Formats" />}
            {hasPermission('csv-modifier') && <NavItem to="/csv-modifier" icon={FileSpreadsheet} label="CSV Modifier" />}
          </>
        )}
      </nav>

      {/* Footer Navigation */}
      <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
        <NavItem to="/about" icon={Info} label="About" />
        {user && (
          <>
            <NavItem to="/profile" icon={UserCircle} label="Profile" />
            <NavItem to="/settings" icon={Settings} label="Settings" />
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
