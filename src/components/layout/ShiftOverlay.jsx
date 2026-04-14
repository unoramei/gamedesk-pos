import { useState } from 'react'
import { usePos } from '../../context/PosContext'
import { useAuth } from '../../context/AuthContext'

export default function ShiftOverlay() {
  const { openShift } = usePos()
  const { signOut } = useAuth()
  const [operator, setOperator] = useState('')

  const handleOpen = (e) => {
    e.preventDefault()
    if (!operator.trim()) return
    openShift({ 
      operatorName: operator.trim(), 
      initialBalance: 0 
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050507]/90 backdrop-blur-3xl overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 blur-[150px] rounded-full" />

      <div className="w-full max-w-lg p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in duration-500">
        {/* Glow effect on top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo/50 to-transparent" />
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo/20 to-indigo/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 shadow-inner group">
            <span className="material-symbols-outlined text-5xl text-indigo icon-filled transition-transform group-hover:scale-110 duration-300">lock_open</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-4 italic">SMENANI OCHISH</h2>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            Xizmat vaqtini hisoblashni boshlash uchun loginni kiriting.
          </p>
        </div>

        <form onSubmit={handleOpen} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">TIZIMGA KIRISH</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none group-focus-within:text-indigo-400 transition-colors text-white/20">
                <span className="material-symbols-outlined text-2xl">account_circle</span>
              </div>
              <input
                autoFocus
                type="text"
                required
                value={operator}
                onChange={e => setOperator(e.target.value)}
                placeholder="Loginni kiriting..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-indigo/50 focus:ring-4 focus:ring-indigo/10 transition-all font-bold tracking-tight text-lg placeholder:text-white/5"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo hover:bg-indigo-500 text-white py-6 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo/20 active:scale-[0.97] transition-all flex items-center justify-center gap-3 mt-4 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-3">
              TIZIMGA KIRISH
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">login</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full mt-4 py-4 text-[10px] text-white/40 uppercase tracking-[0.2em] font-black hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Ortga qaytish
          </button>
        </form>
      </div>
    </div>
  )
}
