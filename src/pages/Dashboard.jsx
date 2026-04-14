import { useState, useEffect } from 'react'
import { usePos, calcTotal, formatTime, formatPrice, getLocalDayString } from '../context/PosContext'

export default function Dashboard() {
  const { state } = usePos()

  const todayStr = getLocalDayString()
  const activeTables  = state.tables.filter(t => t.active)
  
  // Historical revenue from all past days (excluding today)
  const pastRevenue = state.revenueHistory
    .filter(h => h.date !== todayStr)
    .reduce((s, h) => s + h.revenue, 0)

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (activeTables.length === 0) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [activeTables.length])

  // Current session values (active + completed today)
  const liveRevenueValue = activeTables.reduce((s, t) => s + calcTotal(t, state.foods, now), 0)
  const completedToday   = state.completedSessions.filter(s => s.date === todayStr)
  const completedTodayVal = completedToday.reduce((s, sess) => s + sess.total, 0)

  const todayRevenue = completedTodayVal + liveRevenueValue
  const totalRevenue = pastRevenue + todayRevenue
  const liveRevenue  = liveRevenueValue

  const STATS = [
    {
      label:   'Faol stollar',
      value:   activeTables.length,
      suffix:  ` / ${state.tables.length}`,
      icon:    'monitor_heart',
      color:   'text-indigo',
      bg:      'bg-indigo/10',
    },
    {
      label:  "Bugungi foyda",
      value:  formatPrice(todayRevenue),
      icon:   'account_balance',
      color:  'text-tertiary',
      bg:     'bg-tertiary/10',
    },
    {
      label:  "Jonli kassa",
      value:  formatPrice(liveRevenue),
      icon:   'token',
      color:  'text-amber',
      bg:     'bg-amber/10',
    },
    {
      label:  "Umumiy balans",
      value:  formatPrice(totalRevenue),
      icon:   'savings',
      color:  'text-primary',
      bg:     'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-10 page-enter">
      {/* KPI stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-surface-container/30 border border-outline-variant/10 rounded-[2rem] p-6 glass-card group hover:border-indigo/30 transition-all duration-500">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 border border-outline-variant/5 transition-transform group-hover:scale-110 duration-500`}>
              <span className={`material-symbols-outlined text-2xl ${s.color} icon-filled`}>{s.icon}</span>
            </div>
            <p className="text-[10px] text-outline uppercase tracking-[0.2em] font-black mb-1.5">{s.label}</p>
            <p className={`text-2xl font-black font-mono tracking-tighter ${s.color} leading-none`}>
              {s.value}
              {s.suffix && <span className="text-sm text-outline-variant font-mono ml-2 font-medium">{s.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Tables Live View */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-lg font-black text-on-surface tracking-tight uppercase">Jonli seanslar</h3>
              <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em] mt-1">Hozirda faol ishlayotgan stollar</p>
            </div>
          </div>

          {activeTables.length === 0 ? (
            <div className="bg-surface-container/20 border-2 border-dashed border-outline-variant/10 rounded-[2.5rem] p-16 flex flex-col items-center gap-4 text-outline-variant glass-card">
              <div className="w-20 h-20 rounded-full bg-outline-variant/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl">cloud_off</span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest opacity-40">Hozirda faol seans yo'q</p>
            </div>
          ) : (
            <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2.5rem] overflow-hidden glass-card">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      <th className="px-6 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Stol</th>
                      <th className="px-6 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Vaqt</th>
                      <th className="px-6 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Servis</th>
                      <th className="px-6 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em] text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {activeTables.map(t => {
                      const total = calcTotal(t, state.foods)
                      return (
                        <tr key={t.id} className="hover:bg-indigo/5 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-outline group-hover:border-indigo/30 group-hover:text-indigo transition-all">
                                <span className="material-symbols-outlined text-xl icon-filled">{t.isVip ? 'workspace_premium' : 'monitor'}</span>
                              </div>
                              <div>
                                <p className="text-sm font-black text-on-surface">{t.name}</p>
                                <p className="text-[10px] text-outline font-bold uppercase tracking-widest">{t.isVip ? 'VIP' : 'Standard'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono text-base font-black text-tertiary drop-shadow-[0_0_8px_rgba(74,225,118,0.2)]">{formatTime(Math.floor((now - t.startTime) / 1000))}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1">
                              {t.orders.length === 0 ? <span className="text-[10px] text-outline-variant uppercase tracking-widest">—</span> : t.orders.slice(0, 2).map((o, idx) => {
                                const food = state.foods.find(f => f.id === o.foodId)
                                return <span key={idx} className="px-2 py-0.5 bg-surface-container-highest rounded text-[10px] font-bold text-on-surface-variant">{food?.name}</span>
                              })}
                              {t.orders.length > 2 && <span className="text-[10px] text-outline font-black">+{t.orders.length - 2}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-mono font-black text-on-surface">
                            {formatPrice(calcTotal(t, state.foods, now))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recent sessions */}
        <div className="space-y-4">
          <div className="px-2">
            <h3 className="text-lg font-black text-on-surface tracking-tight uppercase">Tarix</h3>
            <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em] mt-1">Oxirgi yakunlangan sessiyalar</p>
          </div>

          <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2.5rem] overflow-hidden glass-card">
            {state.completedSessions.length === 0 ? (
              <div className="p-10 text-center text-outline-variant italic text-xs">Hali ma'lumot yo'q</div>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {state.completedSessions.slice(0, 6).map(s => (
                  <div key={s.id} className="p-5 hover:bg-surface-container/50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-outline group-hover:text-indigo transition-colors">
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-on-surface">{s.tableName}</p>
                        <p className="text-[10px] text-outline font-medium">{formatTime(s.elapsedSeconds)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-black text-tertiary font-mono">{formatPrice(s.total)}</p>
                      <p className="text-[9px] text-outline-variant font-bold uppercase tracking-tighter">{new Date(s.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
