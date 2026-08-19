import React, { useEffect, useState } from 'react'
import { getBillingCases } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_BILLING = [
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    patients: { name: 'Carlos Oliveira' },
    hospitals: { name: 'Hospital Albert Einstein' },
    procedures: { description: 'Artroplastia de Joelho' },
    status: 'Autorizado',
    budget_items: [{ value: 8500.00, quantity: 1 }]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    patients: { name: 'Mariana Santos' },
    hospitals: { name: 'Hospital Sírio-Libanês' },
    procedures: { description: 'Cirurgia Ortognática' },
    status: 'Em Análise',
    budget_items: [
      { value: 1200.00, quantity: 4 },
      { value: 150.00, quantity: 16 }
    ]
  }
]

export default function BillingReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setLoading(true)
        const data = await getBillingCases()
        setItems(data || [])
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

  // Calculate totals
  const totalBilling = items
    .filter(c => c.status === 'Autorizado')
    .reduce((sum, c) => sum + getCaseTotal(c), 0)

  const pendingBilling = items
    .filter(c => c.status === 'Em Análise')
    .reduce((sum, c) => sum + getCaseTotal(c), 0)

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
              <h2 className="font-headline-md text-headline-md text-on-background">Faturamento e Relatórios</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Visão financeira e controle de órteses e próteses autorizadas.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Summary Bento Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            {/* Total Billing */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-level-1 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary-container"></div>
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Valor Total Autorizado</span>
                <span className="material-symbols-outlined text-secondary">payments</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-on-background">
                  R$ {totalBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">Materiais liberados para cirurgia (faturamento pendente ou concluído).</p>
              </div>
            </div>

            {/* Pending Analysis */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-high shadow-level-1 flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant">Valor Em Análise (Propostas)</span>
                <span className="material-symbols-outlined text-on-surface-variant">pending</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-on-background">
                  R$ {pendingBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-on-surface-variant mt-1">Valores cotados e aguardando resposta final da operadora.</p>
              </div>
            </div>
          </section>

          {/* List Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[350px]">
            <div className="p-6 border-b border-surface">
              <h3 className="font-title-lg text-title-lg text-on-background font-bold">Relatório de Materiais Cotados</h3>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-md text-on-surface-variant mt-4">Carregando faturamento...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">currency_exchange</span>
                <h4 className="font-title-lg font-bold text-on-background">Sem movimentações financeiras</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Cotações autorizadas ou em análise aparecerão aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Procedimento</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Valor Total OPME</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {items.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 font-semibold text-on-background">{c.patients?.name || 'Sem nome'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{c.hospitals?.name || 'Não especificado'}</td>
                        <td className="px-6 py-4">{c.procedures?.description || 'Não especificado'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'Autorizado' ? 'bg-green-100 text-green-900 border border-green-200' :
                            'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-secondary">
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
