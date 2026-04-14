import React from 'react';
import { Snowflake, Phone, AlertCircle, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FrozenScreen() {
    const { signOut, club } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050507] p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse-glow pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo/10 blur-[150px] rounded-full animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#050507_80%)] opacity-80 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

            <div className="w-full max-w-xl z-10 page-enter">
                <div className="bg-white/[0.01] backdrop-blur-[60px] border border-white/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/5 relative overflow-hidden group">
                    {/* Subtle Ambient Light */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700" />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-40" />
                    
                    {/* Floating Icons Background */}
                    <div className="absolute top-10 right-10 text-white/[0.02] animate-pulse">
                        <Snowflake size={140} />
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(59,130,246,0.3)] mb-8 border border-white/20 transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-700 group/icon cursor-default relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform" />
                            <Snowflake className="text-white w-12 h-12 transition-transform duration-1000 group-hover/icon:rotate-180 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                        </div>

                        <h1 className="text-3xl font-black text-white tracking-widest italic uppercase mb-4 flex flex-col sm:flex-row items-center gap-2">
                            Hisobingiz <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">Muzlatilgan</span>
                        </h1>

                        <div className="space-y-8 w-full">
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.1em] leading-relaxed max-w-md mx-auto">
                                Hurmatli <span className="text-white"> {club?.name || 'Klub egasi'}</span>, 
                                sizning tizimga kirishingiz vaqtinchalik cheklangan.
                            </p>

                            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4 text-left shadow-inner">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center flex-shrink-0 border border-error/20">
                                        <AlertCircle className="text-error w-6 h-6 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Sabab</h3>
                                        <p className="text-white text-xs font-bold tracking-wide">Obuna muddati tugagan yoki tizim administratori tomonidan to'xtatilgan.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 border-t border-white/5 pt-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                                        <Phone className="text-emerald-400 w-6 h-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Faollashtirish uchun administrator raqami:</h3>
                                        <p className="text-indigo-400 font-mono font-black mt-1 text-lg drop-shadow-md">+998 90 095 22 66</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 mt-8">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] shadow-[0_15px_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                                >
                                    <div className="absolute inset-0 bg-black/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                    <RefreshCw size={16} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                                    <span className="relative z-10">Qayta tekshirish</span>
                                </button>
                                
                                <button
                                    onClick={signOut}
                                    className="w-full bg-white/[0.03] text-white/50 font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <LogOut size={16} className="opacity-50" />
                                    <span>Kirish sahifasiga qaytish</span>
                                </button>
                            </div>
                        </div>

                        <footer className="mt-12">
                            <p className="text-white/10 text-[8px] font-black uppercase tracking-[0.5em]">
                                AXIPH GAMING POS &copy; {new Date().getFullYear()}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
