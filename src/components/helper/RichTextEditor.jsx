'use client'
import React from 'react'

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write details here...' }) {
  return (
    <div className="w-full flex flex-col border border-slate-200 bg-white">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-semibold select-none">
        <button
          type="button"
          onClick={() => onChange(value + ' **Bold** ')}
          className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 font-bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => onChange(value + ' *Italic* ')}
          className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 italic font-serif"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => onChange(value + '\n• Bullet point ')}
          className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 font-mono"
        >
          • List
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full p-3 text-xs text-slate-800 bg-transparent outline-none resize-y min-h-[120px] font-sans"
      />
    </div>
  )
}
