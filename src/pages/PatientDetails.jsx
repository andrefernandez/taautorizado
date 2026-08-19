import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPatientById } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_PATIENT_DETAILS = {
  'f3b07384-d113-4b0d-9fae-9d229a320001': {
    id: 'f3b07384-d113-4b0d-9fae-9d229a320001',
    name: 'Mariana Santos',
    birth_date: '1985-05-14',
    cpf: '111.111.111-11',
    insurance: 'Bradesco Saúde',
    insurance_card_number: '8492.0192.3847.1009',
    insurance_plan_type: 'Top Nacional Executivo (Apartamento)',
    accommodation: 'Apartamento Individual',
    phone: '(11) 98765-4321',
    email: 'mariana.santos@email.com',
    created_at: '2026-01-10T10:00:00Z',
    cases: [
      {
        id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
        status: 'Em Análise',
        proposed_date: '2026-11-05',
        procedures: { description: 'Cirurgia Ortognática', code: '30205012' },
        hospitals: { name: 'Hospital Sírio-Libanês' },
        created_at: '2026-08-15T14:30:00Z'
      }
    ]
  },
  'f3b07384-d113-4b0d-9fae-9d229a320002': {
    id: 'f3b07384-d113-4b0d-9fae-9d229a320002',
    name: 'Carlos Oliveira',
    birth_date: '1972-08-22',
    cpf: '222.222.222-22',
    insurance: 'SulAmérica',
    insurance_card_number: '7482.9910.2234.0019',
    insurance_plan_type: 'Especial 500 (Enfermaria)',
    accommodation: 'Enfermaria',
    phone: '(11) 97123-8899',
    email: 'carlos.oliveira@email.com',
    created_at: '2026-02-14T09:00:00Z',
    cases: [
      {
        id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
        status: 'Autorizado',
        proposed_date: '2026-10-15',
        procedures: { description: 'Artroplastia de Joelho', code: '30725113' },
        hospitals: { name: 'Hospital Albert Einstein' },
        created_at: '2026-08-10T11:00:00Z'
      }
    ]
  }
}

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [patientCases, setPatientCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true)
        const { patient: pData, cases: cData } = await getPatientById(id)
        setPatient(pData)
        setPatientCases(cData || [])
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando perfil de paciente offline:", e.message)
        const offlineData = OFFLINE_PATIENT_DETAILS[id] || {
          id: id,
          name: 'Paciente Não Encontrado',
          birth_date: '1990-01-01',
          cpf: '000.000.000-00',
          insurance: 'Convênio Padrão',
          insurance_card_number: '0000.0000.0000.0000',
          insurance_plan_type: 'Plano Básico',
          accommodation: 'Apartamento',
          phone: '(11) 90000-0000',
          email: 'contato@paciente.com',
          cases: []
        }
        setPatient(offlineData)
        setPatientCases(offlineData.cases || [])
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPatientData()
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-body-md text-on-surface-variant">Carregando prontuário do paciente...</span>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-margin-mobile">
        <span className="material-symbols-outlined text-4xl text-error mb-2">person_off</span>
        <h3 className="font-title-lg font-bold text-on-background">Paciente não encontrado</h3>
        <button onClick={() => navigate('/medico/pacientes')} className="mt-4 bg-secondary text-on-secondary px-6 py-2 rounded-lg text-label-md">
          Voltar à Lista de Pacientes
        </button>
      </div>
    )
  }

  const calculateAge = (dobString) => {
    if (!dobString) return ''
    const birth = new Date(dobString)
    const diff = Date.now() - birth.getTime()
    const ageDate = new Date(diff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }

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
        return 'bg-amber-100 text-amber-900 border border-amber-200'
    }
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-24 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline: Exibindo prontuário de paciente simulado.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-12">
          
          {/* Header & Back Button */}
          <div className="mb-stack-lg">
            <Link 
              to="/medico/pacientes"
              className="inline-flex items-center gap-2 text-secondary hover:text-on-background transition-colors text-label-md font-semibold mb-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Voltar para Lista de Pacientes</span>
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-black text-xl shadow-sm border border-outline-variant/30">
                  {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-background font-black">
                    {patient.name}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    CPF: {patient.cpf} • {calculateAge(patient.birth_date)} anos ({patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '-'})
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/medico/novo-pedido')}
                className="bg-secondary text-on-secondary hover:bg-on-background transition-colors px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nova Solicitação Cirúrgica</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
            
            {/* Coluna Esquerda: Cartão do Convenio e Dados do Paciente */}
            <div className="col-span-1 flex flex-col gap-gutter">
              
              {/* Digital Health Insurance Card */}
              <div className="bg-gradient-to-br from-surface-container-highest via-surface-container-high to-surface-container rounded-2xl p-6 shadow-level-2 border border-outline-variant/40 relative overflow-hidden text-on-background">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Plano de Saúde</span>
                    <h3 className="text-xl font-black text-on-background">{patient.insurance}</h3>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-3xl">medical_information</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">Número da Carteirinha</span>
                    <span className="font-mono text-lg font-bold tracking-widest text-on-background">
                      {patient.insurance_card_number || '8492.0192.3847.1009'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-on-surface-variant block">Tipo do Plano</span>
                      <span className="font-semibold text-on-background truncate block">
                        {patient.insurance_plan_type || 'Executivo Especial'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-on-surface-variant block">Acomodação</span>
                      <span className="font-semibold text-on-background truncate block">
                        {patient.accommodation || 'Apartamento'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Cobertura Ativa
                  </span>
                  <span className="text-on-surface-variant font-medium">Carência Cumprida</span>
                </div>
              </div>

              {/* Informações de Contato e Pessoais */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 space-y-4">
                <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">contacts</span>
                  Dados de Contato
                </h3>

                <div className="space-y-3 text-body-md">
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Telefone / WhatsApp</span>
                    <span className="font-semibold text-on-background">{patient.phone || '(11) 98765-4321'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">E-mail</span>
                    <span className="font-semibold text-on-background">{patient.email || 'paciente@email.com'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Data de Cadastro</span>
                    <span className="font-semibold text-on-background">
                      {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : '10/01/2026'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna Direita: Histórico Completo de Pedidos Cirúrgicos */}
            <div className="col-span-1 lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">history_edu</span>
                    Histórico de Solicitações Cirúrgicas
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Cirurgias e autorizações vinculadas a este paciente.</p>
                </div>
                <span className="text-label-md font-bold bg-surface-container px-3 py-1 rounded-full text-on-background">
                  {patientCases.length} {patientCases.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>

              {patientCases.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">folder_open</span>
                  <h4 className="font-title-lg font-bold text-on-background">Nenhum pedido encontrado</h4>
                  <p className="text-body-md text-on-surface-variant mt-1">Este paciente ainda não possui solicitações cirúrgicas cadastradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientCases.map((c) => (
                    <div 
                      key={c.id} 
                      className="p-5 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-secondary transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium">
                            Solicitado em {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : 'Data não informada'}
                          </span>
                        </div>
                        <h4 className="font-title-lg font-bold text-on-background group-hover:text-secondary transition-colors">
                          {c.procedures?.description || 'Procedimento não especificado'}
                        </h4>
                        <p className="text-body-md text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">domain</span>
                          {c.hospitals?.name || 'Hospital não especificado'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right hidden sm:block">
                          <span className="block text-[10px] uppercase font-bold text-on-surface-variant">Data Proposta</span>
                          <span className="text-xs font-semibold text-on-background">
                            {c.proposed_date ? new Date(c.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                          </span>
                        </div>
                        <Link
                          to={`/medico/caso/${c.id}`}
                          className="bg-secondary text-on-secondary hover:bg-on-background px-4 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          Ver Detalhes
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      </main>

      <BottomNav role="medico" />
    </div>
  )
}
