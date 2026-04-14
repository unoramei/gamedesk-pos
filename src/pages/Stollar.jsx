import { useState, useEffect } from 'react'
import { usePos } from '../context/PosContext'
import TableCard from '../components/tables/TableCard'

export default function Stollar({ onAddTable }) {
  const { state, startMultipleTables, stopMultipleTables } = usePos()
  const [collapsedZones, setCollapsedZones] = useState({})
  
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const toggleZone = (zoneId) => {
    setCollapsedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }))
  }

  const handleSelectTable = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectedTables = selectedIds.map(id => state.tables.find(t => t.id === id)).filter(Boolean)
  const activeSelected = selectedTables.filter(t => t.active).map(t => t.id)
  const inactiveSelected = selectedTables.filter(t => !t.active).map(t => t.id)

  const handleStartMultiple = () => {
    if (inactiveSelected.length > 0) {
      startMultipleTables(inactiveSelected)
      setSelectedIds(prev => prev.filter(id => !inactiveSelected.includes(id)))
      if (selectedIds.length === inactiveSelected.length) setIsMultiSelect(false)
    }
  }

  const handleStopMultiple = () => {
    if (activeSelected.length > 0) {
      stopMultipleTables(activeSelected)
      setSelectedIds(prev => prev.filter(id => !activeSelected.includes(id)))
      if (selectedIds.length === activeSelected.length) setIsMultiSelect(false)
    }
  }

  useEffect(() => {
    if (state.activeZoneId && state.page === 'zonalar') {
      const el = document.getElementById(`zone-${state.activeZoneId}`)
      if (el) {
        // Adjust for floating headers if needed (smooth scrolling)
        const yOffset = -100; 
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [state.activeZoneId, state.page])

  return (
    <div className="space-y-10 pb-20">
      
      {/* Top Action Bar */}
      {state.tables.length > 0 && (
        <div className="flex justify-end mb-6">
           <button
             onClick={() => {
               setIsMultiSelect(!isMultiSelect)
               setSelectedIds([])
             }}
             className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] border ${isMultiSelect ? 'bg-indigo border-indigo shadow-[0_10px_20px_rgba(99,102,241,0.2)] text-white' : 'bg-white/[0.02] text-white/50 hover:bg-white/5 hover:text-white border-white/5'}`}
           >
             <span className="material-symbols-outlined text-[16px]">{isMultiSelect ? 'close' : 'checklist'}</span>
             {isMultiSelect ? 'Bekor qilish' : 'Guruhli tanlash'}
           </button>
        </div>
      )}

      {/* Map all zones natively on one page */}
      {state.zones.map(zone => {
        const tables    = state.tables.filter(t => t.zoneId === zone.id)
        const collapsed = collapsedZones[zone.id]
        const activeCount = tables.filter(t => t.active).length
        return (
          <section key={zone.id} id={`zone-${zone.id}`} className="h-full scroll-mt-24">
            {/* Zone header Card */}
            <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2rem] p-6 mb-8 glass-card">
              <button
                className="w-full flex items-center justify-between group"
                onClick={() => toggleZone(zone.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center shadow-sm">
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{
                        color: zone.isVip ? '#F59E0B' : '#6366F1',
                        fontVariationSettings: zone.isVip ? "'FILL' 1" : "'FILL' 1",
                      }}
                    >
                      {zone.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase tracking-wider text-on-surface">
                      {zone.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-outline font-bold uppercase tracking-[0.2em]">{zone.label || 'ZONA'}</span>
                      {activeCount > 0 && (
                        <>
                          <span className="text-outline-variant">•</span>
                          <span className="text-[10px] font-black text-tertiary uppercase tracking-widest">
                            {activeCount} faol
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${collapsed ? 'bg-surface-container' : 'rotate-180 bg-indigo/10 text-indigo border border-indigo/20'}`}>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </button>
            </div>

            {/* Table grid or Empty state */}
            {!collapsed && tables.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 px-2">
                {tables.map(table => (
                  <TableCard 
                    key={table.id} 
                    table={table} 
                    selectable={isMultiSelect}
                    selected={selectedIds.includes(table.id)}
                    onSelect={() => handleSelectTable(table.id)}
                  />
                ))}
              </div>
            )}
            
          </section>
        )
      })}

      {state.tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 gap-8 text-outline">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo/20 blur-3xl rounded-full" />
            <div className="relative w-32 h-32 rounded-[2.5rem] bg-surface-container/40 border border-outline-variant/10 flex items-center justify-center glass-card">
              <span className="material-symbols-outlined text-6xl opacity-50">layers</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-black text-on-surface uppercase tracking-[0.3em]">Hali stollar yo'q</p>
            <p className="text-xs text-outline font-medium tracking-wide">Tizimni ishga tushirish uchun birinchi stolni qo'shing</p>
          </div>
          <button
            onClick={onAddTable}
            className="flex items-center gap-3 bg-indigo text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            Yangi stol qo'shish
          </button>
        </div>
      )}

      {/* Floating Action Bar */}
      {isMultiSelect && (
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-[#0c0c0e]/95 backdrop-blur-[60px] border border-white/10 px-4 sm:px-8 py-3.5 sm:py-5 rounded-3xl sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/5 z-[100] flex items-center gap-4 sm:gap-8 w-[95%] sm:w-auto overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex flex-col border-r border-white/10 pr-4 sm:pr-8 mr-1 sm:mr-2">
            <span className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-[0.3em] leading-tight">Tanlandi</span>
            <span className="text-xl sm:text-3xl font-black text-white leading-none mt-1.5 whitespace-nowrap">{selectedIds.length} <span className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">ta</span></span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {inactiveSelected.length > 0 && (
              <button
                onClick={handleStartMultiple}
                className="group/btn relative overflow-hidden flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] text-white/70 border border-white/10 bg-white/[0.03] hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all shadow-lg whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="material-symbols-outlined text-[14px] sm:text-[16px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                <span className="relative z-10">Boshlash <span className="hidden sm:inline">({inactiveSelected.length})</span></span>
              </button>
            )}

            {activeSelected.length > 0 && (
              <button
                onClick={handleStopMultiple}
                className="group/btn relative overflow-hidden flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] bg-error text-white shadow-[0_10px_20px_rgba(248,113,113,0.3)] hover:shadow-[0_15px_30px_rgba(248,113,113,0.4)] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="material-symbols-outlined text-[14px] sm:text-[16px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>stop</span>
                <span className="relative z-10">Tugatish <span className="hidden sm:inline">({activeSelected.length})</span></span>
              </button>
            )}

            {selectedIds.length === 0 && (
               <div className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Stol tanlang...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
