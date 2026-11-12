import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />,
    info: <Info size={18} className="text-blue-600 flex-shrink-0" />,
  }

  const borderColors = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/90 text-rose-900',
    info: 'border-blue-200 bg-blue-50/90 text-blue-900',
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-[0_18px_38px_rgba(15,23,42,0.12)] backdrop-blur-xl text-xs font-medium max-w-md ${borderColors[toast.type || 'info']}`}>
        {icons[toast.type || 'info']}
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:opacity-75 rounded transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
