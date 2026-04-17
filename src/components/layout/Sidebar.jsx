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
      fixed left-0 top-0 h-[100dvh] w-[260px] bg-[#08080a]/90 backdrop-blur-3xl flex flex-col pt-8 pb-6 z-50
      shadow-[20px_0_50px_rgba(0,0,0,0.5)] lg:shadow-none border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 custom-scrollbar">
        {/* Logo Section */}
        <div className="px-2 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group cursor-default">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo to-indigo-700 rounded-2xl flex items-center justify-center shadow-indigo/20 shadow-xl transition-transform duration-500 group-hover:rotate-[10deg]">
                <span className="material-symbols-outlined icon-filled text-white text-[20px]">sports_esports</span>
              </div>
              <div className="absolute -inset-1 bg-indigo/20 blur-lg rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[17px] font-black text-white tracking-widest leading-none">
                AXIPH <span className="text-indigo/60 text-[10px] align-middle ml-1">●</span>
              </h1>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1.5">{club?.name || 'GAMING CLUB'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Categories & Links */}
        <nav className="space-y-8">
          {/* Main Group */}
          <div>
            <div className="px-4 mb-4">
              <span className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">
                Boshqaruv
              </span>
            </div>
            
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                { id: 'zonalar', label: 'Zonalar / Stollar', icon: 'layers' },
                { id: 'smenalar', label: 'Smenalar', icon: 'badge' },
                { id: 'foyda', label: 'Foyda / Hisobot', icon: 'insights' },
                { id: 'admin', label: 'Sozlamalar', icon: 'settings' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 text-left relative group overflow-hidden
                    ${state.page === item.id 
                      ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}
                  `}
                >
                  {state.page === item.id && (
                    <>
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo rounded-full shadow-[0_0_15px_rgba(79,70,229,1)] z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
                    </>
                  )}
                  <span className={`material-symbols-outlined text-[20px] transition-all duration-500 group-hover:scale-110 ${state.page === item.id ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:text-indigo/60'}`}>{item.icon}</span>
                  <span className={`truncate flex-1 font-medium text-sm transition-colors duration-200 ${state.page === item.id ? 'text-white font-bold' : 'group-hover:text-white'}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Zones Group */}
          <div>
            <div className="px-4 mb-4">
              <span className="px-3 py-1 bg-indigo/5 border border-indigo/10 rounded-full text-[9px] font-black text-indigo/60 uppercase tracking-[0.25em]">
                Smart Zonalar
              </span>
            </div>

            <div className="space-y-1">
              {sortedZones.length === 0 ? (
                <div className="px-4 py-8 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5 mx-2">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                    Hozircha zonalar <br/> mavjud emas
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
                        w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 text-left relative group overflow-hidden
                        ${active
                          ? 'text-white bg-indigo/10 border border-indigo/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]'
                          : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}
                      `}
                    >
                      {active && (
                        <>
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo rounded-full shadow-[0_0_15px_rgba(79,70,229,1)] z-10" />
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo/5 to-transparent pointer-events-none" />
                        </>
                      )}
                      <span
                        className={`material-symbols-outlined text-[20px] transition-all duration-500 group-hover:scale-110 ${active ? 'icon-filled text-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}
                        style={{ color: zone.isVip && !active ? '#fbbf24' : 'inherit' }}
                      >
                        {zone.icon}
                      </span>
                      <span className={`truncate flex-1 font-medium text-sm transition-colors duration-200 ${active ? 'text-white font-bold' : 'group-hover:text-white'}`}>{zone.name}</span>
                      {zone.isVip && (
                        <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg border border-amber-500/10 shadow-sm shadow-amber-500/5">VIP</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* User Status / Bottom Actions */}
      <div className="px-4 mt-6">
        <div className={`
          relative group p-3.5 rounded-[2rem] bg-indigo/5 border border-indigo/10 transition-all duration-500 overflow-hidden
          ${showExitOptions ? 'ring-2 ring-error/30 bg-error/[0.02] border-error/20' : 'hover:bg-indigo/[0.08] hover:border-indigo/20'}
        `}>
          {/* Status Animated Glow Background */}
          {state.activeShift && !showExitOptions && (
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo/5 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse" />
          )}

          <div className="flex items-center gap-3 relative z-10">
            <div className="relative shrink-0">
               <div className="w-10 h-10 rounded-xl bg-indigo/20 flex items-center justify-center text-indigo border border-indigo/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <span className="material-symbols-outlined icon-filled text-[22px]">account_circle</span>
              </div>
              {state.activeShift && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-[3px] border-[#08080a] shadow-lg animate-pulse" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-black text-white truncate tracking-tight group-hover:text-indigo-200 transition-colors uppercase">
                {state.activeShift?.operatorName || 'Ofitsiant'}
              </p>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${state.activeShift ? 'text-emerald-500/80' : 'text-white/20'}`}>
                 {state.activeShift ? 'Smenada' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 relative z-10">
            {!showExitOptions ? (
              <button
                onClick={() => setShowExitOptions(true)}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-white/[0.02] text-white/30 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-error/10 hover:text-error transition-all border border-transparent hover:border-error/20"
              >
                <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                Chiqish
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
                <button
                  onClick={handleCloseShift}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  Smenani yopish
                </button>
                <button
                  onClick={handleFullLogout}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-error text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-error/20 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Tizimdan chiqish
                </button>
                <button
                  onClick={() => setShowExitOptions(false)}
                  className="w-full py-2 text-[9px] text-white/20 font-black uppercase tracking-[0.3em] hover:text-white/40 transition-colors"
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
