import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_HOSPITALS = [
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320001', name: 'Hospital Sírio-Libanês' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320002', name: 'Hospital Albert Einstein' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320003', name: 'Clínica São José' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320004', name: 'Hospital Samaritano' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320005', name: 'Hospital Moinhos de Vento' }
]

const OFFLINE_PROCEDURES = [
  { id: 'e3b07384-d113-4b0d-9fae-9d229a320001', code: '30205012', description: 'Cirurgia Ortognática' },
  { id: 'e3b07384-d113-4b0d-9fae-9d229a320002', code: '30725113', description: 'Artroplastia de Joelho' },
  { id: 'e3b07384-d113-4b0d-9fae-9d229a320003', code: '30101292', description: 'Rinoplastia Estruturada' },
  { id: 'e3b07384-d113-4b0d-9fae-9d229a320004', code: '31002390', description: 'Herniorrafia Inguinal' },
  { id: 'e3b07384-d113-4b0d-9fae-9d229a320005', code: '31001016', description: 'Colecistectomia' }
]

export default function NewRequest() {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [procedures, setProcedures] = useState([])
  const [isOffline, setIsOffline] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form Fields
  const [patientName, setPatientName] = useState('')
  const [patientBirth, setPatientBirth] = useState('')
  const [patientCpf, setPatientCpf] = useState('')
  const [insurance, setInsurance] = useState('')
  const [hospitalId, setHospitalId] = useState('')
  const [procedureId, setProcedureId] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [clinicalSummary, setClinicalSummary] = useState('')
  const [files, setFiles] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: hospData, error: hospErr } = await supabase.from('hospitals').select('*')
        const { data: procData, error: procErr } = await supabase.from('procedures').select('*')

        if (hospErr || procErr) throw new Error("Failed to load options")

        setHospitals(hospData || [])
        setProcedures(procData || [])
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando tabelas auxiliares offline:", e.message)
        setHospitals(OFFLINE_HOSPITALS)
        setProcedures(OFFLINE_PROCEDURES)
        setIsOffline(true)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientName || !patientBirth || !patientCpf || !insurance || !hospitalId || !procedureId || !proposedDate) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)
    try {
      if (isOffline) {
        alert("Simulação offline: Caso criado com sucesso!")
        navigate('/medico')
        return
      }

      // 1. Criar ou buscar Paciente
      // Primeiro tentamos ver se o paciente com o CPF já existe
      let { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('cpf', patientCpf)
        .single()

      let patientId = existingPatient?.id

      if (!patientId) {
        const { data: newPatient, error: patientErr } = await supabase
          .from('patients')
          .insert({
            name: patientName,
            birth_date: patientBirth,
            cpf: patientCpf,
            insurance: insurance
          })
          .select('id')
          .single()

        if (patientErr) throw patientErr
        patientId = newPatient.id
      }

      // 2. Criar Caso (Solicitação)
      const { error: caseErr } = await supabase
        .from('cases')
        .insert({
          patient_id: patientId,
          hospital_id: hospitalId,
          procedure_id: procedureId,
          proposed_date: proposedDate,
          clinical_summary: clinicalSummary,
          status: 'Aguardando Orçamento' // Começa pendente de cotação de OPME pelo fornecedor
        })

      if (caseErr) throw caseErr

      navigate('/medico')
    } catch (err) {
      console.error(err)
      alert("Erro ao enviar pedido: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const list = Array.from(e.target.files)
    setFiles([...files, ...list])
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline ativo: o envio será simulado e redirecionado.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-12 pb-32">
          {/* Page Header */}
          <div className="mb-stack-lg">
            <button
              onClick={() => navigate('/medico')}
              className="flex items-center gap-2 text-secondary mb-2 hover:text-on-background transition-colors text-label-md font-semibold"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Voltar para o Painel</span>
            </button>
            <h2 className="font-headline-lg text-headline-lg text-on-background">Novo Pedido Médico</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">
              Preencha os dados abaixo com precisão para iniciar a solicitação de autorização e cotação de materiais.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 overflow-hidden">
            <div className="h-1 w-full bg-surface-container">
              <div className="h-full bg-secondary-container w-1/3 rounded-r-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-stack-lg">
              
              {/* Section 1: Dados do Paciente */}
              <section>
                <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3 mb-stack-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-background">Dados do Paciente</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="nome-completo">Nome Completo *</label>
                    <input 
                      type="text" 
                      id="nome-completo" 
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nome completo do paciente conforme documento" 
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="data-nascimento">Data de Nascimento *</label>
                    <input 
                      type="date" 
                      id="data-nascimento" 
                      required
                      value={patientBirth}
                      onChange={(e) => setPatientBirth(e.target.value)}
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="cpf">CPF *</label>
                    <input 
                      type="text" 
                      id="cpf" 
                      required
                      value={patientCpf}
                      onChange={(e) => setPatientCpf(e.target.value)}
                      placeholder="000.000.000-00" 
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="convenio">Convênio / Operadora *</label>
                    <input 
                      type="text" 
                      id="convenio" 
                      required
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      placeholder="Ex: Bradesco, Amil, SulAmérica" 
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Dados Clínicos */}
              <section>
                <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3 mb-stack-md mt-4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-background">Dados Clínicos</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="hospital">Hospital Previsto *</label>
                    <div className="relative">
                      <select 
                        id="hospital" 
                        required
                        value={hospitalId}
                        onChange={(e) => setHospitalId(e.target.value)}
                        className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all appearance-none"
                      >
                        <option value="">Selecione o hospital</option>
                        {hospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="procedimento">Procedimento *</label>
                    <div className="relative">
                      <select 
                        id="procedimento" 
                        required
                        value={procedureId}
                        onChange={(e) => setProcedureId(e.target.value)}
                        className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all appearance-none"
                      >
                        <option value="">Selecione o procedimento (TUSS)</option>
                        {procedures.map(p => (
                          <option key={p.id} value={p.id}>{p.code} - {p.description}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="data-proposta">Data Proposta da Cirurgia *</label>
                    <input 
                      type="date" 
                      id="data-proposta" 
                      required
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="resumo">Resumo Clínico / Justificativa</label>
                    <textarea 
                      id="resumo" 
                      rows={4}
                      value={clinicalSummary}
                      onChange={(e) => setClinicalSummary(e.target.value)}
                      placeholder="Indique a gravidade do caso, diagnóstico e a necessidade do procedimento..."
                      className="w-full rounded-lg p-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Documentação */}
              <section>
                <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3 mb-stack-md mt-4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-background">Documentação Comprobatória</h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  Anexe os laudos, exames de imagem e a guia de solicitação. (Simulado)
                </p>

                <div className="group relative border-2 border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/50 hover:bg-surface-container hover:border-secondary-container transition-all duration-300 p-8 flex flex-col items-center justify-center text-center cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-secondary-container/20 transition-transform duration-300">
                    <span className="material-symbols-outlined text-secondary text-3xl">cloud_upload</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-background mb-1">Arraste e solte arquivos aqui</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">ou clique para procurar no seu computador</p>
                  <div className="flex gap-2 text-label-md font-label-md text-on-surface-variant/80 bg-surface-container-lowest px-4 py-2 rounded-full shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span> PDF, JPG, PNG (Max 10MB)
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="font-label-md text-label-md text-on-background">Arquivos selecionados:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                          <span className="material-symbols-outlined text-secondary">description</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-md font-semibold truncate text-on-background">{f.name}</p>
                            <p className="text-xs text-on-surface-variant">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Actions Footer */}
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-6 mt-6">
                <button 
                  type="button"
                  onClick={() => navigate('/medico')}
                  className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-background bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-lg font-label-md text-label-md text-on-primary bg-on-background hover:bg-on-background/90 shadow-level-1 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Gerar Pedido Médico'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <BottomNav role="medico" />
    </div>
  )
}
