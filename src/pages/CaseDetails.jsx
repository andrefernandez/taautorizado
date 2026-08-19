import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_CASES = {
  'a3b07384-d113-4b0d-9fae-9d229a320001': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
    status: 'Em Análise',
    proposed_date: '2026-11-05',
    clinical_summary: 'Paciente apresenta má oclusão esquelética Classe III severa, necessitando de intervenção cirúrgica ortognática bimaxilar para reestabelecer oclusão funcional e aliviar sobrecarga na ATM.',
    patients: { name: 'Mariana Santos', birth_date: '1985-05-14', cpf: '111.111.111-11', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Cirurgia Ortognática', code: '30205012' },
    hospitals: { name: 'Hospital Sírio-Libanês' },
    budget_items: [
      { id: '1', name: 'Placa Ortognática 2.0mm', quantity: 4, value: 1200.00, provider: 'OPME Sul Distribuidora' },
      { id: '2', name: 'Parafuso de Fixação 2.0mm', quantity: 16, value: 150.00, provider: 'OPME Sul Distribuidora' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320002': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
    status: 'Autorizado',
    proposed_date: '2026-10-15',
    clinical_summary: 'Paciente com osteoartrose severa de joelho direito, indicada artroplastia total secundária para alívio de dor limitante e melhora funcional da marcha.',
    patients: { name: 'Carlos Oliveira', birth_date: '1972-08-22', cpf: '222.222.222-22', insurance: 'SulAmérica' },
    procedures: { description: 'Artroplastia de Joelho', code: '30725113' },
    hospitals: { name: 'Hospital Albert Einstein' },
    budget_items: [
      { id: '3', name: 'Prótese Total de Joelho Primária', quantity: 1, value: 8500.00, provider: 'OrtoPrime Hospitalar' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320003': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320003',
    status: 'Pendente Docs',
    proposed_date: '2026-11-12',
    clinical_summary: 'Desvio de septo obstrutivo grave associado a deformidade piramidal nasal pós-traumática.',
    patients: { name: 'Ana Lúcia Ferreira', birth_date: '1990-11-05', cpf: '333.333.333-33', insurance: 'Amil' },
    procedures: { description: 'Rinoplastia Estruturada', code: '30101292' },
    hospitals: { name: 'Clínica São José' },
    budget_items: [
      { id: '4', name: 'Enxerto de Cartilagem / Lâmina Foco', quantity: 1, value: 2100.00, provider: 'MedImplantes Brasil' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320004': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320004',
    status: 'Negado',
    proposed_date: '2026-09-20',
    clinical_summary: 'Hérnia inguinal bilateral com desconforto moderado aos esforços físicos.',
    patients: { name: 'Ricardo Souza', birth_date: '1965-03-30', cpf: '444.444.444-44', insurance: 'Unimed Seguros' },
    procedures: { description: 'Herniorrafia Inguinal', code: '31002390' },
    hospitals: { name: 'Hospital Moinhos de Vento' },
    budget_items: [
      { id: '5', name: 'Tela de Polipropileno 15x15cm', quantity: 2, value: 450.00, provider: 'Surgical Direct' }
    ]
  },
  'a3b07384-d113-4b0d-9fae-9d229a320005': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    clinical_summary: 'Colecistopatia calculosa crônica sintomática. Solicitado kit cirúrgico de videolaparoscopia.',
    patients: { name: 'Fernanda Mendes', birth_date: '1988-02-18', cpf: '555.555.555-55', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Colecistectomia', code: '31001016' },
    hospitals: { name: 'Hospital Samaritano' },
    budget_items: []
  }
}

export default function CaseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('cases')
          .select(`
            id,
            status,
            proposed_date,
            clinical_summary,
            created_at,
            patients ( name, birth_date, cpf, insurance ),
            procedures ( description, code ),
            hospitals ( name ),
            budget_items ( id, name, quantity, value, provider )
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        setItem(data)
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando detalhes offline para o caso:", id)
        const offlineData = OFFLINE_CASES[id] || {
          id: id,
          status: 'Aguardando Orçamento',
          proposed_date: '2026-10-25',
          clinical_summary: 'Caso de teste cirúrgico registrado.',
          patients: { name: 'Paciente Cadastrado', birth_date: '1988-02-18', cpf: '000.000.000-00', insurance: 'Bradesco Saúde' },
          procedures: { description: 'Procedimento Cirúrgico', code: '00000000' },
          hospitals: { name: 'Hospital Geral' },
          budget_items: []
        }
        setItem(offlineData)
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchCaseDetails()
  }, [id])

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      if (!isOffline) {
        const { error } = await supabase
          .from('cases')
          .update({ status: newStatus })
          .eq('id', id)

        if (error) throw error
      }

      setItem(prev => ({ ...prev, status: newStatus }))
      alert(`Status do pedido atualizado para: ${newStatus}!`)
    } catch (e) {
      console.error(e)
      alert("Erro ao atualizar status: " + e.message)
    } finally {
      setUpdatingStatus(false)
    }
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

  const timelineSteps = [
    { label: 'Documentos Recebidos', active: true, desc: 'Guia e exames carregados' },
    { 
      label: 'Cotação de OPME', 
      active: item.status !== 'Aguardando Orçamento', 
      desc: item.status === 'Aguardando Orçamento' ? 'Pendente pelo distribuidor' : 'Orçamento recebido' 
    },
    { 
      label: 'Em Análise', 
      active: ['Em Análise', 'Autorizado', 'Pendente Docs', 'Negado'].includes(item.status), 
      desc: item.status === 'Pendente Docs' ? 'Pendente documentação' : 'Análise técnica da operadora' 
    },
    { 
      label: item.status === 'Negado' ? 'Negado' : 'Autorizado', 
      active: ['Autorizado', 'Negado'].includes(item.status),
      isEnd: true, 
      desc: item.status === 'Autorizado' ? 'Procedimento liberado!' : item.status === 'Negado' ? 'Solicitação negada' : 'Aguardando parecer final' 
    }
  ]

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-24 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Visualizando em modo de demonstração.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-12">
          
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
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  Procedimento: {item.procedures?.description} • Dr. Silva
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold self-start sm:self-auto ${
                item.status === 'Autorizado' ? 'bg-secondary-container text-on-secondary-container' :
                item.status === 'Negado' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-secondary'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
            {/* Left/Middle: Case Details & Documents */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-gutter">
              
              {/* Timeline Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1">
                <h3 className="font-title-lg text-title-lg text-on-background font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">timeline</span>
                  Status da Solicitação
                </h3>
                
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative flex gap-4 items-start">
                      <div className={`absolute -left-6 w-4.5 h-4.5 rounded-full border-4 border-surface-container-lowest flex items-center justify-center z-10 ${
                        step.active ? 'bg-secondary' : 'bg-outline-variant'
                      }`} />
                      <div>
                        <h4 className={`font-semibold text-body-md ${step.active ? 'text-on-background' : 'text-on-surface-variant'}`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
                <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2">
                  Resumo Clínico
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-md">
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">CPF do Paciente</span>
                    <span className="font-semibold text-on-background">{item.patients?.cpf}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Idade</span>
                    <span className="font-semibold text-on-background">{calculateAge(item.patients?.birth_date)} anos</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Operadora / Convênio</span>
                    <span className="font-semibold text-on-background">{item.patients?.insurance}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Data Proposta</span>
                    <span className="font-semibold text-on-background">
                      {item.proposed_date ? new Date(item.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <span className="block text-xs text-on-surface-variant font-medium mb-1">Diagnóstico e Detalhes Clínicos</span>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {item.clinical_summary || 'Nenhum detalhe clínico informado.'}
                  </p>
                </div>
              </div>

              {/* Budget Details (if supplier has proposed one) */}
              {item.budget_items && item.budget_items.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">request_quote</span>
                      Orçamento Comercial (OPME)
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

                  {/* Actions for Doctor/Insurance Approval */}
                  <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-on-background block">Aprovação do Orçamento</span>
                      <p className="text-[11px] text-on-surface-variant">Aprovar valores informados pela distribuidora e liberar para a operadora.</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {item.status !== 'Autorizado' ? (
                        <button
                          type="button"
                          disabled={updatingStatus}
                          onClick={() => handleUpdateStatus('Autorizado')}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Aprovar Cotação
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          Cotação Aprovada & Autorizada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Documents */}
            <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
              <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">folder_open</span>
                Documentos
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Guia de Solicitação Cirúrgica.pdf', size: '1.2 MB', date: 'Oct 12' },
                  { name: 'Laudo de Justificativa Clínica.pdf', size: '0.8 MB', date: 'Oct 14' },
                  { name: 'Exame de Imagem Recomendado.png', size: '4.5 MB', date: 'Oct 12' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 hover:border-secondary transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-secondary shrink-0">description</span>
                      <div className="min-w-0">
                        <p className="text-body-md font-semibold truncate text-on-background pr-1">{doc.name}</p>
                        <p className="text-xs text-on-surface-variant">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <button className="text-secondary hover:text-on-background p-1.5 rounded-md hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav role="medico" />
    </div>
  )
}
