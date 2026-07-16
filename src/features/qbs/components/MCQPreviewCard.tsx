import React, { useState, useEffect } from 'react';
import { MCQData } from '../types';
import { renderMathInHtml } from '../utils/katex';
import { Edit2, Trash2, Save, X } from 'lucide-react';

interface MCQPreviewCardProps {
  item: MCQData;
  index: number;
  onUpdate: (index: number, updatedItem: MCQData) => void;
  onDelete?: (index: number) => void;
}

export default function MCQPreviewCard({ item, index, onUpdate, onDelete }: MCQPreviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<MCQData>({ ...item });
  const [showImageUrls, setShowImageUrls] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setEditedItem({ ...item });
  }, [
    item.question,
    item.option_1,
    item.option_2,
    item.option_3,
    item.option_4,
    item.option_5,
    item.correct_options,
    item.explanation,
    item.paper_id,
    item.chapter_id,
    item.topic_id,
    item.question_image,
    item.option_1_image,
    item.option_2_image,
    item.option_3_image,
    item.option_4_image,
    item.option_5_image,
    item.explanation_image
  ]);

  const handleSave = () => {
    onUpdate(index, editedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem({ ...item });
    setIsEditing(false);
  };

  const toggleCorrectOption = (optNum: number) => {
    const numStr = String(optNum);
    let list = editedItem.correct_options.split(',').map(s => s.trim()).filter(Boolean);
    if (list.includes(numStr)) {
      list = list.filter(x => x !== numStr);
    } else {
      list.push(numStr);
      list.sort();
    }
    setEditedItem(prev => ({
      ...prev,
      correct_options: list.join(',')
    }));
  };

  const options = [item.option_1, item.option_2, item.option_3, item.option_4, item.option_5];
  const optionImages = [
    item.option_1_image,
    item.option_2_image,
    item.option_3_image,
    item.option_4_image,
    item.option_5_image
  ];

  if (isEditing) {
    return (
      <div className="p-6 border-2 border-indigo-500 rounded-2xl bg-white shadow-md space-y-4 animate-in fade-in duration-200 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-black text-indigo-700 text-xs tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            MCQ #{index + 1} সম্পাদনা করুন
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
            >
              <X className="w-3.5 h-3.5" />
              বাতিল
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              সংরক্ষণ
            </button>
          </div>
        </div>

        {/* Question Textarea & Live Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-700">প্রশ্ন (HTML ও KaTeX সমর্থিত)</label>
          <textarea
            value={editedItem.question}
            onChange={(e) => setEditedItem(prev => ({ ...prev, question: e.target.value }))}
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-bold font-mono min-h-[80px]"
          />
          <div className="p-2.5 border border-slate-100 rounded-lg bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">প্রশ্ন লাইভ প্রিভিউ:</span>
            <div className="text-xs font-bold text-slate-800 font-bengali leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMathInHtml(editedItem.question) }} />
          </div>
        </div>

        {/* Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Paper ID</label>
            <input
              type="text"
              value={editedItem.paper_id}
              onChange={(e) => setEditedItem(prev => ({ ...prev, paper_id: e.target.value }))}
              placeholder="e.g. b1"
              className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-bold uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Chapter ID</label>
            <input
              type="text"
              value={editedItem.chapter_id}
              onChange={(e) => setEditedItem(prev => ({ ...prev, chapter_id: e.target.value }))}
              placeholder="e.g. 1"
              className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">Topic Name</label>
            <input
              type="text"
              value={editedItem.topic_id}
              onChange={(e) => setEditedItem(prev => ({ ...prev, topic_id: e.target.value }))}
              placeholder="e.g. ভৌত আলোকবিজ্ঞান"
              className="w-full px-3 py-1.5 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-bold"
            />
          </div>
        </div>

        {/* Options Loop */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-700">অপশনসমূহ ও সঠিক উত্তর নির্ধারণ</label>
          {[1, 2, 3, 4, 5].map((num) => {
            const optKey = `option_${num}` as keyof MCQData;
            const isCorrect = editedItem.correct_options.split(',').map(s => s.trim()).filter(Boolean).includes(String(num));
            
            return (
              <div key={num} className={`p-3 rounded-xl border-2 transition-all flex flex-col md:flex-row md:items-center gap-3 ${
                isCorrect ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/30 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                    {num === 1 ? 'ক' : num === 2 ? 'খ' : num === 3 ? 'গ' : num === 4 ? 'ঘ' : 'ঙ'}
                  </span>
                  <input
                    type="text"
                    value={editedItem[optKey] as string}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, [optKey]: e.target.value }))}
                    placeholder={`অপশন ${num} লিখুন...`}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-bold"
                  />
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCorrect}
                    onChange={() => toggleCorrectOption(num)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-xs font-black text-emerald-800">সঠিক উত্তর</span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Toggle Advanced Images */}
        <div>
          <button
            type="button"
            onClick={() => setShowImageUrls(!showImageUrls)}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-all flex items-center gap-1"
          >
            {showImageUrls ? 'ー ইমেজ লিংকসমূহ লুকান' : '＋ ইমেজ লিংকসমূহ সম্পাদনাকরুন (ঐচ্ছিক)'}
          </button>
          {showImageUrls && (
            <div className="mt-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
              <div>
                <label className="block text-[10px] font-black text-slate-600 mb-1">প্রশ্ন ইমেজ লিংক (Question Image URL)</label>
                <input
                  type="text"
                  value={editedItem.question_image}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, question_image: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => {
                  const optImgKey = `option_${num}_image` as keyof MCQData;
                  return (
                    <div key={num}>
                      <label className="block text-[9px] font-black text-slate-500 mb-1">অপশন {num} ইমেজ</label>
                      <input
                        type="text"
                        value={editedItem[optImgKey] as string}
                        onChange={(e) => setEditedItem(prev => ({ ...prev, [optImgKey]: e.target.value }))}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-[10px] font-mono"
                      />
                    </div>
                  );
                })}
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 mb-1">ব্যাখ্যা ইমেজ লিংক (Explanation Image URL)</label>
                <input
                  type="text"
                  value={editedItem.explanation_image}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, explanation_image: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Explanation Textarea & Live Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-700">ব্যাখ্যা (HTML ও KaTeX সমর্থিত)</label>
          <textarea
            value={editedItem.explanation}
            onChange={(e) => setEditedItem(prev => ({ ...prev, explanation: e.target.value }))}
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs font-bold font-mono min-h-[80px]"
          />
          {editedItem.explanation && (
            <div className="p-2.5 border border-slate-100 rounded-lg bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">ব্যাখ্যা লাইভ প্রিভিউ:</span>
              <div className="text-xs font-bold text-slate-800 font-bengali leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMathInHtml(editedItem.explanation) }} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black transition-all"
          >
            বাতিল করুন
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-indigo-100"
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 relative group">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] font-black text-rose-800 px-1">মুছে ফেলবেন?</span>
            <button
              onClick={() => onDelete?.(index)}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black transition-all shadow-sm"
            >
              হ্যাঁ
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-black transition-all"
            >
              না
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
              title="সম্পাদনা করুন"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {onDelete && (
              <button
                onClick={() => setIsConfirmingDelete(true)}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[10px] px-2 py-0.5 rounded-full">
          MCQ #{index + 1}
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 pr-32">
        {item.paper_id && (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md uppercase">
            Paper: {item.paper_id}
          </span>
        )}
        {item.chapter_id && (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
            Chapter: {item.chapter_id}
          </span>
        )}
        {item.topic_id && (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] px-2 py-0.5 rounded-md">
            Topic: {item.topic_id}
          </span>
        )}
      </div>

      {/* Question */}
      <div className="mb-4">
        <h4 
          className="font-bold text-slate-800 text-sm leading-relaxed mb-2 font-bengali" 
          dangerouslySetInnerHTML={{ __html: renderMathInHtml(item.question) }} 
        />
        {item.question_image && (
          <div className="p-2 border border-slate-200 rounded-lg bg-white inline-block">
            <img 
              src={item.question_image} 
              alt="Question" 
              className="max-h-24 rounded object-contain" 
              referrerPolicy="no-referrer" 
            />
            <span className="block font-mono text-[9px] text-slate-400 mt-1">Image: {item.question_image}</span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {options.map((opt, optIdx) => {
          if (!opt) return null;
          const isCorrect = item.correct_options.split(',').map(s => s.trim()).filter(Boolean).includes(String(optIdx + 1));
          const optImg = optionImages[optIdx];
          
          return (
            <div 
              key={optIdx} 
              className={`p-3 rounded-lg border text-xs font-semibold leading-relaxed flex flex-col justify-between ${
                isCorrect 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-bold' 
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span className="font-bengali" dangerouslySetInnerHTML={{ __html: renderMathInHtml(opt) }} />
              {optImg && (
                <div className="mt-2 p-1 border border-slate-200 rounded bg-white inline-block max-w-[150px]">
                  <img 
                    src={optImg} 
                    alt={`Option ${optIdx + 1}`} 
                    className="max-h-16 rounded object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                  <span className="block font-mono text-[8px] text-slate-400 mt-0.5 truncate">Img: {optImg}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {(item.explanation || item.explanation_image) && (
        <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-lg text-xs leading-relaxed text-slate-600">
          <span className="font-bold text-indigo-900 block mb-1 font-bengali">ব্যাখ্যা:</span>
          {item.explanation && (
            <p className="font-bengali" dangerouslySetInnerHTML={{ __html: renderMathInHtml(item.explanation) }} />
          )}
          {item.explanation_image && (
            <div className="mt-2 p-1 border border-indigo-100 rounded bg-white inline-block">
              <img 
                src={item.explanation_image} 
                alt="Explanation" 
                className="max-h-24 rounded object-contain" 
                referrerPolicy="no-referrer" 
              />
              <span className="block font-mono text-[8px] text-slate-400 mt-0.5">Image: {item.explanation_image}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
