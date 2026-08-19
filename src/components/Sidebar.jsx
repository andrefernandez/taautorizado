import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar({ role }) {
  const navigate = useNavigate()

  const handleLogout = (e) => {
    e.preventDefault()
    navigate('/')
  }

  const doctorMenu = [
    { name: 'Dashboard', path: '/medico', icon: 'dashboard' },
    { name: 'Solicitações', path: '/medico/pedidos', icon: 'list_alt' },
    { name: 'Pacientes', path: '/medico/pacientes', icon: 'person' },
    { name: 'Rede Credenciada', path: '/medico/cadastros', icon: 'domain' },
    { name: 'Novo Pedido', path: '/medico/novo-pedido', icon: 'add' }
  ]

  const providerMenu = [
    { name: 'Fila de Cotações', path: '/fornecedor', icon: 'pending_actions' },
    { name: 'Faturamento', path: '/fornecedor/faturamento', icon: 'analytics' },
    { name: 'Hospitais e Convênios', path: '/fornecedor/cadastros', icon: 'domain' }
  ]

  const menuItems = role === 'medico' ? doctorMenu : providerMenu

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant flex-col py-stack-lg px-stack-md z-20 transition-all">
      {/* Brand Header */}
      <div className="mb-stack-lg px-stack-sm flex flex-col gap-unit">
        <h1 className="font-headline-lg text-headline-lg font-black text-on-background tracking-tight">Tá Autorizado</h1>
        <span className="font-label-md text-label-md text-on-surface-variant font-medium">Clinical Precision</span>
      </div>

      {/* CTA para Novo Pedido se for Médico */}
      {role === 'medico' && (
        <NavLink
          to="/medico/novo-pedido"
          className="mb-stack-lg w-full bg-secondary text-on-secondary hover:bg-on-background transition-colors duration-200 rounded-lg py-3 px-4 flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="font-label-md text-label-md font-semibold">Novo Pedido</span>
        </NavLink>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex-1 flex flex-col gap-stack-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/medico' || item.path === '/fornecedor'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold scale-102 translate-x-1'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : 'group-hover:text-secondary transition-colors'}`}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Tabs */}
      <div className="mt-auto pt-stack-md border-t border-outline-variant flex flex-col gap-stack-sm">
        <a
          href="/"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error/10 transition-all duration-200 rounded-lg"
        >
          <span class="material-symbols-outlined">logout</span>
          <span class="font-label-md text-label-md">Sair do Perfil</span>
        </a>
      </div>
    </nav>
  )
}
