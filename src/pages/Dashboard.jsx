import { useState, useEffect } from 'react'
import { usePos, calcTotal, formatTime, formatPrice, getLocalDayString } from '../context/PosContext'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { state } = usePos()
  const { club } = useAuth()
  const minPrice = club?.min_session_price || 0

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
  const liveRevenueValue = activeTables.reduce((s, t) => s + calcTotal(t, state.foods, now, minPrice), 0)
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
          <div key={s.label} className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl p-6 hover:bg-surface-container/40 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center border border-outline-variant/5 group-hover:scale-105 transition-transform duration-300`}>
                <span className={`material-symbols-outlined text-2xl ${s.color} icon-filled`}>{s.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold font-mono tracking-tight ${s.color}`}>
                {s.value}
                {s.suffix && <span className="text-sm text-outline-variant font-mono ml-2 font-medium">{s.suffix}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Tables Live View */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-lg font-bold text-on-surface tracking-tight uppercase">Jonli seanslar</h3>
              <p className="text-xs text-outline font-semibold uppercase tracking-wider mt-1">Hozirda faol ishlayotgan stollar</p>
            </div>
          </div>

          {activeTables.length === 0 ? (
            <div className="bg-surface-container/20 border border-dashed border-outline-variant/20 rounded-2xl p-12 flex flex-col items-center gap-4 text-outline-variant">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl opacity-60">cloud_off</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Hozirda faol seans yo'q</p>
            </div>
          ) : (
            <div className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container/50">
                      <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-widest">Stol</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-widest">Vaqt</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-widest">Servis</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-outline uppercase tracking-widest text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {activeTables.map(t => {
                      const total = calcTotal(t, state.foods, now, minPrice)
                      return (
                        <tr key={t.id} className="hover:bg-surface-container/50 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-outline group-hover:text-indigo transition-all">
                                <span className="material-symbols-outlined text-[18px]">{t.isVip ? 'star' : 'monitor'}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-on-surface leading-none">{t.name}</p>
                                <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mt-1">{t.isVip ? 'VIP' : 'Standard'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-sm font-bold text-on-surface">{formatTime(Math.floor((now - t.startTime) / 1000))}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {(!t.orders || t.orders.length === 0) ? <span className="text-[11px] text-outline-variant">—</span> : (t.orders || []).slice(0, 2).map((o, idx) => {
                                const food = state.foods.find(f => f.id === o.foodId)
                                return <span key={idx} className="px-2 py-0.5 bg-surface-container-high border border-outline-variant/10 rounded-md text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">{food?.name}</span>
                              })}
                              {t.orders.length > 2 && <span className="text-[10px] text-outline font-bold px-1.5 py-0.5 bg-surface-container-highest rounded-md">+{t.orders.length - 2}</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-on-surface">
                            {formatPrice(calcTotal(t, state.foods, now, minPrice))}
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
            <h3 className="text-lg font-bold text-on-surface tracking-tight uppercase">Tarix</h3>
            <p className="text-xs text-outline font-semibold uppercase tracking-wider mt-1">Oxirgi yakunlangan sessiyalar</p>
          </div>

          <div className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl overflow-hidden">
            {state.completedSessions.length === 0 ? (
              <div className="p-10 text-center text-outline-variant text-xs uppercase tracking-widest font-semibold">Tarix bo'sh</div>
            ) : (
              <div className="divide-y divide-outline-variant/5">
                {state.completedSessions.slice(0, 6).map(s => (
                  <div key={s.id} className="p-4 hover:bg-surface-container/50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-outline group-hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-none">{s.tableName}</p>
                        <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mt-1">{formatTime(s.elapsedSeconds)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface font-mono leading-none">{formatPrice(s.total)}</p>
                      <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mt-1">{new Date(s.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
