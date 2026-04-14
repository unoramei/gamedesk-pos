import { useState, useMemo } from 'react'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { usePos, formatPrice, formatTime } from '../context/PosContext'

const PERIODS = [
  { label: 'Bugun',  days: 1  },
  { label: '7 kun',  days: 7  },
  { label: '30 kun', days: 30 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-highest/90 backdrop-blur-xl border border-outline-variant/20 rounded-2xl px-4 py-3 shadow-2xl glass-card">
      <p className="text-[10px] text-outline font-black uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-lg font-mono font-black text-indigo">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

export default function Foyda() {
  const { state } = usePos()
  const [period, setPeriod] = useState(7)

  const data = useMemo(() => {
    const result = []
    const today = new Date()
    
    if (period === 1) {
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const localDate = `${year}-${month}-${day}`

      const hourly = new Array(24).fill(0)
      
      const todaySessions = state.completedSessions.filter(s => s.date === localDate)
      todaySessions.forEach(s => {
        if (s.endTime) {
          const h = new Date(s.endTime).getHours()
          hourly[h] += s.total || 0
        }
      })
      
      for (let i = 0; i < 24; i++) {
        result.push({
          date: `${String(i).padStart(2, '0')}:00`,
          revenue: hourly[i],
        })
      }
    } else {
      // Create an array mapping for the last `period` days
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const localDate = `${year}-${month}-${day}`
        
        const found = state.revenueHistory.find(h => h.date === localDate)
        result.push({
          date: `${month}-${day}`, // MM-DD
          revenue: found ? found.revenue : 0,
        })
      }
    }
    return result
  }, [state.revenueHistory, state.completedSessions, period])

  const total     = data.reduce((s, d) => s + d.revenue, 0)
  const average   = Math.round(total / period)
  const allTimeTotal = state.revenueHistory.reduce((s, d) => s + d.revenue, 0)
  
  const KPIS = [
    { label: 'Davr tushumi',   value: formatPrice(total),   icon: 'payments',       color: 'text-indigo',  bg: 'bg-indigo/10' },
    { label: "O'rtacha foyda", value: formatPrice(average), icon: 'analytics',      color: 'text-tertiary',bg: 'bg-tertiary/10' },
    { label: 'Umumiy tushum',  value: formatPrice(allTimeTotal), icon: 'savings', color: 'text-primary',bg: 'bg-primary/10' },
    { label: 'Faol smenalar', value: state.shiftHistory.length, icon: 'history',    color: 'text-amber',  bg: 'bg-amber/10' },
  ]

  return (
    <div className="space-y-10 pb-10 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">Foyda tahlili</h1>
          <p className="text-sm text-outline mt-1 font-medium italic">Tizimning umumiy moliyaviy holati</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {KPIS.map((k, idx) => (
          <div key={k.label} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 glass-card group hover:border-indigo/30 transition-all duration-500 relative overflow-hidden" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-50 transition-opacity group-hover:opacity-100" />
            <div className={`w-14 h-14 rounded-[1.25rem] ${k.bg} flex items-center justify-center mb-6 border border-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-black/20 relative z-10`}>
              <span className={`material-symbols-outlined text-3xl ${k.color} icon-filled drop-shadow-[0_0_10px_currentColor]`}>{k.icon}</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black mb-2">{k.label}</p>
              <p className={`text-3xl font-black font-mono tracking-tighter ${k.color} drop-shadow-md`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-[1.25rem] border border-white/5 glass-card w-fit relative z-10">
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              period === p.days
                ? 'bg-indigo text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] scale-105'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 glass-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo/5 blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000 opacity-50 group-hover:opacity-100" />
        <div className="flex items-start justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              Daromad dinamikasi
              <span className="flex h-2 w-2 relative mt-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">So'nggi {period} kunlik o'zgarishlar</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-tertiary/10 border border-tertiary/20 text-tertiary text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(79,70,229,0.1)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            Stabil o'sish
          </div>
        </div>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 8" stroke="rgba(144,143,160,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#908fa0', fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={15}
              />
              <YAxis
                tick={{ fill: '#908fa0', fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => (v / 1000) + 'K'}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 2 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366F1"
                strokeWidth={4}
                fill="url(#revenueGrad)"
                dot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 3 }}
                activeDot={{ r: 8, fill: '#6366F1', stroke: '#fff', strokeWidth: 4, shadow: '0 0 20px rgba(99,102,241,0.5)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shift History Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden glass-card">
        <div className="p-10 pb-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-xl font-black text-white tracking-tight uppercase">Smenalar tarixi</h3>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">Yakunlangan ish jarayonlari arxivi</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Operator</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Boshlanish</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Tugallanish</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Tushum</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {state.shiftHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-16 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Smenalar tarixi hali mavjud emas</td>
                </tr>
              ) : (
                state.shiftHistory.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[14px] bg-indigo/10 flex items-center justify-center text-indigo border border-indigo/20 group-hover:bg-indigo group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
                          <span className="material-symbols-outlined text-lg icon-filled">person</span>
                        </div>
                        <span className="text-sm font-black text-white tracking-wide">{s.operatorName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-mono text-white/50 tracking-wider font-bold">{new Date(s.startTime).toLocaleString('uz-UZ').slice(0, 16).replace(',', '')}</td>
                    <td className="px-10 py-6 text-sm font-mono text-white/50 tracking-wider font-bold">{new Date(s.endTime).toLocaleString('uz-UZ').slice(0, 16).replace(',', '')}</td>
                    <td className="px-10 py-6">
                      <span className="text-[15px] font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{formatPrice(s.totalRevenue)}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-white/70 text-[9px] font-black uppercase tracking-widest border border-white/10 group-hover:border-white/20 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        Yakunlangan
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

