import React, { useEffect, useState } from 'react'
import { getBillingCases } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_BILLING = [
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    doctor_name: 'Dr. Roberto Miranda',
    patients: { name: 'Carlos Oliveira', insurance: 'SulAmérica' },
    insurance: 'SulAmérica',
    hospitals: { name: 'Hospital Albert Einstein' },
    procedures: { description: 'Artroplastia de Joelho' },
    status: 'Autorizado',
    budget_items: [{ value: 8500.00, quantity: 1 }]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    doctor_name: 'Dr. Carlos Silva',
    patients: { name: 'Mariana Santos', insurance: 'Bradesco Saúde' },
    insurance: 'Bradesco Saúde',
    hospitals: { name: 'Hospital Sírio-Libanês' },
    procedures: { description: 'Cirurgia Ortognática' },
    status: 'Em Análise',
    budget_items: [
      { value: 1200.00, quantity: 4 },
      { value: 150.00, quantity: 16 }
    ]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320006',
    doctor_name: 'Dr. Carlos Silva',
    patients: { name: 'Pedro Henrique Lima', insurance: 'Bradesco Saúde' },
    insurance: 'Bradesco Saúde',
    hospitals: { name: 'Hospital Sírio-Libanês' },
    procedures: { description: 'Artrodese de Coluna Lombar' },
    status: 'Autorizado',
    budget_items: [
      { value: 4500.00, quantity: 2 },
      { value: 650.00, quantity: 8 }
    ]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320007',
    doctor_name: 'Dra. Juliana Mendes',
    patients: { name: 'Beatriz Vasconcelos', insurance: 'Amil' },
    insurance: 'Amil',
    hospitals: { name: 'Hospital Samaritano' },
    procedures: { description: 'Reconstrução de LCA com Enxerto' },
    status: 'Autorizado',
    budget_items: [
      { value: 5200.00, quantity: 1 }
    ]
  }
]

export default function BillingReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState('Todos')
  const [selectedStatus, setSelectedStatus] = useState('Todos')

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setLoading(true)
        const data = await getBillingCases()
        setItems(data && data.length > 0 ? data : OFFLINE_BILLING)
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando relatórios de faturamento offline:", e.message)
        setItems(OFFLINE_BILLING)
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBilling()
  }, [])

  const getCaseTotal = (c) => {
    return c.budget_items?.reduce((sum, item) => sum + (Number(item.value) * item.quantity), 0) || 0
  }

  // Doctors list
  const doctorList = ['Todos', ...Array.from(new Set(items.map(i => i.doctor_name || 'Dr. Carlos Silva')))]

  // Filtered Items
  const filteredItems = items.filter(c => {
    const doc = c.doctor_name || 'Dr. Carlos Silva'
    const matchesDoc = selectedDoctor === 'Todos' || doc === selectedDoctor
    const matchesStatus = selectedStatus === 'Todos' || c.status === selectedStatus
    return matchesDoc && matchesStatus
  })

  // Calculate totals based on filtered view
  const totalBilling = filteredItems
    .filter(c => c.status === 'Autorizado')
    .reduce((sum, c) => sum + getCaseTotal(c), 0)

  const pendingBilling = filteredItems
    .filter(c => c.status === 'Em Análise')
    .reduce((sum, c) => sum + getCaseTotal(c), 0)

  // Doctor Breakdown Statistics
  const doctorStatsMap = {}
  items.forEach(c => {
    const doc = c.doctor_name || 'Dr. Carlos Silva'
    if (!doctorStatsMap[doc]) {
      doctorStatsMap[doc] = { name: doc, totalCases: 0, authorizedAmount: 0, pendingAmount: 0 }
    }
    doctorStatsMap[doc].totalCases += 1
    if (c.status === 'Autorizado') {
      doctorStatsMap[doc].authorizedAmount += getCaseTotal(c)
    } else {
      doctorStatsMap[doc].pendingAmount += getCaseTotal(c)
    }
  })
  const doctorStats = Object.values(doctorStatsMap)

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="fornecedor" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline ativo: dados de faturamento baseados em simulações.
          </div>
        )}

        <header className="w-full flex items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">analytics</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background font-black">Faturamento e Relatórios por Cirurgião</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Controle financeiro de OPME, faturamento autorizado e volume por médico.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Summary Bento Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            {/* Total Billing */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-level-1 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Valor Total Autorizado</span>
                <span className="material-symbols-outlined text-emerald-600">payments</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-on-background text-emerald-700">
                  R$ {totalBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">Materiais liberados para faturamento.</p>
              </div>
            </div>

            {/* Pending Analysis */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-level-1 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Valor Em Análise (Propostas)</span>
                <span className="material-symbols-outlined text-blue-600">pending</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-on-background text-blue-700">
                  R$ {pendingBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">Aguardando resposta da auditoria da operadora.</p>
              </div>
            </div>

            {/* Total Cirurgiões Ativos */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-level-1 flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Cirurgiões Parceiros</span>
                <span className="material-symbols-outlined text-secondary">group</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-on-background">
                  {doctorStats.length}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">Médicos com solicitações e cotações registradas.</p>
              </div>
            </div>
          </section>

          {/* Cards de Performance por Cirurgião */}
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-surface-container-high flex flex-col gap-4">
            <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">bar_chart</span>
              Desempenho & Faturamento por Cirurgião
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorStats.map((doc, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedDoctor(doc.name === selectedDoctor ? 'Todos' : doc.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDoctor === doc.name 
                      ? 'bg-secondary/10 border-secondary ring-2 ring-secondary/30' 
                      : 'bg-surface-container-low/50 border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-on-background flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-base">person</span>
                      {doc.name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      {doc.totalCases} {doc.totalCases === 1 ? 'caso' : 'casos'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Autorizado:</span>
                      <span>R$ {doc.authorizedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant font-medium">
                      <span>Em Cotação / Análise:</span>
                      <span>R$ {doc.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* List Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[350px]">
            <div className="p-6 border-b border-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-background font-bold">Relatório Analítico de Materiais</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Visão detalhada por cirurgião, paciente, convênio e valores de materiais.</p>
              </div>

              {/* Filtro por Cirurgião */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-on-surface-variant shrink-0">Filtrar por Médico:</span>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-bold text-on-background focus:ring-2 focus:ring-secondary"
                >
                  {doctorList.map((doc, idx) => (
                    <option key={idx} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-md text-on-surface-variant mt-4">Carregando faturamento...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">currency_exchange</span>
                <h4 className="font-title-lg font-bold text-on-background">Sem movimentações financeiras</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Nenhum registro para o filtro selecionado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Cirurgião Solicitante</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Convênio</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Hospital</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Procedimento</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Valor Total OPME</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {filteredItems.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 font-bold text-xs text-on-background flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-secondary">person</span>
                          <span>{c.doctor_name || 'Dr. Carlos Silva'}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-xs text-on-background">{c.patients?.name || 'Sem nome'}</td>
                        <td className="px-5 py-4 text-xs font-medium text-on-surface-variant">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-container">
                            {c.insurance || c.patients?.insurance || 'Bradesco Saúde'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant">{c.hospitals?.name || 'Não especificado'}</td>
                        <td className="px-5 py-4 text-xs">{c.procedures?.description || 'Não especificado'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'Autorizado' ? 'bg-green-100 text-green-900 border border-green-200' :
                            'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-secondary">
                          R$ {getCaseTotal(c).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

