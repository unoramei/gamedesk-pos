import { useEffect, useRef } from 'react'
import { usePos } from '../../context/PosContext'

export default function ContextMenu({ x, y, onClose, onRefresh }) {
  const { state, setPage } = usePos()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [onClose])

  const menuItems = [
    { label: 'Yangilash', icon: 'refresh', action: onRefresh },
    { type: 'separator' },
    { label: 'Dashboard', icon: 'dashboard', action: () => setPage('dashboard'), active: state.page === 'dashboard' },
    { label: 'Zonalar / Stollar', icon: 'layers', action: () => setPage('zonalar'), active: state.page === 'zonalar' },
    { label: 'Smenalar', icon: 'badge', action: () => setPage('smenalar'), active: state.page === 'smenalar' },
    { label: 'Hisobotlar', icon: 'insights', action: () => setPage('foyda'), active: state.page === 'foyda' },
    { type: 'separator' },
    { 
      label: 'To\'liq ekran', 
      icon: 'fullscreen', 
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      } 
    }
  ]

  // Boundary detection
  const menuWidth = 220
  const menuHeight = 350
  const posX = x + menuWidth > window.innerWidth ? x - menuWidth : x
  const posY = y + menuHeight > window.innerHeight ? y - menuHeight : y

  return (
    <div
      ref={menuRef}
      style={{ top: posY, left: posX }}
      className="fixed z-[9999] w-[220px] bg-[#0c0c0e]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="px-3 py-2.5 mb-1.5 flex items-center gap-2 border-b border-white/5">
        <div className="w-6 h-6 bg-indigo/20 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined icon-filled text-indigo text-[14px]">sports_esports</span>
        </div>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">AXIPH Menyu</span>
      </div>

      <div className="space-y-0.5">
        {menuItems.map((item, idx) => {
          if (item.type === 'separator') {
            return <div key={idx} className="h-px bg-white/5 my-1.5 mx-2" />
          }

          return (
            <button
              key={idx}
              onClick={() => {
                item.action?.()
                onClose()
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative
                ${item.active 
                  ? 'bg-indigo/10 text-white' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-indigo rounded-r-full shadow-[0_0_10px_rgba(99,102,241,1)]" />
              )}
              <span className={`material-symbols-outlined text-[18px] transition-transform group-hover:scale-110 ${item.active ? 'icon-filled text-indigo' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[13px] font-medium flex-1 text-left">{item.label}</span>
              {!item.active && (
                <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-40 transition-opacity">chevron_right</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-2 px-3 py-2 text-[8px] text-white/10 font-bold uppercase tracking-widest text-center">
        © AXIPH POS v2.5
      </div>
    </div>
  )
}
