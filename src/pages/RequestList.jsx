import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCases } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_CASES = [
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    status: 'Em Análise',
    proposed_date: '2026-11-05',
    patients: { id: 'f3b07384-d113-4b0d-9fae-9d229a320001', name: 'Mariana Santos', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Cirurgia Ortognática', code: '30205012' },
    hospitals: { name: 'Hospital Sírio-Libanês' },
    created_at: new Date().toISOString()
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    status: 'Autorizado',
    proposed_date: '2026-10-15',
    patients: { id: 'f3b07384-d113-4b0d-9fae-9d229a320002', name: 'Carlos Oliveira', insurance: 'SulAmérica' },
    procedures: { description: 'Artroplastia de Joelho', code: '30725113' },
    hospitals: { name: 'Hospital Albert Einstein' },
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320003',
    status: 'Pendente Docs',
    proposed_date: '2026-11-12',
    patients: { id: 'f3b07384-d113-4b0d-9fae-9d229a320003', name: 'Ana Lúcia Ferreira', insurance: 'Amil' },
    procedures: { description: 'Rinoplastia Estruturada', code: '30101292' },
    hospitals: { name: 'Clínica São José' },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320004',
    status: 'Negado',
    proposed_date: '2026-09-20',
    patients: { id: 'f3b07384-d113-4b0d-9fae-9d229a320004', name: 'Ricardo Souza', insurance: 'Unimed Seguros' },
    procedures: { description: 'Herniorrafia Inguinal', code: '31002390' },
    hospitals: { name: 'Hospital Moinhos de Vento' },
    created_at: '2026-08-12T10:00:00Z'
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    patients: { id: 'f3b07384-d113-4b0d-9fae-9d229a320005', name: 'Fernanda Mendes', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Colecistectomia', code: '31001016' },
    hospitals: { name: 'Hospital Samaritano' },
    created_at: '2026-08-10T10:00:00Z'
  }
]

export default function RequestList() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [isOffline, setIsOffline] = useState(false)

  const fetchCases = async () => {
    try {
      setLoading(true)
      const data = await getCases()
      setCases(data || [])
      setIsOffline(false)
    } catch (e) {
      console.warn("Utilizando lista de solicitações offline:", e.message)
      setCases(OFFLINE_CASES)
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.patients?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.procedures?.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.procedures?.code || '').includes(search) ||
      (c.hospitals?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.patients?.insurance || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Autorizado':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300'
      case 'Em Análise':
        return 'bg-blue-100 text-blue-900 border border-blue-300'
      case 'Pendente Docs':
        return 'bg-amber-100 text-amber-900 border border-amber-300'
      case 'Negado':
        return 'bg-rose-100 text-rose-900 border border-rose-300'
      default:
        return 'bg-purple-100 text-purple-900 border border-purple-300'
    }
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline: Exibindo solicitações salvas na demonstração.
          </div>
        )}

        <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">list_alt</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background font-black">Minhas Solicitações Cirúrgicas</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Lista completa e detalhada de todos os pedidos cadastrados.</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/medico/novo-pedido')}
            className="bg-secondary text-on-secondary hover:bg-on-background transition-colors px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Novo Pedido</span>
          </button>
        </header>

        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Main List Container */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[500px]">
            
            {/* Filter and Search Bar */}
            <div className="p-6 border-b border-surface flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest">
              
              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {['Todos', 'Em Análise', 'Autorizado', 'Pendente Docs', 'Aguardando Orçamento', 'Negado'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      statusFilter === st
                        ? 'bg-secondary text-on-secondary shadow-sm scale-105'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full lg:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-outline-variant text-body-md text-on-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all h-10"
                  placeholder="Buscar paciente, procedimento, hospital..."
                />
              </div>

            </div>

            {/* List Table */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-md text-on-surface-variant mt-4">Carregando lista de pedidos...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">find_in_page</span>
                <h4 className="font-title-lg font-bold text-on-background">Nenhum pedido encontrado</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Tente ajustar os filtros ou a busca acima.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Procedimento (TUSS)</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Hospital / Convênio</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data Proposta</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {filteredCases.map((c) => (
                      <tr 
                        key={c.id} 
                        className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                        onClick={() => navigate(`/medico/caso/${c.id}`)}
                      >
                        <td className="px-6 py-4">
                          <Link 
                            to={`/medico/paciente/${c.patients?.id}`} 
                            onClick={(e) => e.stopPropagation()} 
                            className="font-bold text-on-background hover:text-secondary transition-colors block"
                          >
                            {c.patients?.name || 'Sem nome'}
                          </Link>
                          <span className="text-xs text-on-surface-variant font-medium">{c.patients?.insurance}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-on-background block">{c.procedures?.description || 'Não especificado'}</span>
                          {c.procedures?.code && (
                            <span className="text-xs font-mono text-on-surface-variant">TUSS: {c.procedures?.code}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-medium">
                          {c.hospitals?.name || 'Não especificado'}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {c.proposed_date ? new Date(c.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/medico/caso/${c.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center text-secondary hover:text-on-background transition-colors px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold gap-1"
                          >
                            <span>Detalhes</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
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
