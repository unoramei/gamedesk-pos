import { usePos, formatPrice, formatTime } from '../context/PosContext'

export default function Shifts() {
  const { state } = usePos()

  const activeShift = state.activeShift
  const shiftHistory = state.shiftHistory || []

  // Calculate live revenue for active shift if it exists
  const activeShiftRevenue = activeShift 
    ? state.completedSessions
        .filter(s => s.startTime >= activeShift.startTime)
        .reduce((sum, s) => sum + (s.total || 0), 0)
    : 0

  return (
    <div className="space-y-10 page-enter">
      {/* Active Shift Section */}
      <div className="space-y-4">
        <div className="px-2">
          <h3 className="text-xl font-black text-on-surface tracking-tight uppercase italic">Hozirgi Smena</h3>
          <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em] mt-1">Hozirda tizimda ishlayotgan xodim</p>
        </div>

        {activeShift ? (
          <div className="bg-indigo/5 border border-indigo/20 rounded-[2.5rem] p-8 glass-card relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo/10 rounded-full blur-3xl group-hover:bg-indigo/20 transition-all duration-700" />
            
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-indigo/20 flex items-center justify-center text-indigo border border-indigo/30 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <span className="material-symbols-outlined text-4xl icon-filled">account_circle</span>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase">{activeShift.operatorName}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Smenada faol</span>
                    </div>
                    <span className="text-white/20 text-xs">|</span>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                      Boshlangan: {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 items-center bg-black/20 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
                <div className="text-center md:text-right">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Amaldagi tushum</p>
                  <p className="text-3xl font-black font-mono text-indigo tracking-tighter">{formatPrice(activeShiftRevenue)}</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Davomiyligi</p>
                  <p className="text-2xl font-black font-mono text-white tracking-tighter">
                    {formatTime(Math.floor((Date.now() - activeShift.startTime) / 1000))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container/20 border-2 border-dashed border-outline-variant/10 rounded-[2.5rem] p-16 flex flex-col items-center gap-4 text-outline-variant glass-card">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-4xl">no_accounts</span>
            </div>
            <p className="text-sm font-black uppercase tracking-widest opacity-40 italic font-medium">Hozirda hech kim smenada emas</p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="px-2 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-black text-on-surface tracking-tight uppercase italic">Smenalar Tarixi</h3>
            <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em] mt-1">Oxirgi yakunlangan ish smenalari</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em]">Jami smenalar</p>
            <p className="text-xl font-black text-on-surface font-mono">{shiftHistory.length}</p>
          </div>
        </div>

        <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2.5rem] overflow-hidden glass-card">
          {shiftHistory.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-outline/20">history</span>
              <p className="text-xs font-black text-outline/40 uppercase tracking-widest italic">Tarix hali bo'sh</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-black/10">
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Operator</th>
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Ish vaqti</th>
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Davomiyligi</th>
                    <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em] text-right">Jami tushum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {shiftHistory.map((s, idx) => {
                    const durationInSeconds = s.endTime ? Math.floor((s.endTime - s.startTime) / 1000) : 0
                    return (
                      <tr key={s.id || idx} className="hover:bg-indigo/5 transition-all duration-300 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-outline group-hover:border-indigo/30 group-hover:text-indigo transition-all">
                              <span className="material-symbols-outlined text-lg icon-filled">person</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-on-surface italic uppercase">{s.operatorName}</p>
                                <p className="text-[10px] text-outline font-bold tracking-widest">{new Date(s.startTime).toLocaleDateString('uz-UZ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-on-surface">
                              {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              <span className="mx-2 text-outline">→</span>
                              {s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-mono text-sm font-black text-outline-variant group-hover:text-on-surface transition-colors">
                            {formatTime(durationInSeconds)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="text-base font-black font-mono text-tertiary">{formatPrice(s.totalRevenue || 0)}</p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
