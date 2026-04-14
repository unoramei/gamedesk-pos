import { usePos } from '../../context/PosContext'

const PAGE_TITLES = {
  dashboard: 'Asosiy boshqaruv',
  zonalar: 'Zonalar / Stollar',
  foyda: 'Foyda tahlili',
  smenalar: 'Smenalar',
  admin: 'Admin boshqaruvi',
}

const PAGE_ICONS = {
  dashboard: 'dashboard',
  zonalar: 'layers',
  foyda: 'trending_up',
  smenalar: 'badge',
  admin: 'settings',
}

export default function TopAppBar({ isSidebarOpen, onAddTable, onRefresh, onToggleSidebar }) {
  const { state, setPage } = usePos()
  const title = PAGE_TITLES[state.page] || ''
  const icon = PAGE_ICONS[state.page] || ''

  const activeTables = state.tables.filter(t => t.active).length

  return (
    <header className={`fixed top-0 right-0 h-20 px-4 md:px-8 flex justify-between items-center glass-header transition-all duration-300 z-30 ${isSidebarOpen ? 'w-full lg:w-[calc(100%-240px)]' : 'w-full'}`}>
      {/* Left: title + breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-outline hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-lg hidden sm:block">{icon}</span>
            <h2 className="font-headline text-lg md:text-xl font-black tracking-tight text-on-surface truncate max-w-[150px] sm:max-w-none">{title}</h2>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(74,225,118,0.5)]" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-outline-variant">
              System Online <span className="mx-1.5">|</span> <span className="text-tertiary uppercase">{activeTables} faol stol</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden lg:flex items-center bg-surface-container/40 p-1.5 rounded-2xl border border-outline-variant/10">
          <button
            onClick={() => setPage('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-outline hover:text-indigo hover:bg-indigo/10 transition-all ${state.page === 'dashboard' ? 'text-indigo bg-indigo/10 shadow-sm' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Boshqaruv</span>
          </button>

          <button
            onClick={() => { setPage('zonalar'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-outline hover:text-indigo hover:bg-indigo/10 transition-all ${state.page === 'zonalar' ? 'text-indigo bg-indigo/10 shadow-sm' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">layers</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Zonalar</span>
          </button>

          <button
            onClick={() => setPage('foyda')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-outline hover:text-indigo hover:bg-indigo/10 transition-all ${state.page === 'foyda' ? 'text-indigo bg-indigo/10 shadow-sm' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">insights</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Foyda</span>
          </button>

          <button
            onClick={() => setPage('smenalar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-outline hover:text-indigo hover:bg-indigo/10 transition-all ${state.page === 'smenalar' ? 'text-indigo bg-indigo/10 shadow-sm' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">badge</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Smenalar</span>
          </button>

          <button
            onClick={() => setPage('admin')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-outline hover:text-indigo hover:bg-indigo/10 transition-all ${state.page === 'admin' ? 'text-indigo bg-indigo/10 shadow-sm' : ''}`}
          >
            <span className="material-symbols-outlined text-xl">settings_input_component</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Sozlamalar</span>
          </button>
        </div>

        <button
          id="refresh-btn"
          onClick={onRefresh}
          className="p-3 text-outline hover:text-on-surface hover:bg-surface-container rounded-2xl transition-all active:scale-90 duration-150"
          title="Yangilash"
        >
          <span className="material-symbols-outlined text-xl">refresh</span>
        </button>

        {state.page === 'zonalar' && (
          <button
            id="add-table-btn"
            onClick={onAddTable}
            className="flex items-center gap-2 bg-indigo text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 duration-150 hover:shadow-2xl hover:shadow-indigo/30"
          >
            <span className="material-symbols-outlined text-lg icon-filled">add_circle</span>
            <span className="hidden xs:inline">Stol qo'shish</span>
          </button>
        )}
      </div>
    </header>
  )
}
