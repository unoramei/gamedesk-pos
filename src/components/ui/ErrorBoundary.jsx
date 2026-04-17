import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-on-surface">
          <div className="w-16 h-16 bg-error/10 text-error flex items-center justify-center rounded-3xl mb-6">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h1 className="text-2xl font-black mb-4 tracking-tight uppercase">Tizimda xatolik yuz berdi</h1>
          <p className="text-outline-variant mb-8 text-center max-w-md">Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki administratorga murojaat qiling.</p>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-indigo text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:shadow-2xl hover:shadow-indigo/20 active:scale-95 transition-all"
          >
            Sahifani yangilash
          </button>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-12 w-full max-w-3xl bg-surface-container-high border border-outline-variant/10 rounded-2xl p-6 overflow-auto">
              <p className="font-mono text-sm text-error mb-4">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-[10px] text-outline-variant whitespace-pre-wrap font-mono relative">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
