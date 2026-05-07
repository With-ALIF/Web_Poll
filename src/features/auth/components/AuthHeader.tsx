import React from 'react';

export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <img 
        src="https://i.postimg.cc/RZ8xLzf7/Purple-White-Playful-Quiz-Time-Video-20260318-195033-0000.jpg" 
        alt="TeleQuiz Logo" 
        className="w-20 h-20 object-cover rounded-2xl shadow-lg border-2 border-white mb-4 flex-shrink-0" 
        referrerPolicy="no-referrer" 
      />
      <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">TeleQuiz</h1>
      <p className="text-slate-500 text-sm font-medium">The Ultimate Telegram Quiz Platform</p>
    </div>
  );
}
