import React from 'react'

const MOCK = Array.from({length:10}).map((_,i)=>({
  id: i+1,
  amount: [500,1000,2500,300][i%4],
  time: new Date(Date.now() - i*3600*1000).toLocaleString(),
  method: i%2===0? 'Stripe':'PayPal'
}))

export default function AdminDemo(){
  return (
    <section className="max-w-3xl mx-auto mt-12 p-4 bg-slate-800/40 rounded-lg">
      <h3 className="text-lg font-semibold text-white">Admin / Demo — Last 10 payments (mock)</h3>
      <ul className="mt-4 grid gap-2">
        {MOCK.map(x=> (
          <li key={x.id} className="flex justify-between text-sm text-slate-200 bg-slate-900/50 p-2 rounded">
            <div>{x.method} • €{(x.amount/100).toFixed(2)}</div>
            <div className="text-slate-400">{x.time}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
