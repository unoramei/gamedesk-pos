import { createPortal } from 'react-dom'

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Tasdiqlash', 
  cancelText = 'Bekor qilish', 
  onConfirm, 
  onCancel,
  type = 'danger' 
}) {
  if (!isOpen) return null

  const typeConfig = {
    danger: {
      color: 'text-error',
      bgClass: 'bg-error',
      shadow: 'shadow-[0_20px_40px_rgba(248,113,113,0.2)] hover:shadow-[0_20px_40px_rgba(248,113,113,0.4)]',
      iconBg: 'bg-error/10 border-error/20',
      icon: 'report'
    },
    primary: {
      color: 'text-indigo',
      bgClass: 'bg-indigo',
      shadow: 'shadow-[0_20px_40px_rgba(99,102,241,0.2)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.4)]',
      iconBg: 'bg-indigo/10 border-indigo/20',
      icon: 'help'
    },
    warning: {
      color: 'text-amber-500',
      bgClass: 'bg-amber-500',
      shadow: 'shadow-[0_20px_40px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.4)]',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      icon: 'warning'
    }
  }

  const { color, bgClass, shadow, iconBg, icon } = typeConfig[type]

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#050507]/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-[60px] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] ring-1 ring-white/5 animate-in fade-in zoom-in duration-300 overflow-hidden group">
        {/* Subtle Ambient Light based on type */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full transition-all duration-700 opacity-20 ${type === 'danger' ? 'bg-error' : type === 'warning' ? 'bg-amber-500' : 'bg-indigo'}`} />
        
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 border transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${iconBg}`}>
            <span className={`material-symbols-outlined text-[32px] icon-filled ${color} drop-shadow-[0_0_15px_currentColor]`}>{icon}</span>
          </div>
          
          <h3 className="text-2xl font-black text-white tracking-widest mb-3 italic uppercase">{title}</h3>
          <p className="text-white/40 text-[11px] uppercase tracking-[0.1em] font-bold leading-relaxed mb-10 max-w-[280px]">
            {message}
          </p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={onCancel}
              className="py-4 rounded-2xl bg-white/[0.03] text-white/50 text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`relative overflow-hidden py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] ${bgClass} ${shadow} group/btn`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
