import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getCaseById } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_CASES = {
  'a3b07384-d113-4b0d-9fae-9d229a320001': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    status: 'Em Análise',
    proposed_date: '2026-11-05',
    insurance: 'Bradesco Saúde',
    supplier_indicated: 'OPME Sul Distribuidora',
    supplier_authorized: 'Aguardando Regulação',
    clinical_summary: 'Paciente apresenta má oclusão esquelética Classe III severa, necessitando de intervenção cirúrgica ortognática bimaxilar para reestabelecer oclusão funcional e aliviar sobrecarga na ATM.',
    patients: { name: 'Mariana Santos', birth_date: '1985-05-14', cpf: '111.111.111-11', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Cirurgia Ortognática', code: '30205012' },
    hospitals: { name: 'Hospital Sírio-Libanês' },
    follow_ups: [
      {
        id: '1',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '20/08/2026 às 14:35',
        type: 'call',
        title: 'Ligação e Cobrança no Convênio Bradesco',
        content: 'Protocolo nº 99401202 gerado. Contatamos o setor de auditoria médica e cobramos celeridade pois a data cirúrgica está próxima. O auditor prometeu parecer em 48h úteis.',
        badge: 'Em Auditoria'
      },
      {
        id: '2',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '19/08/2026 às 11:10',
        type: 'doc',
        title: 'Envio dos Laudos Complementares e Imagens',
        content: 'Conferimos os cortes tomográficos e o laudo assinado pelo Dr. Silva e submetemos no portal do convênio com sucesso.',
        badge: 'Docs Entregues'
      }
    ],
    budget_items: [
      { id: '1', name: 'Placa Ortognática 2.0mm', quantity: 4, value: 1200.00, provider: 'OPME Sul Distribuidora' },
      { id: '2', name: 'Parafuso de Fixação 2.0mm', quantity: 16, value: 150.00, provider: 'OPME Sul Distribuidora' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320002': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    status: 'Autorizado',
    proposed_date: '2026-10-15',
    insurance: 'SulAmérica',
    supplier_indicated: 'OrtoPrime Hospitalar',
    supplier_authorized: 'OrtoPrime Hospitalar',
    clinical_summary: 'Paciente com osteoartrose severa de joelho direito, indicada artroplastia total secundária para alívio de dor limitante e melhora funcional da marcha.',
    patients: { name: 'Carlos Oliveira', birth_date: '1972-08-22', cpf: '222.222.222-22', insurance: 'SulAmérica' },
    procedures: { description: 'Artroplastia de Joelho', code: '30725113' },
    hospitals: { name: 'Hospital Albert Einstein' },
    follow_ups: [
      {
        id: '1',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '19/08/2026 às 16:20',
        type: 'success',
        title: 'Autorização Concluída & Emitida',
        content: 'Guia de autorização nº SA-849102 liberada com 100% dos materiais da OrtoPrime aprovados. Cirurgia confirmada para 15/10/2026.',
        badge: '100% Autorizado'
      }
    ],
    budget_items: [
      { id: '3', name: 'Prótese Total de Joelho Primária', quantity: 1, value: 8500.00, provider: 'OrtoPrime Hospitalar' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320003': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320003',
    status: 'Pendente Docs',
    proposed_date: '2026-11-12',
    insurance: 'Amil',
    supplier_indicated: 'MedImplantes Brasil',
    supplier_authorized: 'Aguardando Docs',
    clinical_summary: 'Desvio de septo obstrutivo grave associado a deformidade piramidal nasal pós-traumática.',
    patients: { name: 'Ana Lúcia Ferreira', birth_date: '1990-11-05', cpf: '333.333.333-33', insurance: 'Amil' },
    procedures: { description: 'Rinoplastia Estruturada', code: '30101292' },
    hospitals: { name: 'Clínica São José' },
    follow_ups: [
      {
        id: '1',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '18/08/2026 às 14:00',
        type: 'warning',
        title: 'Pendência Solicitada pela Auditoria Amil',
        content: 'A auditoria médica do convênio solicitou exame de tomografia computadorizada com laudo descritivo detalhando o desvio obstrutivo.',
        badge: 'Pendente Exame'
      }
    ],
    budget_items: [
      { id: '4', name: 'Enxerto de Cartilagem / Lâmina Foco', quantity: 1, value: 2100.00, provider: 'MedImplantes Brasil' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320004': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320004',
    status: 'Negado',
    proposed_date: '2026-09-20',
    insurance: 'Unimed Seguros',
    supplier_indicated: 'Surgical Direct',
    supplier_authorized: 'Não Autorizado',
    clinical_summary: 'Hérnia inguinal bilateral com desconforto moderado aos esforços físicos.',
    patients: { name: 'Ricardo Souza', birth_date: '1965-03-30', cpf: '444.444.444-44', insurance: 'Unimed Seguros' },
    procedures: { description: 'Herniorrafia Inguinal', code: '31002390' },
    hospitals: { name: 'Hospital Moinhos de Vento' },
    follow_ups: [
      {
        id: '1',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '15/08/2026 às 09:30',
        type: 'error',
        title: 'Negativa de Cobertura da Operadora',
        content: 'Motivo: Carência para doenças pré-existentes alegada pela Unimed. Nossa equipe jurídica/médica já está preparando a contestação formal.',
        badge: 'Recurso em Aberto'
      }
    ],
    budget_items: [
      { id: '5', name: 'Tela de Polipropileno 15x15cm', quantity: 2, value: 450.00, provider: 'Surgical Direct' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320005': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    insurance: 'Bradesco Saúde',
    supplier_indicated: 'OPME Sul Distribuidora',
    supplier_authorized: 'Pendente Cotação',
    clinical_summary: 'Colecistopatia calculosa crônica sintomática. Solicitado kit cirúrgico de videolaparoscopia.',
    patients: { name: 'Fernanda Mendes', birth_date: '1988-02-18', cpf: '555.555.555-55', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Colecistectomia', code: '31001016' },
    hospitals: { name: 'Hospital Samaritano' },
    follow_ups: [
      {
        id: '1',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '17/08/2026 às 15:10',
        type: 'info',
        title: 'Cotações Solicitadas aos Distribuidores',
        content: 'Caso disparado para os fornecedores de OPME credenciados. Aguardando inserção dos preços e marcas dos grampeadores/trocartes.',
        badge: 'Cotação Aberta'
      }
    ],
    budget_items: []
  }
}

export default function CaseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable Form States
  const [status, setStatus] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [clinicalSummary, setClinicalSummary] = useState('')
  const [supplierIndicated, setSupplierIndicated] = useState('')
  const [supplierAuthorized, setSupplierAuthorized] = useState('')

  // Follow-up notes list & new note creation
  const [followUps, setFollowUps] = useState([])
  const [newFollowUpNote, setNewFollowUpNote] = useState('')
  const [newFollowUpTitle, setNewFollowUpTitle] = useState('')
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false)

  // Quick Support message by Doctor
  const [quickCommOpen, setQuickCommOpen] = useState(false)
  const [quickActionType, setQuickActionType] = useState('call_insurance')
  const [quickActionDetails, setQuickActionDetails] = useState('')
  const [commFeedback, setCommFeedback] = useState('')

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true)
        const data = await getCaseById(id)
        setItem(data)
        setStatus(data.status || 'Em Análise')
        setProposedDate(data.proposed_date ? data.proposed_date.split('T')[0] : '')
        setClinicalSummary(data.clinical_summary || '')
        setSupplierIndicated(data.supplier_indicated || 'OPME Sul Distribuidora')
        setSupplierAuthorized(data.supplier_authorized || 'Aguardando Regulação')
        setFollowUps(data.follow_ups || [])
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando detalhes offline para o caso:", id)
        const offlineData = OFFLINE_CASES[id] || {
          id: id,
          status: 'Aguardando Orçamento',
          proposed_date: '2026-10-25',
          insurance: 'Bradesco Saúde',
          supplier_indicated: 'OPME Sul Distribuidora',
          supplier_authorized: 'Aguardando Regulação',
          clinical_summary: 'Caso de teste cirúrgico registrado.',
          patients: { name: 'Paciente Cadastrado', birth_date: '1988-02-18', cpf: '000.000.000-00', insurance: 'Bradesco Saúde' },
          procedures: { description: 'Procedimento Cirúrgico', code: '00000000' },
          hospitals: { name: 'Hospital Geral' },
          follow_ups: [
            {
              id: '1',
              author: 'Camila (Equipe Tá Autorizado)',
              date: '20/08/2026 às 10:00',
              type: 'info',
              title: 'Caso Recepcionado pela Equipe',
              content: 'Documentos e exames cadastrados. Iniciando procedimentos regulatórios.',
              badge: 'Início'
            }
          ],
          budget_items: []
        }
        setItem(offlineData)
        setStatus(offlineData.status || 'Em Análise')
        setProposedDate(offlineData.proposed_date ? offlineData.proposed_date.split('T')[0] : '')
        setClinicalSummary(offlineData.clinical_summary || '')
        setSupplierIndicated(offlineData.supplier_indicated || 'OPME Sul Distribuidora')
        setSupplierAuthorized(offlineData.supplier_authorized || 'Aguardando Regulação')
        setFollowUps(offlineData.follow_ups || [])
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchCaseDetails()
  }, [id])

  const isDirty = item && (
    status !== (item.status || '') ||
    proposedDate !== (item.proposed_date ? item.proposed_date.split('T')[0] : '') ||
    clinicalSummary !== (item.clinical_summary || '') ||
    supplierIndicated !== (item.supplier_indicated || '') ||
    supplierAuthorized !== (item.supplier_authorized || '')
  )

  const handleSave = async () => {
    if (!item) return
    try {
      setSaving(true)
      if (!isOffline) {
        const { error } = await supabase
          .from('cases')
          .update({
            status: status,
            proposed_date: proposedDate || null,
            clinical_summary: clinicalSummary,
            supplier_indicated: supplierIndicated,
            supplier_authorized: supplierAuthorized
          })
          .eq('id', id)

        if (error) throw error
      }

      setItem(prev => ({
        ...prev,
        status: status,
        proposed_date: proposedDate || null,
        clinical_summary: clinicalSummary,
        supplier_indicated: supplierIndicated,
        supplier_authorized: supplierAuthorized
      }))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar alterações: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Add Follow-up Note by Camila / Team
  const handleAddFollowUp = (e) => {
    e.preventDefault()
    if (!newFollowUpNote) return

    const newEntry = {
      id: Date.now().toString(),
      author: 'Camila (Equipe Tá Autorizado)',
      date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'info',
      title: newFollowUpTitle || 'Atualização Operacional',
      content: newFollowUpNote,
      badge: 'Novo Follow-up'
    }

    setFollowUps([newEntry, ...followUps])
    setNewFollowUpTitle('')
    setNewFollowUpNote('')
    setIsAddingFollowUp(false)
  }

  // Doctor Quick Support Communication Handler
  const handleSendQuickCommunication = (e) => {
    e.preventDefault()
    const actionLabels = {
      call_insurance: '📞 Solicitação: Ligar no convênio com urgência',
      patient_cancel: '⚠️ Paciente quer desistir / reagendar',
      priority_review: '⚡ Cobrar retorno prioritário de auditoria',
      other: '💬 Mensagem do Cirurgião'
    }

    const newFollowUpFromDoctor = {
      id: Date.now().toString(),
      author: 'Dr. Silva (Cirurgião Solicitante)',
      date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'warning',
      title: actionLabels[quickActionType] || 'Chamado do Médico',
      content: quickActionDetails || actionLabels[quickActionType],
      badge: 'Chamado Aberto'
    }

    setFollowUps([newFollowUpFromDoctor, ...followUps])
    setCommFeedback('Sua solicitação foi repassada para a Camila e registrada no histórico!')
    setQuickCommOpen(false)
    setQuickActionDetails('')
    setTimeout(() => setCommFeedback(''), 5000)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-body-md text-on-surface-variant">Carregando detalhes do caso...</span>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-margin-mobile">
        <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
        <h3 className="font-title-lg font-bold text-on-background">Caso não encontrado</h3>
        <button onClick={() => navigate('/medico')} className="mt-4 bg-secondary text-on-secondary px-6 py-2 rounded-lg text-label-md">
          Voltar ao Painel
        </button>
      </div>
    )
  }

  const budgetTotal = item.budget_items?.reduce((sum, i) => sum + (Number(i.value) * i.quantity), 0) || 0

  const calculateAge = (dobString) => {
    if (!dobString) return ''
    const birth = new Date(dobString)
    const diff = Date.now() - birth.getTime()
    const ageDate = new Date(diff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-24 md:pb-0">
        
        {commFeedback && (
          <div className="bg-secondary text-on-secondary px-4 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg sticky top-0 z-50 animate-bounce">
            <span className="material-symbols-outlined text-lg">mark_email_read</span>
            {commFeedback}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 animate-bounce">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Alterações salvas com sucesso no banco de dados!
          </div>
        )}

        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Visualizando em modo de demonstração.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-10">
          
          {/* Header */}
          <div className="mb-stack-lg flex flex-col gap-2">
            <Link 
              to="/medico/pedidos"
              className="inline-flex items-center gap-2 text-secondary hover:text-on-background transition-colors text-label-md font-semibold"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Voltar para Lista de Solicitações</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-background font-black truncate max-w-xl">
                  {item.patients?.name || 'Caso Clínico'}
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-0.5">
                  Procedimento: {item.procedures?.description} • Dr. Silva
                </p>
              </div>
              
              {/* Status Selector + Salvar Button in Header */}
              <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setQuickCommOpen(true)}
                  className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-on-secondary px-4 py-2.5 rounded-xl font-label-md text-xs font-bold flex items-center gap-2 border border-secondary/30 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                  <span>Falar com Camila / Suporte</span>
                </button>

                <div className="flex items-center gap-2 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant/40 shadow-sm">
                  <span className="text-xs font-bold text-on-surface-variant pl-2">Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`font-bold text-xs rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-secondary cursor-pointer transition-all ${
                      status === 'Autorizado' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      status === 'Em Análise' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      status === 'Pendente Docs' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      status === 'Negado' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                      'bg-purple-100 text-purple-900 border border-purple-300'
                    }`}
                  >
                    <option value="Em Análise">⏳ Em Análise</option>
                    <option value="Autorizado">✅ Autorizado</option>
                    <option value="Pendente Docs">⚠️ Pendente Docs</option>
                    <option value="Aguardando Orçamento">💬 Aguardando Orçamento</option>
                    <option value="Negado">❌ Negado</option>
                  </select>
                </div>

                {/* Prominent Save Button */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className={`px-5 py-2.5 rounded-xl font-label-md text-label-md font-bold flex items-center gap-2 transition-all shadow-sm ${
                    isDirty 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md scale-105 animate-pulse' 
                      : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {saving ? 'sync' : 'save'}
                  </span>
                  <span>{saving ? 'Salvando...' : isDirty ? 'Salvar Alterações' : 'Salvo'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
            
            {/* Left/Middle: Summary + Follow-up da Camila + Budget */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-gutter">
              
              {/* Key Details Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">assignment</span>
                    Informações do Pedido & Convênio
                  </h3>
                  {isDirty && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                      Alterações não salvas
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-body-md">
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">CPF do Paciente</span>
                    <span className="font-semibold text-on-background">{item.patients?.cpf || '000.000.000-00'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Idade</span>
                    <span className="font-semibold text-on-background">{calculateAge(item.patients?.birth_date)} anos</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Operadora / Convênio</span>
                    <span className="font-semibold text-on-background flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-sm">health_and_safety</span>
                      {item.insurance || item.patients?.insurance || 'Bradesco Saúde'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Hospital Previsto</span>
                    <span className="font-semibold text-on-background">{item.hospitals?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Fornecedor Indicado</span>
                    <span className="font-semibold text-on-background text-xs">{supplierIndicated}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Fornecedor Autorizado</span>
                    <span className="font-semibold text-on-background text-xs">{supplierAuthorized}</span>
                  </div>
                </div>

                <div className="mt-2 pt-3 border-t border-outline-variant/20">
                  <label className="block text-xs text-on-surface-variant font-medium mb-1">
                    Diagnóstico e Justificativa Clínica
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalSummary}
                    onChange={(e) => setClinicalSummary(e.target.value)}
                    placeholder="Descreva a indicação cirúrgica..."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 text-body-md text-on-background focus:ring-2 focus:ring-secondary leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* SEÇÃO PRINCIPAL SOLICITADA: Follow-up da Camila (Operação Tá Autorizado) */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
                  <div>
                    <h3 className="font-title-lg text-title-lg text-on-background font-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                      Follow-up Operacional (Acompanhamento da Camila)
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Registro de contatos com a operadora, ligações, protocolos e andamento regulatório.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingFollowUp(!isAddingFollowUp)}
                    className="bg-surface-container hover:bg-surface-container-high text-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm">{isAddingFollowUp ? 'close' : 'add'}</span>
                    <span>{isAddingFollowUp ? 'Fechar' : 'Adicionar Nota de Follow-up'}</span>
                  </button>
                </div>

                {/* Form to Add New Follow-up Note */}
                {isAddingFollowUp && (
                  <form onSubmit={handleAddFollowUp} className="bg-surface-container-low p-4 rounded-xl border border-secondary/30 flex flex-col gap-3 animate-fade-in">
                    <h4 className="text-xs font-bold text-on-background flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-sm">edit_note</span>
                      Nova Atualização de Follow-up (Camila / Operação Tá Autorizado)
                    </h4>
                    <input
                      type="text"
                      placeholder="Título da ação (Ex: Contato telefônico com auditor, cobrança de prazo, etc.)"
                      value={newFollowUpTitle}
                      onChange={(e) => setNewFollowUpTitle(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-background"
                    />
                    <textarea
                      rows={2}
                      required
                      placeholder="Detalhes do andamento, número de protocolo, resposta do convênio..."
                      value={newFollowUpNote}
                      onChange={(e) => setNewFollowUpNote(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-xs text-on-background"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingFollowUp(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-secondary text-on-secondary px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-on-background transition-colors"
                      >
                        Publicar Atualização
                      </button>
                    </div>
                  </form>
                )}

                {/* Follow-up Timeline Items */}
                {followUps.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-1">history</span>
                    <p className="text-xs text-on-surface-variant">Nenhum follow-up registrado ainda pela equipe de regulação.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followUps.map((fu, idx) => (
                      <div 
                        key={fu.id || idx}
                        className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col gap-2 hover:border-secondary/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-base">
                              {fu.type === 'call' ? 'phone_in_talk' : fu.type === 'doc' ? 'description' : fu.type === 'warning' ? 'warning' : fu.type === 'success' ? 'check_circle' : 'chat'}
                            </span>
                            <h4 className="font-bold text-sm text-on-background">{fu.title || 'Acompanhamento'}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {fu.badge && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                                {fu.badge}
                              </span>
                            )}
                            <span className="text-[11px] text-on-surface-variant font-medium">{fu.date}</span>
                          </div>
                        </div>

                        <p className="text-xs text-on-background leading-relaxed pl-6">
                          {fu.content}
                        </p>

                        <div className="text-[11px] text-on-surface-variant font-semibold pl-6 pt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-secondary">person</span>
                          <span>{fu.author || 'Camila (Equipe Tá Autorizado)'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Commercial Budget Details */}
              {item.budget_items && item.budget_items.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">request_quote</span>
                      Orçamento Comercial de Materiais (OPME)
                    </h3>
                    <span className="text-body-lg font-black text-secondary">
                      R$ {budgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="divide-y divide-outline-variant/20">
                    {item.budget_items.map((b) => (
                      <div key={b.id} className="py-3 flex justify-between items-center text-body-md">
                        <div>
                          <span className="font-semibold text-on-background block">{b.name}</span>
                          <span className="text-xs text-on-surface-variant">{b.provider} • Qtd: {b.quantity}</span>
                        </div>
                        <span className="font-semibold text-on-background">
                          R$ {(b.value * b.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Side: Documentos Identificados */}
            <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
              <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">folder_open</span>
                Documentos Identificados
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'RG_CPF_Paciente.pdf', cat: 'RG / CPF', size: '1.1 MB', date: 'Anexado' },
                  { name: 'Carteirinha_Convenio.png', cat: 'Carteirinha', size: '0.9 MB', date: 'Anexado' },
                  { name: 'Exame_Tomografia_Imagens.zip', cat: 'Exames de Imagens', size: '14.2 MB', date: 'Anexado' },
                  { name: 'Laudo_Medico_Justificativa.pdf', cat: 'Laudo Médico', size: '0.8 MB', date: 'Anexado' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 hover:border-secondary transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-secondary shrink-0">description</span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-secondary uppercase block">{doc.cat}</span>
                        <p className="text-body-md font-semibold truncate text-on-background pr-1">{doc.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <button className="text-secondary hover:text-on-background p-1.5 rounded-md hover:bg-surface-container-high transition-colors" title="Download do arquivo">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Box de Ação Rápida de Suporte */}
              <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-secondary/20 flex flex-col gap-2">
                <span className="text-xs font-bold text-on-background flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">help</span>
                  Precisa de apoio neste caso?
                </span>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Envie uma mensagem instantânea para a Camila verificar com o convênio ou agilizar a auditoria.
                </p>
                <button
                  type="button"
                  onClick={() => setQuickCommOpen(true)}
                  className="mt-1 w-full py-2 rounded-lg bg-secondary text-on-secondary hover:bg-on-background font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Solicitar Ação da Operação
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal de Comunicação Rápida do Cirurgião */}
      {quickCommOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                <h3 className="font-bold text-base text-on-background">Falar com a Camila sobre este caso</h3>
              </div>
              <button onClick={() => setQuickCommOpen(false)} className="text-on-surface-variant hover:text-on-background">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSendQuickCommunication} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Qual ação deseja solicitar?</label>
                <div className="space-y-2">
                  {[
                    { id: 'call_insurance', icon: 'phone_in_talk', label: 'Pedir que liguem no convênio com urgência' },
                    { id: 'patient_cancel', icon: 'person_cancel', label: 'Paciente quer desistir / reagendar' },
                    { id: 'priority_review', icon: 'priority_high', label: 'Pedir que alguém revise o caso hoje' },
                    { id: 'other', icon: 'edit_note', label: 'Outro recado / Mensagem aberta' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setQuickActionType(opt.id)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs flex items-center gap-2 transition-all ${
                        quickActionType === opt.id
                          ? 'bg-secondary text-on-secondary border-secondary font-bold'
                          : 'bg-surface hover:bg-surface-container text-on-background border-outline-variant/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Observações ou detalhes:</label>
                <textarea
                  rows={3}
                  value={quickActionDetails}
                  onChange={(e) => setQuickActionDetails(e.target.value)}
                  placeholder="Explique o motivo do pedido..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-background resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setQuickCommOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-on-secondary px-5 py-2 rounded-lg text-xs font-bold hover:bg-on-background transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Enviar para a Camila
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

