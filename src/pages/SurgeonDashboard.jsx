import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCases } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

// Offline Seed fallback data
const OFFLINE_CASES = [
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    status: 'Em Análise',
    proposed_date: '2026-11-05',
    patients: { name: 'Mariana Santos' },
    procedures: { description: 'Cirurgia Ortognática' },
    hospitals: { name: 'Hospital Sírio-Libanês' },
    created_at: new Date().toISOString()
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    status: 'Autorizado',
    proposed_date: '2026-10-15',
    patients: { name: 'Carlos Oliveira' },
    procedures: { description: 'Artroplastia de Joelho' },
    hospitals: { name: 'Hospital Albert Einstein' },
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320003',
    status: 'Pendente Docs',
    proposed_date: '2026-11-12',
    patients: { name: 'Ana Lúcia Ferreira' },
    procedures: { description: 'Rinoplastia Estruturada' },
    hospitals: { name: 'Clínica São José' },
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320004',
    status: 'Negado',
    proposed_date: '2026-09-20',
    patients: { name: 'Ricardo Souza' },
    procedures: { description: 'Herniorrafia Inguinal' },
    hospitals: { name: 'Hospital Moinhos de Vento' },
    created_at: '2026-08-12T10:00:00Z'
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    patients: { name: 'Fernanda Mendes' },
    procedures: { description: 'Colecistectomia' },
    hospitals: { name: 'Hospital Samaritano' },
    created_at: '2026-08-10T10:00:00Z'
  }
]

export default function SurgeonDashboard() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isOffline, setIsOffline] = useState(false)

  const fetchCases = async () => {
    try {
      setLoading(true)
      const data = await getCases()
      setCases(data || [])
      setIsOffline(false)
    } catch (e) {
      console.warn("Utilizando dados simulados offline (Supabase não conectado):", e.message)
      setCases(OFFLINE_CASES)
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  // Stats calculation
  const total = cases.length
  const emAnalise = cases.filter(c => c.status === 'Em Análise').length
  const autorizado = cases.filter(c => c.status === 'Autorizado').length
  const pendente = cases.filter(c => c.status === 'Pendente Docs').length
  const negado = cases.filter(c => c.status === 'Negado').length

  const filteredCases = cases.filter(c => 
    c.patients?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.procedures?.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.hospitals?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Autorizado':
        return 'bg-secondary-container text-on-secondary-container'
      case 'Em Análise':
        return 'bg-surface-container text-secondary border border-secondary-container'
      case 'Pendente Docs':
        return 'bg-inverse-on-surface text-on-background border border-outline-variant'
      case 'Negado':
        return 'bg-error-container text-on-error-container'
      default:
        return 'bg-surface-container-high text-on-surface-variant'
    }
  }

  const getStatusDot = (status) => {
    switch (status) {
      case 'Autorizado':
        return 'bg-on-secondary-container'
      case 'Em Análise':
        return 'bg-secondary'
      case 'Pendente Docs':
        return 'bg-outline'
      case 'Negado':
        return 'bg-error'
      default:
        return 'bg-on-surface-variant'
    }
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {/* Banner Offline de Aviso */}
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo de Demonstração (Sem conexão com o Supabase). Configure o arquivo .env para conectar ao seu banco de dados.
          </div>
        )}

        {/* Header Area */}
        <header className="w-full flex items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">clinical_notes</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background">Painel do Médico</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Bem-vindo de volta, Dr. Silva</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/medico/novo-pedido')}
            className="bg-secondary text-on-secondary hover:bg-on-background transition-colors px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Novo Pedido</span>
          </button>
        </header>

        {/* Canvas Container */}
        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Status Bento Cards */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Total Pedidos</span>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">folder_open</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black">{total}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Em Análise</span>
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black">{emAnalise}</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary-container"></div>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Autorizados</span>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black">{autorizado}</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Pendente Docs</span>
                <div className="w-8 h-8 rounded-full bg-inverse-on-surface flex items-center justify-center text-on-background">
                  <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black">{pendente}</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Negados</span>
                <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black">{negado}</span>
              </div>
            </div>
          </section>

          {/* List Section */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[400px]">
            {/* Header Controls */}
            <div className="p-6 border-b border-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-background font-bold">Acompanhamento de Pacientes</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Status e atualizações em tempo real das cirurgias solicitadas.</p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-outline-variant text-body-md font-body-md text-on-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all h-10"
                  placeholder="Buscar paciente ou cirurgia..."
                />
              </div>
            </div>

            {/* List/Table */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-md text-on-surface-variant mt-4">Carregando solicitações...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">folder_open</span>
                <h4 className="font-title-lg font-bold text-on-background">Nenhuma solicitação encontrada</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Use o botão "Novo Pedido" para cadastrar um caso.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Procedimento</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data Cirurgia</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs select-none">
                            {(c.patients?.name || '??').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <span className="font-semibold text-on-background">{c.patients?.name || 'Sem nome'}</span>
                        </td>
                        <td className="px-6 py-4">{c.procedures?.description || 'Não especificado'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{c.hospitals?.name || 'Não especificado'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(c.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(c.status)}`}></span>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {c.proposed_date ? new Date(c.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/medico/caso/${c.id}`}
                            className="inline-flex items-center justify-center text-secondary hover:text-on-background transition-colors p-2 rounded-md hover:bg-surface-container"
                          >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav role="medico" />
    </div>
  )
}
