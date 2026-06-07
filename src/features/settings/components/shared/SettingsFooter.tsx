import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingsFooterProps {
  onSave: () => void;
  onLogout: () => void;
}

export default function SettingsFooter({ onSave, onLogout }: SettingsFooterProps) {
  const navigate = useNavigate();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
      {isConfirmingReset ? (
        <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-100 mb-2 sm:mb-0">
          <span className="text-xs font-bold text-red-700 px-2 text-nowrap">Reset All?</span>
          <button
            onClick={() => setIsConfirmingReset(false)}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
          >
            No
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            Yes
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
            <button
            onClick={() => setIsConfirmingReset(true)}
            className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all whitespace-nowrap mb-2 sm:mb-0 active:scale-95"
            >
            Reset All Data
            </button>
            <button
            onClick={() => setIsConfirmingLogout(true)}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition-all whitespace-nowrap mb-2 sm:mb-0 active:scale-95"
            >
            Logout
            </button>
        </div>
      )}
      {isConfirmingLogout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Logout</h3>
                <p className="text-slate-600 mb-6">Are you sure you want to logout of your account?</p>
                <div className="flex gap-3">
                    <button onClick={() => setIsConfirmingLogout(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button>
                    <button onClick={onLogout} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl">Logout</button>
                </div>
            </div>
          </div>
      )}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end pr-1 sm:pr-0">
        <button
          onClick={() => navigate('/')}
          className="px-4 sm:px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200 rounded-xl transition-all whitespace-nowrap active:scale-95"
        >
          Back to Home
        </button>
        <button
          onClick={handleSaveClick}
          className={`px-4 sm:px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-colors shadow-sm whitespace-nowrap ${
            isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
