import React, {useState, useEffect} from 'react'

export default function DonateButtons({onDonate, onPayPalCreate}){
  const [custom, setCustom] = useState('')

  // Render PayPal buttons when SDK loads
  useEffect(() => {
    if (typeof window === 'undefined') return
    const payPalContainer = document.getElementById('paypal-buttons')
    if (!payPalContainer) return
    if (window.paypal && !payPalContainer.hasChildNodes()) {
      try {
        window.paypal.Buttons({
          style: { layout: 'horizontal' },
          createOrder: async function() {
            // Create order on the server with a default €5 amount (500 cents)
            const resp = await fetch('/api/create-paypal-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: 500 })
            })
            const data = await resp.json()
            if (data.id) return data.id
            throw new Error('Failed to create PayPal order')
          },
          onApprove: async function(data) {
            // Capture order on the server
            try {
              const resp = await fetch('/api/capture-paypal-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID })
              })
              const cap = await resp.json()
              if (cap.status === 'COMPLETED' || cap.status === 'COMPLETED' || cap.purchase_units) {
                alert('Thanks for the PayPal tip!')
              } else {
                alert('PayPal capture response received')
              }
            } catch (err) {
              console.error('Capture error', err)
              alert('Error capturing PayPal order')
            }
          }
        }).render('#paypal-buttons')
      } catch (err) {
        console.warn('PayPal Buttons render error', err)
      }
    }
  }, [])

  const handleDonate = (euros) => {
    // convert to cents
    const cents = Math.round(Number(euros) * 100)
    onDonate(cents)
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-3 flex-wrap justify-center">
        <button className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 shadow" onClick={()=>handleDonate(5)}>Donate €5</button>
        <button className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 shadow" onClick={()=>handleDonate(10)}>Donate €10</button>
        <button className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 shadow" onClick={()=>handleDonate(25)}>Donate €25</button>
      </div>

      <div className="flex items-center gap-2">
        <input type="number" min="1" step="0.5" placeholder="Custom amount €" value={custom} onChange={e=>setCustom(e.target.value)} className="px-3 py-2 rounded bg-slate-800 text-white"/>
        <button className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400" onClick={()=>{ if(custom) handleDonate(custom)}}>Custom amount</button>
      </div>

      <div className="w-full max-w-sm mt-2">
        <div id="paypal-buttons" />
      </div>
    </div>
  )
}

