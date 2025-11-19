import React from 'react'

export default function Hero({children}){
  return (
    <header className="max-w-3xl mx-auto text-center py-16 px-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Make me a millionaire — send a crazy tip! 🤣</h1>
      <p className="mt-4 text-lg text-slate-200">If you like what I do, drop a small tip and make my day (or my million)!</p>
      <div className="mt-8">{children}</div>
      <p className="mt-6 text-sm text-slate-300">Secure payment via Stripe or PayPal.</p>
    </header>
  )
}
