import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

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
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    patients: { name: 'Fernanda Mendes' },
    procedures: { description: 'Colecistectomia' },
    hospitals: { name: 'Hospital Samaritano' },
    created_at: '2026-08-10T10:00:00Z'
  }
]

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [filter, setFilter] = useState('Todos') // 'Todos', 'Aguardando Orçamento', 'Em Análise', 'Autorizado'

  const fetchCases = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          status,
          proposed_date,
          created_at,
          patients ( name ),
          procedures ( description ),
          hospitals ( name )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCases(data || [])
      setIsOffline(false)
    } catch (e) {
      console.warn("Utilizando fila de cotações offline:", e.message)
      setCases(OFFLINE_CASES)
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const total = cases.length
  const pendentes = cases.filter(c => c.status === 'Aguardando Orçamento').length
  const emAnalise = cases.filter(c => c.status === 'Em Análise').length
  const autorizados = cases.filter(c => c.status === 'Autorizado').length

  const filteredCases = cases.filter(c => {
    if (filter === 'Todos') return true
    return c.status === filter
  })

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="fornecedor" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Demonstração offline: Exibindo fila de cotações fictícia.
          </div>
        )}

        <header className="w-full flex items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">pending_actions</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background">Fila de Cotações (OPME)</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Gerencie orçamentos e cotações de implantes solicitados.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Stats Bento Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            <button 
              onClick={() => setFilter('Todos')}
              className={`p-6 rounded-xl border text-left shadow-level-1 transition-all ${
                filter === 'Todos' 
                  ? 'bg-secondary-container border-secondary text-on-secondary-container font-semibold' 
                  : 'bg-surface-container-lowest border-outline-variant/30 text-on-background hover:bg-surface-container-low'
              }`}
            >
              <span className="block text-xs font-medium uppercase tracking-wider opacity-80">Todos os Casos</span>
              <span className="block text-3xl font-black mt-2">{total}</span>
            </button>

            <button 
              onClick={() => setFilter('Aguardando Orçamento')}
              className={`p-6 rounded-xl border text-left shadow-level-1 transition-all ${
                filter === 'Aguardando Orçamento' 
                  ? 'bg-secondary-container border-secondary text-on-secondary-container font-semibold' 
                  : 'bg-surface-container-lowest border-outline-variant/30 text-on-background hover:bg-surface-container-low'
              }`}
            >
              <span className="block text-xs font-medium uppercase tracking-wider opacity-80">Aguardando Cotação</span>
              <span className="block text-3xl font-black mt-2 text-secondary">{pendentes}</span>
            </button>

            <button 
              onClick={() => setFilter('Em Análise')}
              className={`p-6 rounded-xl border text-left shadow-level-1 transition-all ${
                filter === 'Em Análise' 
                  ? 'bg-secondary-container border-secondary text-on-secondary-container font-semibold' 
                  : 'bg-surface-container-lowest border-outline-variant/30 text-on-background hover:bg-surface-container-low'
              }`}
            >
              <span className="block text-xs font-medium uppercase tracking-wider opacity-80">Cotado / Em Análise</span>
              <span className="block text-3xl font-black mt-2">{emAnalise}</span>
            </button>

            <button 
              onClick={() => setFilter('Autorizado')}
              className={`p-6 rounded-xl border text-left shadow-level-1 transition-all ${
                filter === 'Autorizado' 
                  ? 'bg-secondary-container border-secondary text-on-secondary-container font-semibold' 
                  : 'bg-surface-container-lowest border-outline-variant/30 text-on-background hover:bg-surface-container-low'
              }`}
            >
              <span className="block text-xs font-medium uppercase tracking-wider opacity-80">Autorizados</span>
              <span className="block text-3xl font-black mt-2">{autorizados}</span>
            </button>
          </section>

          {/* List Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-surface">
              <h3 className="font-title-lg text-title-lg text-on-background font-bold">Solicitações de OPME</h3>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-md text-on-surface-variant mt-4">Carregando lista de cirurgias...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">pending_actions</span>
                <h4 className="font-title-lg font-bold text-on-background">Nenhum caso encontrado</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Não há solicitações na categoria selecionada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Procedimento</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data Cirurgia</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 font-semibold text-on-background">{c.patients?.name || 'Sem nome'}</td>
                        <td className="px-6 py-4">{c.procedures?.description || 'Não especificado'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{c.hospitals?.name || 'Não especificado'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {c.proposed_date ? new Date(c.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'Aguardando Orçamento' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            c.status === 'Em Análise' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                            'bg-green-100 text-green-900 border border-green-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {c.status === 'Aguardando Orçamento' ? (
                            <Link 
                              to={`/fornecedor/cotacao/${c.id}`}
                              className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-on-background transition-colors inline-block"
                            >
                              Cotar Materiais
                            </Link>
                          ) : (
                            <span className="text-xs text-on-surface-variant font-medium">Cotado</span>
                          )}
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

      <BottomNav role="fornecedor" />
    </div>
  )
}
