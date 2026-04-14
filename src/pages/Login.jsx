import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, Mail, Lock, Gamepad2, Loader2, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signIn, loginAsSuperAdmin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (login === 'admin') {
        const result = loginAsSuperAdmin(login, password)
        if (result.success) return 
      }

      const { error } = await signIn(login, password)
      if (error) throw error
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError('Login yoki parol noto\'g\'ri kiritildi')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050507] p-4 relative overflow-hidden font-sans">
      {/* Background Layer: Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo/10 blur-[150px] rounded-full animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[150px] rounded-full animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#050507_80%)] opacity-80 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

      <div className="w-full max-w-md z-10 page-enter">
        <div className="bg-white/[0.01] backdrop-blur-[60px] border border-white/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/5 relative overflow-hidden group">
          {/* Subtle Ambient Light */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo/20 blur-[80px] rounded-full group-hover:bg-indigo/30 transition-all duration-700" />
          
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo/50 to-transparent opacity-40" />
          
          <div className="flex flex-col items-center mb-14">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo to-indigo-800 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] mb-8 border border-white/20 transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-700 group cursor-default relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform" />
              <Gamepad2 className="text-white w-12 h-12 transition-transform group-hover:scale-110 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </div>
            
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-black text-white tracking-widest italic uppercase flex items-center gap-2">
                <Sparkles className="text-indigo w-6 h-6 animate-pulse" />
                AXIPH <span className="text-white/50">POS</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-indigo" />
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap">
                  Tizimga kirish
                </p>
                <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-indigo" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/10 group-focus-within:text-indigo group-focus-within:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 text-white rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:border-indigo/30 focus:bg-white/[0.04] focus:ring-[15px] focus:ring-indigo/[0.02] transition-all placeholder:text-white/5 font-bold tracking-tight"
                  placeholder="Loginni kiriting"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/10 group-focus-within:text-indigo group-focus-within:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 text-white rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:border-indigo/30 focus:bg-white/[0.04] focus:ring-[15px] focus:ring-indigo/[0.02] transition-all placeholder:text-white/5 font-bold tracking-[0.3em] text-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-4 rounded-2xl text-center animate-shake uppercase tracking-[0.2em]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo hover:bg-indigo-500 text-white font-black py-6 rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-10 relative group overflow-hidden tracking-[0.2em] text-[11px]"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  <span>SISTEMAGA KIRISH</span>
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 flex flex-col items-center gap-4">
            <p className="text-white/10 text-[8px] font-black uppercase tracking-[0.6em] text-center">
              Universal Gaming Management <br /> Ecosystem
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

