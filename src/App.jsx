import { useState, useEffect } from 'react'
import { PosProvider, usePos } from './context/PosContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Sidebar from './components/layout/Sidebar'
import TopAppBar from './components/layout/TopAppBar'
import AddTableModal from './components/tables/AddTableModal'
import ShiftOverlay from './components/layout/ShiftOverlay'
import Dashboard from './pages/Dashboard'
import Stollar from './pages/Stollar'
import Foyda from './pages/Foyda'
import Admin from './pages/Admin'
import LoginPage from './pages/Login'
import SuperAdmin from './pages/SuperAdmin'
import FrozenScreen from './pages/FrozenScreen'
import Shifts from './pages/Shifts'

function AppShell() {
  const { state } = usePos()
  const [showAddTable, setShowAddTable] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024)

  const handleRefresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="flex min-h-screen bg-background relative selection:bg-indigo/30 selection:text-indigo">
      {!state.activeShift && <ShiftOverlay />}

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={`flex-1 w-full transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'lg:pl-[240px]' : ''} ${!state.activeShift ? 'blur-md pointer-events-none' : ''}`}>
        <TopAppBar
          isSidebarOpen={isSidebarOpen}
          onAddTable={() => setShowAddTable(true)}
          onRefresh={handleRefresh}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="pt-24 px-2 sm:px-4 md:px-8 pb-12 w-full overflow-x-hidden min-h-screen page-enter" key={refreshKey}>
          {state.page === 'dashboard' && <Dashboard />}
          {state.page === 'zonalar' && <Stollar onAddTable={() => setShowAddTable(true)} />}
          {state.page === 'foyda' && <Foyda />}
          {state.page === 'smenalar' && <Shifts />}
          {state.page === 'admin' && <Admin />}
        </main>
      </div>

      {showAddTable && (
        <AddTableModal onClose={() => setShowAddTable(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PosProvider>
          <AppContent />
        </PosProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

function AppContent() {
  const { user, club, loading, isSuperAdmin } = useAuth()

  useEffect(() => {
    if (club?.name) {
      document.title = `${club.name} | AXIPH GAMING POS`
    } else {
      document.title = 'AXIPH GAMING'
    }
  }, [club])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-indigo border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return <SuperAdmin />
  }

  if (!user) {
    return <LoginPage />
  }

  const isExpired = club?.subscription_expires_at && new Date(club.subscription_expires_at) < new Date();
  if (club?.is_frozen || isExpired) {
    return <FrozenScreen />
  }

  return <AppShell />
}
