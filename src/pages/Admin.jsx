import { usePos, formatPrice } from '../context/PosContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useState } from 'react'

function SectionHeader({ icon, title, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo/10 flex items-center justify-center text-indigo border border-indigo/20">
          <span className="material-symbols-outlined text-xl icon-filled">{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-black text-on-surface tracking-tight uppercase">{title}</h3>
          <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em] mt-0.5">Boshqaruv paneli</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function ZoneManager() {
  const { state, removeZone, updateZonePrice, addZone, updateZone, addTable, removeTable, updateTablePrice } = usePos()
  const [editingPrice, setEditingPrice] = useState(null)
  const [addingZone, setAddingZone]     = useState(false)
  const [editingZone, setEditingZone]   = useState(null)
  const [newZone, setNewZone]           = useState({ name: '', label: '', isVip: false, pricePerHour: 10000, icon: 'layers' })
  const [expandedZones, setExpandedZones] = useState([])
  const [newTableNames, setNewTableNames] = useState({})
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })

  const AVAILABLE_ICONS = [
    'layers', 'workspace_premium', 'sports_esports', 'videogame_asset', 
    'computer', 'devices', 'videocam', 'dns'
  ]

  const toggleExpand = (id) => {
    setExpandedZones(prev => prev.includes(id) ? prev.filter(zid => zid !== id) : [...prev, id])
  }

  const commitPrice = () => {
    if (!editingPrice) return
    const price = parseInt(editingPrice.value.replace(/\D/g, ''), 10)
    if (!isNaN(price) && price > 0) {
      if (editingPrice.type === 'zone') updateZonePrice({ zoneId: editingPrice.id, price })
      else updateTablePrice({ id: editingPrice.id, price })
    }
    setEditingPrice(null)
  }

  const handleAddTable = (zoneId) => {
    const name = newTableNames[zoneId]
    if (!name?.trim()) return
    const zone = state.zones.find(z => z.id === zoneId)
    addTable({ name: name.trim(), zoneId, pricePerHour: zone?.pricePerHour || 10000 })
    setNewTableNames(p => ({ ...p, [zoneId]: '' }))
  }

  return (
    <div className="space-y-8 page-enter">
      <SectionHeader
        icon="layers"
        title="Zonalar va stollar"
        action={
          <button onClick={() => setAddingZone(v => !v)} className="flex items-center gap-2 bg-indigo text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Yangi zona
          </button>
        }
      />

      {addingZone && (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-8 glass-card animate-in zoom-in-95 duration-500 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo/30 to-transparent" />
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo/10 flex items-center justify-center text-indigo">
              <span className="material-symbols-outlined icon-filled">add_circle</span>
            </div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-widest">Yangi zona ma'lumotlari</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Zona nomi</label>
              <input value={newZone.name} onChange={e => setNewZone(p => ({ ...p, name: e.target.value }))} placeholder="Masalan: PlayStation" className="premium-input" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Zona tavsifi</label>
              <input value={newZone.label} onChange={e => setNewZone(p => ({ ...p, label: e.target.value }))} placeholder="Masalan: PS5 VIP zal" className="premium-input" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Soatlik narx (so'm)</label>
              <input type="number" value={newZone.pricePerHour || ''} onChange={e => setNewZone(p => ({ ...p, pricePerHour: parseInt(e.target.value) || 0 }))} className="premium-input font-mono" />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-4 cursor-pointer group/vip bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl hover:border-amber/50 transition-all w-full">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newZone.isVip ? 'bg-amber border-amber shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-outline-variant/30 group-hover/vip:border-amber/50'}`}>
                  {newZone.isVip && <span className="material-symbols-outlined text-white text-base">check</span>}
                </div>
                <input type="checkbox" className="hidden" checked={newZone.isVip} onChange={e => setNewZone(p => ({ ...p, isVip: e.target.checked, icon: e.target.checked ? 'workspace_premium' : 'layers' }))} />
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${newZone.isVip ? 'text-amber' : 'text-on-surface'}`}>VIP ZONA STATUSI</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 block mb-4">Grafik ikonka</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_ICONS.map(ic => (
                <button key={ic} onClick={() => setNewZone(p => ({ ...p, icon: ic }))} className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${newZone.icon === ic ? 'bg-indigo text-white border-indigo shadow-[0_10px_20px_rgba(99,102,241,0.3)]' : 'bg-white/[0.02] border-white/5 text-outline hover:border-white/20'}`}>
                  <span className="material-symbols-outlined text-xl">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => setAddingZone(false)} className="flex-1 py-4 rounded-2xl border border-white/10 text-outline text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all">Bekor qilish</button>
            <button onClick={() => { if (!newZone.name) return; addZone(newZone); setNewZone({ name: '', label: '', isVip: false, pricePerHour: 10000, icon: 'layers' }); setAddingZone(false); }} className="flex-1 py-4 rounded-2xl bg-indigo text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(79,70,229,0.2)] hover:shadow-indigo/40 active:scale-[0.98] transition-all">Zonani saqlash</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {state.zones.map(zone => {
          const isExpanded = expandedZones.includes(zone.id)
          const zoneTables = state.tables.filter(t => t.zoneId === zone.id)
          const isEditingP = editingPrice?.id === zone.id && editingPrice.type === 'zone'
          return (
            <div key={zone.id} className="bg-surface-container/30 border border-outline-variant/10 rounded-[2rem] overflow-hidden transition-all shadow-sm glass-card">
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-surface-container-high/40 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button onClick={() => toggleExpand(zone.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'rotate-180 bg-indigo/10 text-indigo border border-indigo/20' : 'text-outline hover:bg-surface-container-highest border border-outline-variant/10'}`}>
                    <span className="material-symbols-outlined">expand_more</span>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-2xl w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-container-high border border-outline-variant/10 shadow-sm" style={{ color: zone.isVip ? '#F59E0B' : '#6366F1', fontVariationSettings: "'FILL' 1" }}>{zone.icon}</span>
                    <div>
                      <h4 className="font-black text-on-surface text-sm tracking-tight">{zone.name}</h4>
                      <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em]">{zone.label || 'Zona'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-outline-variant/10 pt-4 sm:pt-0">
                  <div className="text-right">
                    <p className="text-[9px] text-outline font-black uppercase tracking-[0.2em] mb-1">Soatlik narx</p>
                    {isEditingP ? (
                      <div className="flex items-center gap-2 border border-indigo rounded-xl px-3 py-1.5 bg-surface-container-highest">
                        <input autoFocus value={editingPrice.value} onChange={e => setEditingPrice(p => ({ ...p, value: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') setEditingPrice(null) }} className="bg-transparent border-none outline-none font-mono text-sm text-on-surface w-24" />
                        <button onClick={commitPrice} className="text-tertiary"><span className="material-symbols-outlined text-base">check</span></button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingPrice({ id: zone.id, type: 'zone', value: String(zone.pricePerHour) })} className="flex items-center gap-2 hover:bg-surface-container-highest px-3 py-1.5 rounded-xl transition-all group/price">
                        <span className="font-mono text-sm font-black text-on-surface">{formatPrice(zone.pricePerHour)}</span>
                        <span className="material-symbols-outlined text-xs text-outline opacity-0 group-hover/price:opacity-100 transition-opacity">edit_note</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-4">
                    <button onClick={() => setEditingZone({ ...zone })} className="p-2.5 text-outline hover:text-indigo hover:bg-indigo/10 rounded-xl transition-all border border-transparent hover:border-indigo/20"><span className="material-symbols-outlined text-xl">settings</span></button>
                    <button onClick={() => setConfirmModal({
                      isOpen: true,
                      title: 'Zonani o\'chirish',
                      message: `Rostdan ham "${zone.name}" zonasini o'chirmoqchimisiz? Bu zonaga tegishli barcha stollar ham o'chib ketadi.`,
                      onConfirm: () => { removeZone(zone.id); setConfirmModal({ ...confirmModal, isOpen: false }); }
                    })} className="p-2.5 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-all border border-transparent hover:border-error/20"><span className="material-symbols-outlined text-xl">delete</span></button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-8 border-t border-outline-variant/10 bg-surface-container-lowest/20 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-outline-variant/10 pb-6">
                    <div>
                      <h5 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Ushbu zonadagi stollar ({zoneTables.length})</h5>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <input placeholder="Stol nomi" value={newTableNames[zone.id] || ''} onChange={e => setNewTableNames(p => ({ ...p, [zone.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddTable(zone.id)} className="flex-1 sm:w-40 bg-surface-container/50 border border-outline-variant/30 rounded-xl py-2.5 px-4 text-xs text-on-surface outline-none focus:border-indigo" />
                      <button onClick={() => handleAddTable(zone.id)} className="flex items-center gap-2 bg-indigo text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo/90 transition-all active:scale-95 shadow-md shadow-indigo/10"><span className="material-symbols-outlined text-base">add</span>Qo'shish</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {zoneTables.map(t => (
                      <div key={t.id} className="bg-surface-container/50 border border-outline-variant/10 rounded-2xl p-5 flex flex-col justify-between group hover:border-indigo/20 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-black text-[13px] text-on-surface tracking-tight">{t.name}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${t.active ? 'text-tertiary' : 'text-outline-variant'}`}>{t.active ? 'Band' : 'Bo\'sh'}</p>
                          </div>
                          {!t.active && (
                            <button onClick={() => setConfirmModal({
                              isOpen: true,
                              title: 'Stolni o\'chirish',
                              message: `"${t.name}" stolini o'chirmoqchimisiz?`,
                              onConfirm: () => { removeTable(t.id); setConfirmModal({ ...confirmModal, isOpen: false }); }
                            })} className="p-1.5 rounded-xl hover:bg-error/10 text-outline-variant opacity-0 group-hover:opacity-100 hover:text-error transition-all"><span className="material-symbols-outlined text-lg">close</span></button>
                          )}
                        </div>
                        <div className="border-t border-outline-variant/5 pt-3 mt-auto">
                          {editingPrice?.id === t.id && editingPrice.type === 'table' ? (
                            <div className="flex items-center gap-2">
                              <input autoFocus className="flex-1 bg-surface-container-highest border border-indigo rounded-xl px-3 py-1.5 text-[11px] font-mono text-on-surface w-full" value={editingPrice.value} onChange={e => setEditingPrice(p => ({ ...p, value: e.target.value }))} onBlur={commitPrice} onKeyDown={e => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') setEditingPrice(null); }} />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between cursor-pointer hover:bg-surface-container-highest/50 p-2 rounded-xl transition-all" onClick={() => setEditingPrice({ id: t.id, type: 'table', value: String(t.pricePerHour) })}>
                              <span className="text-[11px] font-mono font-black text-outline">{formatPrice(t.pricePerHour)}</span>
                              <span className="material-symbols-outlined text-[14px] text-outline opacity-0 group-hover:opacity-100">edit_note</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingZone && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-surface-container-high border border-outline-variant/20 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden glass-card animate-in zoom-in-95">
              <div className="p-6 bg-surface-container-highest border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-widest text-on-surface">Zona tahrirlash</h3>
                <button onClick={() => setEditingZone(null)} className="p-2 text-outline hover:text-on-surface rounded-xl hover:bg-surface-container transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Nomi</label>
                    <input className="w-full bg-surface-container border border-outline-variant/30 rounded-2xl py-3 px-4 text-sm text-on-surface outline-none focus:border-indigo transition-all" value={editingZone.name} onChange={e => setEditingZone(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Tavsif</label>
                    <input className="w-full bg-surface-container border border-outline-variant/30 rounded-2xl py-3 px-4 text-sm text-on-surface outline-none focus:border-indigo transition-all" value={editingZone.label} onChange={e => setEditingZone(p => ({ ...p, label: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 block mb-3">Ikonka</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map(ic => (
                      <button key={ic} onClick={() => setEditingZone(p => ({ ...p, icon: ic }))} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${editingZone.icon === ic ? 'bg-indigo/20 border-indigo text-indigo' : 'bg-surface-container border-outline-variant/20 hover:border-outline-variant/50'}`}>
                        <span className="material-symbols-outlined text-xl">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-outline-variant/10 pt-6 flex gap-4">
                  <button onClick={() => setEditingZone(null)} className="flex-1 py-4 rounded-2xl border border-outline-variant/20 text-outline text-[10px] font-black uppercase tracking-widest transition-all">Bekor</button>
                  <button onClick={() => { updateZone(editingZone); setEditingZone(null); }} className="flex-1 py-4 rounded-2xl bg-indigo text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo/20 transition-all">Saqlash</button>
                </div>
              </div>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  )
}

function FoodManager() {
  const { state, addFood, removeFood, updateFood } = usePos()
  const [showAdd, setShowAdd] = useState(false)
  const [newFood, setNewFood] = useState({ name: '', price: '', category: 'Ichimliklar' })
  const [editId,  setEditId]  = useState(null)
  const [editVal, setEditVal] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionHeader icon="restaurant" title="Maxsulotlar menyusi" action={<button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 bg-indigo text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo/10 active:scale-95 transition-all"><span className="material-symbols-outlined text-lg">add_circle</span>Yangi maxsulot</button>} />
      
      {showAdd && (
        <div className="bg-surface-container/40 border border-indigo/20 rounded-[2rem] p-8 space-y-6 glass-card animate-in zoom-in-95 duration-300">
          <h4 className="text-sm font-black text-on-surface uppercase tracking-widest">Yangi maxsulot ma'lumotlari</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="sm:col-span-1 lg:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Nomi</label>
              <input value={newFood.name} onChange={e => setNewFood(p => ({ ...p, name: e.target.value }))} placeholder="Nomi" className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-2xl py-3 px-4 text-sm text-on-surface focus:border-indigo outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Narxi</label>
              <input type="number" value={newFood.price || ''} onChange={e => setNewFood(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-2xl py-3 px-4 text-sm font-mono text-on-surface focus:border-indigo outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Kategoriya</label>
              <select value={newFood.category} onChange={e => setNewFood(p => ({ ...p, category: e.target.value }))} className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-2xl py-3 px-4 text-sm text-on-surface focus:border-indigo outline-none transition-all">
                <option>Ichimliklar</option>
                <option>Ovqatlar</option>
                <option>Shirinliklar</option>
                <option>Boshqa</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-4 rounded-2xl border border-outline-variant/20 text-outline text-[10px] font-black uppercase tracking-widest transition-all">Bekor</button>
            <button onClick={() => { if (!newFood.name || !newFood.price) return; addFood({ ...newFood, price: parseInt(newFood.price, 10) }); setNewFood({ name: '', price: '', category: 'Ichimliklar' }); setShowAdd(false); }} className="flex-1 py-4 rounded-2xl bg-indigo text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo/20 transition-all">Saqlash</button>
          </div>
        </div>
      )}

      <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2.5rem] overflow-hidden glass-card">
        <div className="overflow-x-auto w-full font-sans">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Maxsulot</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Kategoriya</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Narx</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {state.foods.map(f => (
                <tr key={f.id} className="hover:bg-indigo/5 transition-all group">
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-on-surface">{f.name}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex px-3 py-1 rounded-full bg-indigo/10 text-indigo text-[10px] font-black uppercase tracking-wider border border-indigo/10">{f.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    {editId === f.id ? (
                      <div className="flex items-center gap-2 border border-indigo rounded-xl px-3 py-1.5 bg-surface-container-highest">
                        <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { const p = parseInt(editVal.replace(/\D/g, ''), 10); if (!isNaN(p)) updateFood({ id: f.id, price: p }); setEditId(null); } if (e.key === 'Escape') setEditId(null); }} className="bg-transparent border-none outline-none font-mono text-sm text-on-surface w-24" />
                        <button onClick={() => { const p = parseInt(editVal.replace(/\D/g, ''), 10); if (!isNaN(p)) updateFood({ id: f.id, price: p }); setEditId(null); }} className="text-tertiary"><span className="material-symbols-outlined text-base">check</span></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditId(f.id); setEditVal(String(f.price)) }} className="flex items-center gap-2 hover:bg-surface-container-highest px-3 py-1.5 rounded-xl transition-all group/p">
                        <span className="font-mono text-sm font-black text-on-surface">{formatPrice(f.price)}</span>
                        <span className="material-symbols-outlined text-[14px] text-outline opacity-0 group-hover/p:opacity-100 transition-opacity">edit_note</span>
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setConfirmModal({
                      isOpen: true,
                      title: 'Maxsulotni o\'chirish',
                      message: `"${f.name}" maxsulotini tahrirlashdan o'chirmoqchimisiz?`,
                      onConfirm: () => { removeFood(f.id); setConfirmModal({ ...confirmModal, isOpen: false }); }
                    })} className="p-2.5 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-all border border-transparent hover:border-error/20 opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-xl">delete</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  )
}

function Settings() {
  const { club, updateClub } = useAuth()
  const { showToast } = useToast()
  const [autoClose, setAutoClose] = useState(club?.auto_close ?? true)
  const [confirmStop, setConfirmStop] = useState(club?.safe_stop ?? true)
  const [minPrice, setMinPrice] = useState(club?.min_session_price ?? 2000)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const { error } = await updateClub({
      auto_close: autoClose,
      safe_stop: confirmStop,
      min_session_price: minPrice
    })
    setLoading(false)
    if (!error) showToast('Sozlamalar muvaffaqiyatli saqlandi', 'success')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionHeader icon="tune" title="Tizim sozlamalari" />
      <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2.5rem] p-10 space-y-10 glass-card">
        <div className="flex items-center justify-between group">
          <div className="max-w-[70%]">
            <p className="text-base font-black text-on-surface tracking-tight uppercase">Avtomatik yopish</p>
            <p className="text-[11px] text-outline mt-1 font-medium tracking-wide">Rezerv qilingan vaqt tugaganda seansni avtomatik tugatish tizimi</p>
          </div>
          <button onClick={() => setAutoClose(v => !v)} className={`relative w-14 h-8 rounded-full transition-all duration-300 ${autoClose ? 'bg-indigo shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-surface-container-highest border-2 border-outline-variant/30'}`}>
            <span className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-300 ${autoClose ? 'translate-x-8 bg-white' : 'translate-x-1.5 bg-outline-variant'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between group">
          <div className="max-w-[70%]">
            <p className="text-base font-black text-on-surface tracking-tight uppercase">Xavfsiz yakunlash</p>
            <p className="text-[11px] text-outline mt-1 font-medium tracking-wide">Har bir tranzaksiyadan so'ng tasdiqlash kvitansiyasini chiqarish</p>
          </div>
          <button onClick={() => setConfirmStop(v => !v)} className={`relative w-14 h-8 rounded-full transition-all duration-300 ${confirmStop ? 'bg-indigo shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-surface-container-highest border-2 border-outline-variant/30'}`}>
            <span className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-300 ${confirmStop ? 'translate-x-8 bg-white' : 'translate-x-1.5 bg-outline-variant'}`} />
          </button>
        </div>

        <div className="pt-8 border-t border-outline-variant/10">
          <label className="block text-[10px] font-black text-outline uppercase tracking-[0.3em] mb-4 ml-1">Minimal sessiya narxi</label>
          <div className="relative group max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-indigo">payments</span>
            <input type="number" value={minPrice} onChange={e => setMinPrice(parseInt(e.target.value) || 0)} className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-mono font-black text-on-surface focus:border-indigo outline-none transition-all" />
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo text-white font-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-indigo/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">save</span>
              Barcha sozlamalarni saqlash
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SubscriptionManager() {
  const { club, updateClub } = useAuth()
  const { showToast } = useToast()
  const [date, setDate] = useState(club?.subscription_expires_at ? new Date(club.subscription_expires_at).toISOString().split('T')[0] : '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setLoading(false)
    if (error) showToast('Xatolik yuz berdi: ' + error.message, 'error')
    else showToast('Obuna muddati yangilandi', 'success')
  }

  const isExpired = club?.subscription_expires_at && new Date(club.subscription_expires_at) < new Date()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionHeader icon="calendar_today" title="Obuna boshqaruvi" />
      <div className="bg-surface-container/30 border border-outline-variant/10 rounded-[2.5rem] p-10 space-y-10 glass-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-on-surface tracking-tight uppercase">Obuna holati</p>
            <p className="text-[11px] text-outline mt-1 font-medium tracking-wide">Tizimdan foydalanish muddati va statusi</p>
          </div>
          <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border ${isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {isExpired ? 'Muddati o\'tgan' : 'Faol'}
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/10">
          <label className="block text-[10px] font-black text-outline uppercase tracking-[0.3em] mb-4 ml-1">Amal qilish muddati</label>
          <div className="relative group max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-indigo">event</span>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-6 text-sm font-mono font-black text-on-surface focus:border-indigo outline-none transition-all" 
            />
          </div>
          <p className="text-[10px] text-outline mt-3 ml-1 font-medium">Ushbu kundan keyin tizim avtomatik ravishda bloklanadi.</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-indigo text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-indigo/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">verified</span>
              Obunani yangilash
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('zones')
  const TABS = [
    { id: 'zones',    label: 'Zonalar',    icon: 'layers' },
    { id: 'foods',    label: 'Menyu',      icon: 'restaurant' },
    { id: 'settings', label: 'Sozlamalar', icon: 'settings_suggest' },
    { id: 'subscription', label: 'Obuna', icon: 'calendar_today' },
  ]
  
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-3 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit glass-card animate-in slide-in-from-left duration-500">
        {TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/tab ${tab === t.id ? 'text-white' : 'text-outline hover:text-white hover:bg-white/5'}`}
          >
            {tab === t.id && (
              <div className="absolute inset-0 bg-indigo shadow-[0_0_30px_rgba(99,102,241,0.4)] animate-in fade-in duration-300" />
            )}
            <span className={`material-symbols-outlined text-lg relative z-10 transition-transform duration-500 group-hover/tab:scale-110 ${tab === t.id ? 'icon-filled' : ''}`}>{t.icon}</span>
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>
      
      <div className="min-h-[600px]">
        {tab === 'zones' && <ZoneManager />}
        {tab === 'foods' && <FoodManager />}
        {tab === 'settings' && <Settings />}
        {tab === 'subscription' && <SubscriptionManager />}
      </div>
    </div>
  )
}
