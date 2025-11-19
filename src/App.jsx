import React, {useEffect, useState} from 'react'
import './App.css'
import './index.css'
import Hero from './components/Hero'
import DonateButtons from './components/DonateButtons'
import PaymentModal from './components/PaymentModal'
import Success from './components/Success'
import AdminDemo from './components/AdminDemo'

function App(){
  const [modalOpen, setModalOpen] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    if(params.get('status') === 'success'){
      setSuccessOpen(true)
      // clean url
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  },[])

  async function handleDonate(amountCents){
    setLoading(true)
    try{
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountCents })
      })
      const data = await res.json()
      if(data.url){
        // show modal with QR + open link option (don't force immediate redirect)
        setCheckoutUrl(data.url)
        setModalOpen(true)
      } else {
        console.error('No session url', data)
        alert('Failed to create checkout session')
      }
    }catch(err){
      console.error(err)
      alert('Error creating session')
    } finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    // load PayPal SDK if client ID provided
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
    if(!clientId) return
    const id = 'paypal-sdk'
    if(document.getElementById(id)) return
    const s = document.createElement('script')
    s.id = id
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`
    s.async = true
    s.onload = ()=>{
      // noop - buttons will be rendered by DonateButtons container if present
    }
    document.body.appendChild(s)
  },[])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Hero>
          <DonateButtons onDonate={handleDonate} />
        </Hero>

        <section className="max-w-3xl mx-auto px-6">
          <AdminDemo />
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-slate-300">
        Secure payments via Stripe / PayPal. No data shared with third parties.
      </footer>

      <PaymentModal open={loading} onClose={()=>setModalOpen(false)} title="Processing">
        <p className="text-slate-200">Creating secure checkout…</p>
      </PaymentModal>

      <PaymentModal open={modalOpen} onClose={() => { setModalOpen(false); setCheckoutUrl(null) }} title="Open secure checkout">
        {checkoutUrl && (
          <div className="flex flex-col items-center gap-4">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(checkoutUrl)}`} alt="QR code to checkout" className="rounded" />
            <div className="text-sm text-slate-300 break-words max-w-full">Scan the QR code or open the checkout link below.</div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-emerald-500 text-white rounded" onClick={() => { window.open(checkoutUrl, '_blank') }}>Open Checkout</button>
              <button className="px-4 py-2 bg-slate-700 text-white rounded" onClick={() => { navigator.clipboard?.writeText(checkoutUrl); alert('Link copied to clipboard') }}>Copy link</button>
            </div>
          </div>
        )}
      </PaymentModal>

      <Success open={successOpen} onClose={()=>setSuccessOpen(false)} />
    </div>
  )
}

export default App
