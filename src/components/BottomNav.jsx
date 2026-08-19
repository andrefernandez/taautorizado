import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function BottomNav({ role }) {
  const navigate = useNavigate()

  const handleLogout = (e) => {
    e.preventDefault()
    navigate('/')
  }

  const doctorMenu = [
    { name: 'Painel', path: '/medico', icon: 'dashboard' },
    { name: 'Novo Pedido', path: '/medico/novo-pedido', icon: 'add_circle' },
    { name: 'Pacientes', path: '/medico/pacientes', icon: 'person' }
  ]

  const providerMenu = [
    { name: 'Cotações', path: '/fornecedor', icon: 'pending_actions' },
    { name: 'Faturamento', path: '/fornecedor/faturamento', icon: 'analytics' }
  ]

  const menuItems = role === 'medico' ? doctorMenu : providerMenu

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden h-16 bg-surface-container-low border-t border-outline-variant flex items-center justify-around z-30 px-margin-mobile shadow-level-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/medico' || item.path === '/fornecedor'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
              isActive
                ? 'text-secondary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'icon-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] tracking-tight leading-none">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
      <a
        href="/"
        onClick={handleLogout}
        className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-on-surface-variant hover:text-error"
      >
        <span className="material-symbols-outlined text-[24px]">logout</span>
        <span className="text-[10px] tracking-tight leading-none">Sair</span>
      </a>
    </div>
  )
}
