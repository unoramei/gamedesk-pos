import { useState } from 'react'
import { usePos } from '../../context/PosContext'
import { useAuth } from '../../context/AuthContext'
import ConfirmModal from '../ui/ConfirmModal'

export default function Sidebar({ isOpen, onClose }) {
  const { state, setPage, setActiveZone, closeShift } = usePos()
  const { club, signOut } = useAuth()
  const [showExitOptions, setShowExitOptions] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', title: '', message: '', action: null })

  // Sort zones: Normal zones first, VIP zones last
  const sortedZones = [...state.zones].sort((a, b) => {
    if (a.isVip && !b.isVip) return 1
    if (!a.isVip && b.isVip) return -1
    return 0
  })

  const handleFullLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Tizimdan chiqish',
      message: 'Tizimdan to\'liq chiqishni tasdiqlaysizmi? Smena yopiladi.',
      type: 'danger',
      action: async () => {
        await closeShift()
        signOut()
      }
    })
  }

  const handleCloseShift = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Smenani yopish',
      message: 'Smenani yopishni tasdiqlaysizmi?',
      type: 'warning',
      action: async () => {
        await closeShift()
        setShowExitOptions(false)
      }
    })
  }

  const handleConfirm = async () => {
    if (confirmModal.action) await confirmModal.action()
    setConfirmModal({ ...confirmModal, isOpen: false })
  }

  return (
    <aside className={`
      fixed left-0 top-0 h-[100dvh] w-[240px] bg-[#0c0c0e] flex flex-col py-6 z-50
      shadow-[10px_0_30px_rgba(0,0,0,0.3)] lg:shadow-none border-r border-white/5 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="px-6 mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-indigo/20">
              <span className="material-symbols-outlined icon-filled text-white text-[16px]">sports_esports</span>
            </div>
            <div>
              <h1 className="text-[16px] font-black text-white tracking-tight leading-none italic uppercase">
                AXIPH <span className="text-indigo/50 mx-0.5">x</span> {club?.name || 'GAMING'}
              </h1>
              <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em] mt-0.5">GAMING POS SYSTEM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 px-4">
          <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 text-center">Menyu</p>
          
          <button
            onClick={() => setPage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all duration-300 text-left relative group overflow-hidden ${state.page === 'dashboard' ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
          >
            {state.page === 'dashboard' && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2/3 bg-indigo rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
              </>
            )}
            <span className={`material-symbols-outlined text-[18px] transition-all duration-500 group-hover:scale-110 ${state.page === 'dashboard' ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>dashboard</span>
            <span className={`truncate flex-1 font-bold text-[11px] tracking-wider uppercase transition-colors duration-300 ${state.page === 'dashboard' ? 'text-white' : 'group-hover:text-white'}`}>Boshqaruv</span>
          </button>

          <button
            onClick={() => { setPage('zonalar'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all duration-300 text-left relative group overflow-hidden ${state.page === 'zonalar' ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
          >
            {state.page === 'zonalar' && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2/3 bg-indigo rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
              </>
            )}
            <span className={`material-symbols-outlined text-[18px] transition-all duration-500 group-hover:scale-110 ${state.page === 'zonalar' ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>layers</span>
            <span className={`truncate flex-1 font-bold text-[11px] tracking-wider uppercase transition-colors duration-300 ${state.page === 'zonalar' ? 'text-white' : 'group-hover:text-white'}`}>Zonalar / Stollar</span>
          </button>

          <button
            onClick={() => setPage('smenalar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all duration-300 text-left relative group overflow-hidden ${state.page === 'smenalar' ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
          >
            {state.page === 'smenalar' && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2/3 bg-indigo rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
              </>
            )}
            <span className={`material-symbols-outlined text-[18px] transition-all duration-500 group-hover:scale-110 ${state.page === 'smenalar' ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>badge</span>
            <span className={`truncate flex-1 font-bold text-[11px] tracking-wider uppercase transition-colors duration-300 ${state.page === 'smenalar' ? 'text-white' : 'group-hover:text-white'}`}>Smenalar</span>
          </button>

          <button
            onClick={() => setPage('foyda')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all duration-300 text-left relative group overflow-hidden ${state.page === 'foyda' ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
          >
            {state.page === 'foyda' && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2/3 bg-indigo rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
              </>
            )}
            <span className={`material-symbols-outlined text-[18px] transition-all duration-500 group-hover:scale-110 ${state.page === 'foyda' ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>insights</span>
            <span className={`truncate flex-1 font-bold text-[11px] tracking-wider uppercase transition-colors duration-300 ${state.page === 'foyda' ? 'text-white' : 'group-hover:text-white'}`}>Foyda</span>
          </button>

          <button
            onClick={() => setPage('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all duration-300 text-left relative group overflow-hidden ${state.page === 'admin' ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
          >
            {state.page === 'admin' && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2/3 bg-indigo rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
              </>
            )}
            <span className={`material-symbols-outlined text-[18px] transition-all duration-500 group-hover:scale-110 ${state.page === 'admin' ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>settings</span>
            <span className={`truncate flex-1 font-bold text-[11px] tracking-wider uppercase transition-colors duration-300 ${state.page === 'admin' ? 'text-white' : 'group-hover:text-white'}`}>Sozlamalar</span>
          </button>

          <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 mt-8 text-center">Hududlar</p>

          {sortedZones.length === 0 ? (
            <div className="px-4 py-6 text-center opacity-30 select-none">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                Zonalar yo'q
              </p>
            </div>
          ) : (
            sortedZones.map(zone => {
              const active = state.page === 'zonalar' && state.activeZoneId === zone.id
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setPage('zonalar');
                    setActiveZone(zone.id);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all duration-300 text-left relative group overflow-hidden
                    ${active
                      ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}
                  `}
                >
                  {active && (
                    <>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-2/3 bg-indigo rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
                    </>
                  )}
                  <span
                    className={`material-symbols-outlined text-[18px] transition-all duration-500 group-hover:scale-110 ${active ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}
                    style={{ color: zone.isVip && !active ? '#fbbf24' : 'inherit' }}
                  >
                    {zone.icon}
                  </span>
                  <span className={`truncate flex-1 font-bold text-[11px] tracking-wider uppercase transition-colors duration-300 ${active ? 'text-white' : 'group-hover:text-white'}`}>{zone.name}</span>
                  {zone.isVip && (
                    <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md italic tracking-tighter shadow-[0_0_10px_rgba(245,158,11,0.1)]">VIP</span>
                  )}
                </button>
              )
            })
          )}
        </nav>
      </div>

      {/* Admin User / Shift Status */}
      <div className="px-4 mt-auto pt-6 relative border-t border-white/5">
        <div className={`
          flex flex-col gap-4 p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 transition-all duration-300
          ${showExitOptions ? 'ring-2 ring-error/20 bg-error/[0.02]' : ''}
        `}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo/10 flex items-center justify-center text-indigo border border-indigo/20 shrink-0 shadow-inner">
              <span className="material-symbols-outlined icon-filled text-2xl">account_circle</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[14px] font-black text-white truncate tracking-tight uppercase italic">{state.activeShift?.operatorName || 'Ofitsiant'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${state.activeShift ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{state.activeShift ? 'Smenada' : 'Kutilmodqa'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {!showExitOptions ? (
              <button
                onClick={() => setShowExitOptions(true)}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-error/10 text-error text-[11px] font-black uppercase tracking-[0.2em] hover:bg-error hover:text-white transition-all border border-error/20 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">power_settings_new</span>
                Chiqish
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={handleCloseShift}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  Smenani yopish
                </button>
                <button
                  onClick={handleFullLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-error text-white text-[10px] font-black uppercase tracking-widest hover:bg-error-dark transition-all shadow-lg shadow-error/20"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  To'liq chiqish
                </button>
                <button
                  onClick={() => setShowExitOptions(false)}
                  className="w-full py-1.5 text-[9px] text-white/20 font-bold uppercase tracking-widest hover:text-white/40 transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </aside>
  )
}
