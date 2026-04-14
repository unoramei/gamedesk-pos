import { useState, useEffect } from 'react'
import { usePos, calcTotal, formatTime, formatPrice } from '../../context/PosContext'
import ReceiptModal from './ReceiptModal'

// ─── Food Drawer ──────────────────────────────────────────────────────────────

function FoodDrawer({ table, onClose }) {
  const { state, addOrder, removeOrder } = usePos()

  const getQty = (foodId) => {
    const o = table.orders.find(o => o.foodId === foodId)
    return o ? o.qty : 0
  }

  const grouped = state.foods.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-md transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-80 h-full bg-surface-container-high border-l border-outline-variant/20 shadow-2xl flex flex-col glass-card animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <div>
            <h3 className="font-black text-on-surface text-sm uppercase tracking-widest">
              Buyurtma
            </h3>
            <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">{table.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Foods */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar">
          {Object.entries(grouped).map(([cat, foods]) => (
            <div key={cat}>
              <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-3 px-2">
                {cat}
              </p>
              <div className="space-y-2">
                {foods.map(food => {
                  const qty = getQty(food.id)
                  return (
                    <div
                      key={food.id}
                      className="bg-surface-container/50 rounded-2xl border border-outline-variant/10 flex items-center justify-between px-4 py-3 hover:border-indigo/30 transition-all group"
                    >
                      <div className="flex-1">
                        <p className="text-[13px] font-black text-on-surface tracking-tight">{food.name}</p>
                        <p className="text-[11px] font-mono text-outline-variant">{formatPrice(food.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => removeOrder({ tableId: table.id, foodId: food.id })}
                              className="w-8 h-8 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface hover:bg-error/10 hover:text-error transition-all"
                            >
                              <span className="material-symbols-outlined text-base">remove</span>
                            </button>
                            <span className="text-sm font-black font-mono text-on-surface w-4 text-center">
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => addOrder({ tableId: table.id, foodId: food.id })}
                          className="w-8 h-8 rounded-xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-indigo hover:bg-indigo hover:text-white transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/20 bg-surface-container-high/50">
          <button
            onClick={onClose}
            className="w-full bg-indigo text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs hover:shadow-2xl hover:shadow-indigo/20 transition-all active:scale-[0.98]"
          >
            Tayyor
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stop Confirmation Modal ──────────────────────────────────────────────────

function StopModal({ table, onConfirm, onCancel }) {
  const { state } = usePos()
  const total = calcTotal(table, state.foods)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-surface-container-high border border-outline-variant/20 rounded-[2.5rem] p-8 shadow-2xl glass-card animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-error/10 flex items-center justify-center mb-4 border border-error/20">
            <span className="material-symbols-outlined text-3xl text-error icon-filled">stop_circle</span>
          </div>
          <h3 className="text-xl font-black text-on-surface tracking-tighter">Sessiyani yakunlash?</h3>
          <p className="text-[11px] text-outline font-bold uppercase tracking-widest mt-1.5">{table.name} — To'lov qabul qilindi</p>
        </div>

        <div className="bg-surface-container/40 border border-outline-variant/10 rounded-3xl p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-outline-variant font-medium">Boshlangan vaqt</span>
            <span className="font-mono text-on-surface">{new Date(table.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-outline-variant font-medium">Davomiyligi</span>
            <span className="font-mono text-on-surface font-black text-tertiary">{formatTime(Math.floor((Date.now() - table.startTime) / 1000))}</span>
          </div>
          <div className="h-px bg-outline-variant/10 border-t border-dashed border-outline-variant/20" />
          <div className="flex justify-between items-baseline pt-2">
            <span className="text-xs font-black text-outline uppercase tracking-widest">Jami to'lov</span>
            <span className="text-2xl font-black text-on-surface font-mono">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl bg-error text-white text-xs font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-error/20 active:scale-[0.98] transition-all"
          >
            To'lovni tasdiqlash
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 text-outline hover:text-on-surface text-xs font-black uppercase tracking-widest transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Table Card ───────────────────────────────────────────────────────────────

export default function TableCard({ table, selectable, selected, onSelect }) {
  const { state, startTable, stopTable, updateTablePrice } = usePos()
  const [showFoodDrawer, setShowFoodDrawer] = useState(false)
  const [showStopModal,  setShowStopModal]  = useState(false)
  const [showReceipt,    setShowReceipt]    = useState(false)
  const [receiptData,    setReceiptData]    = useState(null)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [editPriceVal,   setEditPriceVal]   = useState(String(table.pricePerHour))

  const commitPrice = () => {
    const val = parseInt(editPriceVal.replace(/\D/g, ''), 10)
    if (!isNaN(val) && val > 0) {
      updateTablePrice({ id: table.id, price: val })
    }
    setIsEditingPrice(false)
  }

  const handleStop = () => {
    const elapsedSeconds = Math.floor((Date.now() - table.startTime) / 1000)
    const session = {
      id: Date.now(),
      tableName: table.name,
      pricePerHour: table.pricePerHour,
      elapsedSeconds,
      orders: [...table.orders],
      total: calcTotal({ ...table, elapsedSeconds }, state.foods),
      endTime: Date.now()
    }
    setReceiptData(session)
    stopTable(table.id)
    setShowStopModal(false)
    setShowReceipt(true)
  }

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!table.active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [table.active])

  const total  = calcTotal(table, state.foods, now)
  const isVip  = table.isVip

  // Selection/Styling
  const borderClass = selectable
    ? selected
      ? 'border-2 border-indigo bg-indigo/5 ring-4 ring-indigo/20 scale-[0.98]'
      : 'border-2 border-outline-variant/30 hover:border-indigo/50 cursor-pointer opacity-60 hover:opacity-100 hover:scale-[0.98]'
    : isVip
      ? 'border-2 border-amber/30 bg-surface-container/80 vip-card'
      : table.active
        ? 'border-2 border-tertiary/20 bg-surface-container/60 active-card'
        : 'border border-outline-variant/20 bg-surface-container/40 opacity-80 hover:opacity-100'

  const cardClass = `relative rounded-[2rem] p-6 flex flex-col gap-5 transition-all duration-500 overflow-hidden glass-card ${
    selectable && !selected ? 'grayscale-[50%]' : ''
  } ${borderClass}`

  const timerClass = isVip
    ? 'text-amber'
    : table.active
      ? 'text-tertiary'
      : 'text-outline-variant opacity-40'

  return (
    <>
      <div className={cardClass} onClick={() => selectable && onSelect && onSelect()}>
        
        {/* VIP ambient glow */}
        {isVip && (
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber/10 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${table.active ? 'bg-indigo/10 border-indigo/20 text-indigo' : 'bg-surface-container border-outline-variant/10 text-outline'}`}>
              <span className="material-symbols-outlined text-2xl icon-filled">
                {isVip ? 'workspace_premium' : 'monitor'}
              </span>
            </div>
            <div>
              <h4 className="font-black text-on-surface text-sm tracking-tight">{table.name}</h4>
              <div className="flex items-center gap-1.5 min-h-[16px] mt-0.5">
                {isEditingPrice ? (
                  <div className="flex items-center gap-1.5 bg-surface-container-highest border border-indigo rounded-xl px-2 py-0.5" onClick={e => e.stopPropagation()}>
                    <input autoFocus value={editPriceVal} onChange={e => setEditPriceVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') setIsEditingPrice(false) }} className="bg-transparent border-none outline-none font-mono text-[10px] text-on-surface w-16" />
                    <button onClick={commitPrice} className="text-tertiary"><span className="material-symbols-outlined text-[14px]">check</span></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group/p cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditPriceVal(String(table.pricePerHour)); setIsEditingPrice(true); }}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isVip ? 'text-amber' : 'text-outline'}`}>{formatPrice(table.pricePerHour)}</p>
                    <span className="material-symbols-outlined text-[12px] text-outline opacity-0 group-hover/p:opacity-100 transition-opacity">edit_note</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${table.active ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-outline-variant/10 text-outline border-outline-variant/10'}`}>
             {table.active ? 'Faol' : 'Bo\'sh'}
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className={`font-mono font-black tracking-tighter leading-none select-none transition-all duration-500 ${timerClass} ${table.active ? 'text-5xl scale-110 drop-shadow-[0_0_15px_rgba(74,225,118,0.2)]' : 'text-4xl'}`}>
            {table.active ? formatTime(Math.floor((now - table.startTime) / 1000)) : '00:00:00'}
          </span>
          <p className="text-[10px] text-outline-variant font-black uppercase tracking-[0.3em] mt-3">{table.active ? 'Jonli seans' : 'Tayyor'}</p>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-outline-variant uppercase tracking-[0.2em]">Servis</span>
            {table.active && !selectable && (
              <button onClick={(e) => { e.stopPropagation(); setShowFoodDrawer(true); }} className="w-7 h-7 flex items-center justify-center rounded-xl bg-indigo/5 text-indigo hover:bg-indigo hover:text-white transition-all border border-indigo/10 shadow-sm"><span className="material-symbols-outlined text-sm">add</span></button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[32px] content-start">
            {table.orders.length === 0 ? (
              <div className="flex items-center justify-center w-full min-h-[32px] border border-dashed border-outline-variant/10 rounded-2xl">
                <span className="text-[9px] text-outline-variant font-black uppercase tracking-[0.2em]">—</span>
              </div>
            ) : (
              table.orders.map(o => {
                const food = state.foods.find(f => f.id === o.foodId)
                return (
                  <span key={o.foodId} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest/50 text-on-surface text-[10px] font-black rounded-xl border border-outline-variant/10">
                    {food?.name} <span className="text-outline">× {o.qty}</span>
                  </span>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 border-t border-outline-variant/10 flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-outline uppercase tracking-[0.2em] mb-1">Hisoblangan</span>
            <span className={`text-2xl font-black font-mono tracking-tighter ${table.active ? 'text-on-surface' : 'text-outline-variant'}`}>{formatPrice(total)}</span>
          </div>

          {!selectable && (
            <button
               onClick={(e) => { e.stopPropagation(); table.active ? setShowStopModal(true) : startTable(table.id) }}
               className={`relative overflow-hidden px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 active:scale-95 group/btn ${table.active ? 'bg-error text-white shadow-[0_8px_20px_rgba(248,113,113,0.3)] hover:shadow-[0_12px_25px_rgba(248,113,113,0.4)]' : 'bg-white/[0.03] text-indigo border border-indigo/30 hover:bg-indigo hover:text-white shadow-[0_8px_20px_rgba(99,102,241,0.1)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.3)]'}`}
             >
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
               <span className="relative z-10">{table.active ? 'Tugatish' : 'Boshlash'}</span>
             </button>
          )}
        </div>
      </div>

      {showFoodDrawer && <FoodDrawer table={table} onClose={() => setShowFoodDrawer(false)} />}
      
      {showStopModal && (
        <StopModal 
          table={table} 
          onConfirm={handleStop}
          onCancel={() => setShowStopModal(false)} 
        />
      )}

      {showReceipt && (
        <ReceiptModal 
          session={receiptData} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </>
  )
}
