import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_HOSPITALS_DETAILS = {
  'd3b07384-d113-4b0d-9fae-9d229a320001': {
    id: 'd3b07384-d113-4b0d-9fae-9d229a320001',
    name: 'Hospital Sírio-Libanês',
    cnpj: '61.644.731/0001-32',
    city: 'São Paulo - SP',
    address: 'Rua Dona Adma Jafet, 115 - Bela Vista',
    phone: '(11) 3394-8000',
    auth_phone: '(11) 3394-8200 (Central de Autorizações)',
    email: 'autorizacoes@siriolibanes.org.br',
    beds: 450,
    specialties: ['Ortopedia & Traumatologia', 'Cirurgia Bucomaxilofacial', 'Cirurgia Cardiovascular', 'Oncologia', 'Neurocirurgia'],
    insurances: ['Bradesco Saúde', 'SulAmérica', 'Amil Executivo', 'Omint', 'Care Plus'],
    created_at: '2026-01-15T10:00:00Z',
    cases: [
      {
        id: 'a3b07384-d113-4b0d-9fae-9d229a320001',
        status: 'Em Análise',
        proposed_date: '2026-11-05',
        patients: { name: 'Mariana Santos' },
        procedures: { description: 'Cirurgia Ortognática' }
      }
    ]
  },
  'd3b07384-d113-4b0d-9fae-9d229a320002': {
    id: 'd3b07384-d113-4b0d-9fae-9d229a320002',
    name: 'Hospital Albert Einstein',
    cnpj: '60.765.823/0001-30',
    city: 'São Paulo - SP',
    address: 'Av. Albert Einstein, 627 - Morumbi',
    phone: '(11) 2151-1233',
    auth_phone: '(11) 2151-5000 (Regulação OPME)',
    email: 'opme@einstein.br',
    beds: 620,
    specialties: ['Artroplastia e Próteses', 'Cirurgia Geral', 'Cardiologia', 'Robótica', 'Ortopedia'],
    insurances: ['SulAmérica', 'Bradesco Saúde', 'Porto Seguro', 'Amil One'],
    created_at: '2026-01-18T10:00:00Z',
    cases: [
      {
        id: 'a3b07384-d113-4b0d-9fae-9d229a320002',
        status: 'Autorizado',
        proposed_date: '2026-10-15',
        patients: { name: 'Carlos Oliveira' },
        procedures: { description: 'Artroplastia de Joelho' }
      }
    ]
  },
  'd3b07384-d113-4b0d-9fae-9d229a320003': {
    id: 'd3b07384-d113-4b0d-9fae-9d229a320003',
    name: 'Clínica São José',
    cnpj: '33.542.119/0001-90',
    city: 'Rio de Janeiro - RJ',
    address: 'Rua Macedo Sobrinho, 21 - Humaitá',
    phone: '(21) 2538-7000',
    auth_phone: '(21) 2538-7100',
    email: 'convenios@saojose.com.br',
    beds: 180,
    specialties: ['Otorrinolaringologia', 'Cirurgia Plástica & Reformativa', 'Cirurgia Geral'],
    insurances: ['Amil', 'Bradesco Saúde', 'Golden Cross'],
    created_at: '2026-02-01T10:00:00Z',
    cases: [
      {
        id: 'a3b07384-d113-4b0d-9fae-9d229a320003',
        status: 'Pendente Docs',
        proposed_date: '2026-11-12',
        patients: { name: 'Ana Lúcia Ferreira' },
        procedures: { description: 'Rinoplastia Estruturada' }
      }
    ]
  }
}

export default function HospitalDetails({ role = 'medico' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hospital, setHospital] = useState(null)
  const [hospitalCases, setHospitalCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true)
        // 1. Buscar Hospital
        const { data: hData, error: hErr } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', id)
          .single()

        if (hErr) throw hErr

        // 2. Buscar Casos vinculados a este Hospital
        const { data: cData, error: cErr } = await supabase
          .from('cases')
          .select(`
            id,
            status,
            proposed_date,
            created_at,
            patients ( name ),
            procedures ( description )
          `)
          .eq('hospital_id', id)
          .order('created_at', { ascending: false })

        if (cErr) throw cErr

        setHospital(hData)
        setHospitalCases(cData || [])
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando perfil de hospital offline:", e.message)
        const offlineData = OFFLINE_HOSPITALS_DETAILS[id] || {
          id: id,
          name: 'Hospital Cadastrado',
          cnpj: '00.000.000/0001-00',
          city: 'São Paulo - SP',
          address: 'Endereço não especificado',
          phone: '(11) 3000-0000',
          auth_phone: '(11) 3000-0001 (Autorizações)',
          email: 'contato@hospital.com.br',
          beds: 250,
          specialties: ['Cirurgia Geral', 'Ortopedia', 'Bucomaxilofacial'],
          insurances: ['Bradesco Saúde', 'SulAmérica', 'Amil', 'Unimed'],
          cases: []
        }
        setHospital(offlineData)
        setHospitalCases(offlineData.cases || [])
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchHospitalData()
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-body-md text-on-surface-variant">Carregando perfil do hospital...</span>
        </div>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-margin-mobile">
        <span className="material-symbols-outlined text-4xl text-error mb-2">domain_disabled</span>
        <h3 className="font-title-lg font-bold text-on-background">Hospital não encontrado</h3>
        <button onClick={() => navigate(`/${role}/cadastros`)} className="mt-4 bg-secondary text-on-secondary px-6 py-2 rounded-lg text-label-md">
          Voltar à Lista de Hospitais
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role={role} />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-24 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo de demonstração: Exibindo perfil de hospital cadastrado.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-12">
          
          {/* Back button and Header */}
          <div className="mb-stack-lg">
            <Link 
              to={`/${role}/cadastros`}
              className="inline-flex items-center gap-2 text-secondary hover:text-on-background transition-colors text-label-md font-semibold mb-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Voltar para Rede Credenciada</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-black text-2xl shadow-sm border border-outline-variant/30">
                  <span className="material-symbols-outlined text-3xl">domain</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-lg text-headline-lg text-on-background font-black">
                      {hospital.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                      Credenciado
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    {hospital.city || 'São Paulo - SP'} {hospital.cnpj && `• CNPJ: ${hospital.cnpj}`}
                  </p>
                </div>
              </div>

              {role === 'medico' && (
                <button 
                  onClick={() => navigate('/medico/novo-pedido')}
                  className="bg-secondary text-on-secondary hover:bg-on-background transition-colors px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm shrink-0 font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Novo Pedido para este Hospital</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
            
            {/* Coluna Esquerda: Informações Institucionais e Contato */}
            <div className="col-span-1 flex flex-col gap-gutter">
              
              {/* Card Institucional */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 space-y-4">
                <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">apartment</span>
                  Informações Institucionais
                </h3>

                <div className="space-y-3 text-body-md">
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Razão Social / CNPJ</span>
                    <span className="font-semibold text-on-background">{hospital.cnpj || '61.644.731/0001-32'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Endereço Completo</span>
                    <span className="font-semibold text-on-background">{hospital.address || 'Rua Dona Adma Jafet, 115 - Bela Vista, São Paulo - SP'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Central de Autorizações / OPME</span>
                    <span className="font-semibold text-secondary">{hospital.auth_phone || '(11) 3394-8200'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Recepção Geral</span>
                    <span className="font-semibold text-on-background">{hospital.phone || '(11) 3394-8000'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">E-mail de Regulação</span>
                    <span className="font-semibold text-on-background">{hospital.email || 'autorizacoes@hospital.org.br'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-medium">Capacidade Hospitalar</span>
                    <span className="font-semibold text-on-background">{hospital.beds || 450} leitos cadastrados</span>
                  </div>
                </div>
              </div>

              {/* Convênios Aceitos */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">health_and_safety</span>
                    Convênios Atendidos
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newIns = prompt("Digite o nome do convênio/operadora de saúde:")
                      if (newIns && newIns.trim()) {
                        setHospital(prev => ({
                          ...prev,
                          insurances: [...(prev.insurances || []), newIns.trim()]
                        }))
                      }
                    }}
                    className="text-xs font-bold text-secondary hover:text-on-background transition-colors flex items-center gap-1 bg-surface-container hover:bg-surface-container-high px-2.5 py-1 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Adicionar Convênio
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(hospital.insurances || ['Bradesco Saúde', 'SulAmérica', 'Amil', 'Omint', 'Unimed']).map((ins, idx) => (
                    <span key={idx} className="bg-surface-container px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface border border-outline-variant/20">
                      {ins}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Coluna Direita: Especialidades & Cirurgias Solicitadas */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-gutter">
              
              {/* Card de Especialidades Atendidas */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">medical_services</span>
                    Especialidades e Centros Cirúrgicos
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newSpec = prompt("Digite o nome da nova especialidade médica:")
                      if (newSpec && newSpec.trim()) {
                        setHospital(prev => ({
                          ...prev,
                          specialties: [...(prev.specialties || []), newSpec.trim()]
                        }))
                      }
                    }}
                    className="text-xs font-bold text-secondary hover:text-on-background transition-colors flex items-center gap-1 bg-surface-container hover:bg-surface-container-high px-3 py-1 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Adicionar Especialidade
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(hospital.specialties || ['Ortopedia & Traumatologia', 'Cirurgia Bucomaxilofacial', 'Cirurgia Geral', 'Neurocirurgia', 'Cardio']).map((spec, idx) => (
                    <span key={idx} className="bg-secondary-container text-on-secondary-container px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cirurgias Agendadas / Solicitadas neste Hospital */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                  <div>
                    <h3 className="font-title-lg text-title-lg text-on-background font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[22px]">clinical_notes</span>
                      Cirurgias Solicitadas neste Hospital
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Histórico de autorizações e cirurgias direcionadas a este centro.</p>
                  </div>
                  <span className="text-label-md font-bold bg-surface-container px-3 py-1 rounded-full text-on-background">
                    {hospitalCases.length} {hospitalCases.length === 1 ? 'cirurgia' : 'cirurgias'}
                  </span>
                </div>

                {hospitalCases.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">domain</span>
                    <h4 className="font-title-lg font-bold text-on-background">Nenhuma cirurgia vinculada</h4>
                    <p className="text-body-md text-on-surface-variant mt-1">Ao selecionar este hospital num pedido, ele aparecerá nesta lista.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hospitalCases.map((c) => (
                      <div 
                        key={c.id} 
                        className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-secondary transition-all flex items-center justify-between gap-4"
                      >
                        <div>
                          <span className="font-bold text-on-background block">{c.patients?.name || 'Paciente'}</span>
                          <span className="text-xs text-on-surface-variant">{c.procedures?.description} • Data: {c.proposed_date ? new Date(c.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-secondary border border-secondary-container">
                            {c.status}
                          </span>
                          <Link 
                            to={`/medico/caso/${c.id}`}
                            className="p-2 text-secondary hover:text-on-background rounded-lg hover:bg-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>

      <BottomNav role={role} />
    </div>
  )
}
