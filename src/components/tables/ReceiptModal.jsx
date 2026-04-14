import { usePos, formatPrice, formatTime } from '../../context/PosContext'
import { useAuth } from '../../context/AuthContext'
import { createPortal } from 'react-dom'

/**
 * ReceiptModal component redesigned for AXIPH GAMING
 * Optimized for professional thermal printing (58mm or 80mm)
 */
export default function ReceiptModal({ session, onClose }) {
  const { state } = usePos()
  const { club } = useAuth()

  const handlePrint = () => {
    window.print()
  }

  if (!session) return null

  // Ensure id is a string for slicing
  const shortId = String(session.id).slice(-8)

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 print:bg-white print:p-0 print:block">
      {/* Print-only CSS to force 1 page and clean layout */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          #root {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .receipt-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            color: black !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="receipt-container w-full max-w-sm bg-white text-black rounded-3xl overflow-hidden shadow-2xl p-8 font-sans print:rounded-none print:shadow-none print:max-w-none">
        
        {/* Header - AXIPH Branding */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-4" style={{ letterSpacing: '-0.05em' }}>
            AXIPH <span className="text-[20px] mx-1">X</span> {club?.name || 'GAMING'}
          </h2>
          
          <div className="flex flex-col items-center gap-1 text-[11px] font-mono text-gray-500 border-y border-dashed border-gray-200 py-3">
            <span className="font-black text-black">CHEK #{shortId}</span>
            <span>{new Date(session.endTime || Date.now()).toLocaleString('uz-UZ', { 
              year: 'numeric', month: '2-digit', day: '2-digit', 
              hour: '2-digit', minute: '2-digit' 
            })}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stol raqami:</span>
            <span className="text-xl font-black">{session.tableName}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sessiya vaqti:</span>
            <span className="text-lg font-mono font-black">{formatTime(session.elapsedSeconds)}</span>
          </div>
        </div>

        {/* Separation */}
        <div className="h-px border-t-2 border-dashed border-gray-200 mb-6" />

        {/* Details Breakdown */}
        <div className="space-y-6 mb-10">
          <div>
             <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-3">XIZMATLAR</p>
             <div className="flex justify-between text-sm items-center">
               <div className="flex flex-col">
                 <span className="font-bold">Kompyuter ijarasi</span>
                 <span className="text-[10px] text-gray-500 font-mono italic">{formatPrice(session.pricePerHour)} / soat</span>
               </div>
               <span className="font-black text-gray-900">{formatPrice(Math.round((session.elapsedSeconds / 3600) * session.pricePerHour))}</span>
             </div>
          </div>

          {session.orders?.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-3">BUYURTMALAR</p>
              <div className="space-y-2.5">
                {session.orders.map((o, i) => {
                  const food = state.foods.find(f => f.id === o.foodId)
                  return (
                    <div key={i} className="flex justify-between text-sm items-center">
                      <div className="flex flex-col">
                        <span className="font-bold">{food?.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono italic">{formatPrice(food?.price || 0)} × {o.qty}</span>
                      </div>
                      <span className="font-black text-gray-900">{formatPrice((food?.price || 0) * o.qty)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Total Payment */}
        <div className="border-t-4 border-double border-black pt-6 mb-8">
          <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl print:bg-transparent print:p-0">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-600">JAMI TO'LOV</span>
            <span className="text-3xl font-black tracking-tighter font-mono">{formatPrice(session.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 space-y-2 mb-4">
          <p className="text-sm font-black uppercase tracking-[0.1em] text-gray-900 italic">Bizni tanlaganingiz uchun rahmat!</p>
          <div className="flex flex-col items-center opacity-30">
            <span className="text-[8px] font-mono uppercase tracking-[0.5em]">axiph pos v1.0 • verified payment</span>
          </div>
        </div>

        {/* Actions - Hidden when printing */}
        <div className="mt-10 space-y-4 no-print border-t border-gray-100 pt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full bg-black text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-800 active:scale-[0.98] transition-all shadow-2xl shadow-black/10"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Chop etish
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-[0.4em] transition-all font-sans"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
