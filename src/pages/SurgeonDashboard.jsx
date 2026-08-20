import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getCases } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

// Offline Seed fallback data enriched
const OFFLINE_CASES = [
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    status: 'Em Análise',
    proposed_date: '2026-11-05',
    patients: { name: 'Mariana Santos', insurance: 'Bradesco Saúde' },
    insurance: 'Bradesco Saúde',
    supplier_indicated: 'OPME Sul Distribuidora',
    supplier_authorized: 'Aguardando Regulação',
    procedures: { description: 'Cirurgia Ortognática', code: '30205012' },
    hospitals: { name: 'Hospital Sírio-Libanês' },
    created_at: new Date().toISOString(),
    follow_ups: [
      { id: 'f1', author: 'Camila (Tá Autorizado)', date: '20/08 14:30', content: 'Protocolo aberto no Bradesco. Em análise técnica de junta médica.' }
    ]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    status: 'Autorizado',
    proposed_date: '2026-10-15',
    patients: { name: 'Carlos Oliveira', insurance: 'SulAmérica' },
    insurance: 'SulAmérica',
    supplier_indicated: 'OrtoPrime Hospitalar',
    supplier_authorized: 'OrtoPrime Hospitalar',
    procedures: { description: 'Artroplastia de Joelho', code: '30725113' },
    hospitals: { name: 'Hospital Albert Einstein' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    follow_ups: [
      { id: 'f2', author: 'Camila (Tá Autorizado)', date: '19/08 11:20', content: 'Guia de autorização emitida pela SulAmérica com materiais 100% liberados!' }
    ]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320003',
    status: 'Pendente Docs',
    proposed_date: '2026-11-12',
    patients: { name: 'Ana Lúcia Ferreira', insurance: 'Amil' },
    insurance: 'Amil',
    supplier_indicated: 'MedImplantes Brasil',
    supplier_authorized: 'Aguardando Docs',
    procedures: { description: 'Rinoplastia Estruturada', code: '30101292' },
    hospitals: { name: 'Clínica São José' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    follow_ups: [
      { id: 'f3', author: 'Camila (Tá Autorizado)', date: '18/08 16:45', content: 'Convênio solicitou tomografia com corte coronal atualizada.' }
    ]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320004',
    status: 'Negado',
    proposed_date: '2026-09-20',
    patients: { name: 'Ricardo Souza', insurance: 'Unimed Seguros' },
    insurance: 'Unimed Seguros',
    supplier_indicated: 'Surgical Direct',
    supplier_authorized: 'Não Autorizado',
    procedures: { description: 'Herniorrafia Inguinal', code: '31002390' },
    hospitals: { name: 'Hospital Moinhos de Vento' },
    created_at: '2026-08-12T10:00:00Z',
    follow_ups: [
      { id: 'f4', author: 'Camila (Tá Autorizado)', date: '15/08 09:10', content: 'Negativa administrativa por carência contratual. Elaborando recurso.' }
    ]
  },
  {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    patients: { name: 'Fernanda Mendes', insurance: 'Bradesco Saúde' },
    insurance: 'Bradesco Saúde',
    supplier_indicated: 'OPME Sul Distribuidora',
    supplier_authorized: 'Pendente Cotação',
    procedures: { description: 'Colecistectomia', code: '31001016' },
    hospitals: { name: 'Hospital Samaritano' },
    created_at: '2026-08-10T10:00:00Z',
    follow_ups: [
      { id: 'f5', author: 'Camila (Tá Autorizado)', date: '17/08 15:00', content: 'Solicitação de cotação enviada para os distribuidores credenciados.' }
    ]
  }
]

export default function SurgeonDashboard() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isOffline, setIsOffline] = useState(false)

  // Communication / Support Modal State
  const [communicationModalOpen, setCommunicationModalOpen] = useState(false)
  const [selectedCaseForComms, setSelectedCaseForComms] = useState(null)
  const [commType, setCommType] = useState('call_insurance')
  const [customCommMessage, setCustomCommMessage] = useState('')
  const [sendingComm, setSendingComm] = useState(false)
  const [commSuccessToast, setCommSuccessToast] = useState('')

  const fetchCases = async () => {
    try {
      setLoading(true)
      const data = await getCases()
      setCases(data || [])
      setIsOffline(false)
    } catch (e) {
      console.warn("Utilizando dados simulados offline:", e.message)
      setCases(OFFLINE_CASES)
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const openCommModal = (caseItem = null) => {
    setSelectedCaseForComms(caseItem || cases[0] || null)
    setCommunicationModalOpen(true)
  }

  const handleSendCommunication = async (e) => {
    e.preventDefault()
    if (!selectedCaseForComms) return

    setSendingComm(true)
    try {
      const typeLabels = {
        call_insurance: '📞 Pedido: Ligar no convênio / Cobrar urgência',
        patient_cancel: '⚠️ Paciente quer desistir / desmarcar',
        priority_review: '⚡ Revisão urgente do caso pela regulação',
        other: '💬 Mensagem personalizada'
      }

      const newMsg = {
        id: Date.now().toString(),
        case_id: selectedCaseForComms.id,
        type: commType,
        typeLabel: typeLabels[commType] || 'Chamado',
        patientName: selectedCaseForComms.patients?.name || 'Paciente',
        message: customCommMessage || typeLabels[commType],
        date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        status: 'Enviado para a Camila (Operação)'
      }

      // Add locally
      setCases(prev => prev.map(c => {
        if (c.id === selectedCaseForComms.id) {
          const updatedComms = [newMsg, ...(c.support_messages || [])]
          return { ...c, support_messages: updatedComms }
        }
        return c
      }))

      setCommSuccessToast(`Mensagem registrada para a equipe Tá Autorizado sobre ${selectedCaseForComms.patients?.name}!`)
      setCommunicationModalOpen(false)
      setCustomCommMessage('')
      setTimeout(() => setCommSuccessToast(''), 4500)
    } catch (err) {
      alert("Erro ao enviar mensagem: " + err.message)
    } finally {
      setSendingComm(false)
    }
  }

  // Stats calculation
  const total = cases.length
  const emAnalise = cases.filter(c => c.status === 'Em Análise').length
  const autorizado = cases.filter(c => c.status === 'Autorizado').length
  const pendente = cases.filter(c => c.status === 'Pendente Docs').length
  const negado = cases.filter(c => c.status === 'Negado').length

  const filteredCases = cases.filter(c => 
    c.patients?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.procedures?.description?.toLowerCase().includes(search.toLowerCase()) ||
    (c.insurance || c.patients?.insurance || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.supplier_indicated || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.supplier_authorized || '').toLowerCase().includes(search.toLowerCase()) ||
    c.hospitals?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusStyle = (status) => {
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

  const getSupplierAuthStyle = (auth) => {
    if (!auth || auth.includes('Aguardando') || auth.includes('Pendente')) {
      return 'bg-amber-50 text-amber-800 border border-amber-200'
    }
    if (auth.includes('Não')) {
      return 'bg-rose-50 text-rose-800 border border-rose-200'
    }
    return 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {/* Toast Notificação de Sucesso */}
        {commSuccessToast && (
          <div className="bg-secondary text-on-secondary px-4 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg sticky top-0 z-50 animate-bounce">
            <span className="material-symbols-outlined text-lg">mark_email_read</span>
            {commSuccessToast}
          </div>
        )}

        {/* Banner Offline de Aviso */}
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo de Demonstração (Sem conexão com o Supabase). Dados salvos localmente.
          </div>
        )}

        {/* Header Area */}
        <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">clinical_notes</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background font-black">Painel do Cirurgião</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Acompanhamento regulatório e autorização de materiais OPME</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => openCommModal()}
              className="bg-surface-container hover:bg-surface-container-high text-secondary border border-secondary/30 transition-colors px-4 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              <span>Falar com Tá Autorizado</span>
            </button>

            <button 
              onClick={() => navigate('/medico/novo-pedido')}
              className="bg-secondary text-on-secondary hover:bg-on-background transition-colors px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Novo Pedido</span>
            </button>
          </div>
        </header>

        {/* Canvas Container */}
        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Status Bento Cards */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Pedidos</span>
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
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Em Análise</span>
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
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Autorizados</span>
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black text-emerald-700">{autorizado}</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-container-high flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Pendente Docs</span>
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
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">Negados</span>
                <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-display-lg text-display-lg text-on-background font-black text-rose-700">{negado}</span>
              </div>
            </div>
          </section>

          {/* List Section */}
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[400px]">
            {/* Header Controls */}
            <div className="p-6 border-b border-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-background font-bold">Acompanhamento Completo das Cirurgias</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Status regulatório, convênios e distribuidores de OPME associados.</p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-outline-variant text-body-md font-body-md text-on-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all h-10"
                  placeholder="Buscar paciente, convênio, fornecedor..."
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
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Paciente</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Convênio</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Procedimento</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Fornecedor Indicado</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Fornecedor Autorizado</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider">Data Cirurgia</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Ações / Suporte</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs select-none">
                              {(c.patients?.name || '??').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-on-background block">{c.patients?.name || 'Sem nome'}</span>
                              <span className="text-xs text-on-surface-variant">{c.hospitals?.name || 'Hospital'}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Coluna 1 solicitada: Convênio */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-xs text-on-background bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant/30">
                            <span className="material-symbols-outlined text-[14px] text-secondary">health_and_safety</span>
                            {c.insurance || c.patients?.insurance || 'Bradesco Saúde'}
                          </span>
                        </td>

                        {/* Procedimento */}
                        <td className="px-5 py-4 font-medium text-on-background max-w-[200px] truncate">
                          {c.procedures?.description || 'Cirurgia Geral'}
                        </td>

                        {/* Coluna 2 solicitada: Fornecedor Indicado */}
                        <td className="px-5 py-4 text-xs font-semibold text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-secondary">local_shipping</span>
                            <span>{c.supplier_indicated || 'OPME Sul Distribuidora'}</span>
                          </div>
                        </td>

                        {/* Coluna 3 solicitada: Fornecedor Autorizado */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getSupplierAuthStyle(c.supplier_authorized)}`}>
                            {c.supplier_authorized || 'Aguardando Regulação'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </span>
                        </td>

                        {/* Data Cirurgia */}
                        <td className="px-5 py-4 text-xs text-on-surface-variant font-medium">
                          {c.proposed_date ? new Date(c.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                        </td>

                        {/* Ações e Comunicação Direta */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Botão de Comunicação Rápida */}
                            <button
                              title="Enviar solicitação à Camila / Suporte Tá Autorizado"
                              onClick={() => openCommModal(c)}
                              className="p-1.5 rounded-lg bg-secondary/10 hover:bg-secondary text-secondary hover:text-on-secondary transition-all flex items-center justify-center text-xs font-semibold"
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                            </button>

                            {/* Botão de Detalhes */}
                            <Link 
                              to={`/medico/caso/${c.id}`}
                              className="inline-flex items-center justify-center text-on-background hover:text-secondary transition-colors p-1.5 rounded-lg hover:bg-surface-container"
                              title="Ver Detalhes do Caso e Follow-up"
                            >
                              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </Link>
                          </div>
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

      {/* Modal de Comunicação e Suporte Direto com a Camila / Tá Autorizado */}
      {communicationModalOpen && selectedCaseForComms && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h3 className="font-title-lg font-black text-on-background">Canal Tá Autorizado</h3>
                  <p className="text-xs text-on-surface-variant">Comunique pedidos ou avisos para a Camila e equipe operacional</p>
                </div>
              </div>
              <button 
                onClick={() => setCommunicationModalOpen(false)}
                className="text-on-surface-variant hover:text-on-background p-1.5 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSendCommunication} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Paciente / Caso Selecionado
                </label>
                <select
                  value={selectedCaseForComms?.id}
                  onChange={(e) => {
                    const found = cases.find(c => c.id === e.target.value)
                    if (found) setSelectedCaseForComms(found)
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs font-bold text-on-background focus:ring-2 focus:ring-secondary"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.patients?.name} • {c.insurance || c.patients?.insurance} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Botões de Ação Rápida solicitados pelo usuário */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Qual é o objetivo do contato?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'call_insurance', icon: 'phone_in_talk', label: 'Pedir p/ Ligar no Convênio' },
                    { id: 'patient_cancel', icon: 'person_cancel', label: 'Paciente quer desistir' },
                    { id: 'priority_review', icon: 'priority_high', label: 'Urgência / Priorizar caso' },
                    { id: 'other', icon: 'edit_note', label: 'Outro recado / Mensagem' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCommType(opt.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs font-semibold ${
                        commType === opt.id
                          ? 'bg-secondary text-on-secondary border-secondary shadow-sm font-bold'
                          : 'bg-surface hover:bg-surface-container text-on-background border-outline-variant/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de Mensagem Adicional */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Detalhes adicionais / Observações para a equipe:
                </label>
                <textarea
                  rows={3}
                  value={customCommMessage}
                  onChange={(e) => setCustomCommMessage(e.target.value)}
                  placeholder={
                    commType === 'call_insurance' ? "Ex: Auditoria está demorando muito, cirurgia precisa ser semana que vem..." :
                    commType === 'patient_cancel' ? "Ex: Paciente informou que não deseja realizar o procedimento este mês..." :
                    "Escreva o que a equipe Tá Autorizado precisa verificar ou providenciar..."
                  }
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-body-md text-on-background focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setCommunicationModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingComm}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold bg-secondary hover:bg-on-background text-on-secondary transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{sendingComm ? 'Enviando...' : 'Enviar para a Equipe Tá Autorizado'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav role="medico" />
    </div>
  )
}

