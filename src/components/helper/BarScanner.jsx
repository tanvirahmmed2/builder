'use client'
import React, { useState, useEffect, useRef } from 'react'
import { BiBarcode, BiSearch } from 'react-icons/bi'

export default function BarScanner({ onScan }) {
  const [barcode, setBarcode] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (barcode.trim()) {
      onScan(barcode.trim())
      setBarcode('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 bg-white px-3 py-2 border border-slate-200">
      <BiBarcode className="text-xl text-slate-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Scan barcode or type code and press Enter..."
        className="w-full text-xs text-slate-800 bg-transparent outline-none"
      />
      <button
        type="submit"
        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shrink-0"
      >
        Scan
      </button>
    </form>
  )
}
