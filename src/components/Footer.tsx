import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="w-full px-4 py-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} TeleQuiz. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
