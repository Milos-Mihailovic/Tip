import React from 'react'

export default function PaymentModal({open, children, onClose, title}){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-lg p-6 max-w-lg w-full shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title || 'Payment'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
