import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Save, AlertCircle, Check } from 'lucide-react';
import { fetchAppConfig, saveAppConfig, AppConfig } from '../services/adminSettingsService';
import { useAuth } from '../../auth/hooks/useAuth';
import { DEFAULT_SUFFIX } from '../../settings/constants';

export default function AppSettings() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig>({
    defaultSuffix: DEFAULT_SUFFIX,
    updatedAt: new Date(),
    updatedBy: ''
  });
  const [lastSavedConfig, setLastSavedConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      const data = await fetchAppConfig();
      if (data) {
        setConfig(data);
        setLastSavedConfig(data);
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    // Check if there are actual changes
    if (lastSavedConfig && config.defaultSuffix === lastSavedConfig.defaultSuffix) {
      setIsAlreadySaved(true);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsAlreadySaved(false);
      }, 2000);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    setIsAlreadySaved(false);

    const newConfig: AppConfig = {
      ...config,
      updatedAt: new Date(),
      updatedBy: user.displayName || user.email || 'Admin'
    };

    const ok = await saveAppConfig(newConfig);
    if (ok) {
      setSuccess(true);
      setConfig(newConfig);
      setLastSavedConfig(newConfig);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Failed to save configuration.");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pt-2 pb-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg"><Settings className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Application Settings</h1>
            <p className="text-slate-500 text-sm">Configure global defaults for the entire platform</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Quiz Defaults</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Default Explanation Suffix</label>
              <div className="text-xs text-slate-500 mb-2 ml-1">
                This text will be appended to the explanation of quizzes for users who cannot set their own suffix.
              </div>
              <textarea
                value={config.defaultSuffix}
                onChange={(e) => setConfig({ ...config, defaultSuffix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                placeholder="Enter default suffix text..."
              />
            </div>

            {config.updatedBy && (
              <div className="text-xs text-slate-400 italic flex flex-col gap-0.5">
                <span>Last updated by {config.updatedBy}</span>
                {config.updatedAt && (
                  <span className="text-[10px] opacity-75">
                    {new Date(config.updatedAt.seconds ? config.updatedAt.toDate() : config.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                success 
                  ? isAlreadySaved ? 'bg-slate-500 text-white shadow-slate-100' : 'bg-green-600 text-white shadow-green-100' 
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <><Check className="w-5 h-5" /> {isAlreadySaved ? 'Already Saved' : 'Changes Saved!'}</>
              ) : (
                <><Save className="w-5 h-5" /> Save Configuration</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
