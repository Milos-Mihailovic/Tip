import React from 'react'

export default function Success({open, onClose}){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white text-slate-900 rounded-lg p-8 max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-bold">Thank you! You’re a legend — a millionaire in the making! 💸</h2>
        <p className="mt-3 text-sm text-slate-700">Your tip made my day. Back to home to keep the fun going.</p>
        <div className="mt-6 text-right">
          <button className="px-4 py-2 bg-violet-600 text-white rounded" onClick={onClose}>Back to Home</button>
        </div>
      </div>
    </div>
  )
}
