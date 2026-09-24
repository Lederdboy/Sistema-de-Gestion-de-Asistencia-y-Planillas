import { UserCog } from 'lucide-react'

export default function GestionUsuariosView({ user }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UserCog size={16} className="text-blue-600" />
          Gestión de Usuarios
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {user?.rol === 'GERENTE_GENERAL'
            ? 'Crea y administra usuarios para todas las sedes.'
            : 'Crea y administra usuarios de tu sede.'}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <UserCog size={28} className="text-blue-600" />
        </div>
        <p className="text-sm font-bold text-slate-800">Módulo en construcción</p>
        <p className="text-xs text-slate-500 max-w-sm">
          Aquí podrás crear usuarios, asignarles roles y sedes. Próximamente disponible.
        </p>
      </div>
    </div>
  )
}
