import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getHospitals, getProcedures } from '../services/dataService'
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

const KNOWN_SUPPLIERS = [
  'OPME Sul Distribuidora',
  'OrtoPrime Hospitalar',
  'MedImplantes Brasil',
  'Surgical Direct',
  'Biomateriais Avançados',
  'Outro (Especificar)'
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
  const [supplierIndicated, setSupplierIndicated] = useState('OPME Sul Distribuidora')
  const [customSupplier, setCustomSupplier] = useState('')

  // Categorized File Uploads (4 Mandatory + 1 Optional)
  const [uploadedFiles, setUploadedFiles] = useState({
    rg_cpf: null,          // Obrigatório *
    carteirinha: null,     // Obrigatório *
    imagens: null,         // Obrigatório *
    laudo: null,           // Obrigatório *
    complementar: null     // Opcional
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospData, procData] = await Promise.all([
          getHospitals(),
          getProcedures()
        ])

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

  const handleFileUpload = (category, e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [category]: file
      }))
    }
  }

  const handleRemoveFile = (category) => {
    setUploadedFiles(prev => ({
      ...prev,
      [category]: null
    }))
  }

  // Check mandatory files
  const hasMandatoryFiles = Boolean(
    uploadedFiles.rg_cpf && 
    uploadedFiles.carteirinha && 
    uploadedFiles.imagens && 
    uploadedFiles.laudo
  )

  const missingDocsList = []
  if (!uploadedFiles.rg_cpf) missingDocsList.push('RG / CPF do Paciente')
  if (!uploadedFiles.carteirinha) missingDocsList.push('Carteirinha do Convênio')
  if (!uploadedFiles.imagens) missingDocsList.push('Exames de Imagens')
  if (!uploadedFiles.laudo) missingDocsList.push('Laudo Médico / Justificativa')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!patientName || !patientBirth || !patientCpf || !insurance || !hospitalId || !procedureId || !proposedDate) {
      alert("Por favor, preencha todos os campos obrigatórios dos dados clínicos e do paciente.")
      return
    }

    if (!hasMandatoryFiles) {
      alert(`Para protocolar o pedido, é obrigatório anexar todos os documentos exigidos:\n- ${missingDocsList.join('\n- ')}`)
      return
    }

    setLoading(true)
    try {
      const chosenSupplier = supplierIndicated === 'Outro (Especificar)' ? customSupplier : supplierIndicated

      if (isOffline) {
        alert("Pedido médico criado com sucesso com todos os documentos identificados e anexados!")
        navigate('/medico')
        return
      }

      // 1. Criar ou buscar Paciente
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
          insurance: insurance,
          supplier_indicated: chosenSupplier || 'OPME Sul Distribuidora',
          status: 'Aguardando Orçamento'
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

  const documentSlots = [
    {
      key: 'rg_cpf',
      title: 'RG / CPF do Paciente',
      required: true,
      description: 'Documento oficial com foto e CPF legível',
      icon: 'badge',
      accept: '.pdf,.jpg,.jpeg,.png'
    },
    {
      key: 'carteirinha',
      title: 'Carteirinha do Convênio',
      required: true,
      description: 'Frente e verso ou cartão virtual com número da matrícula',
      icon: 'credit_card',
      accept: '.pdf,.jpg,.jpeg,.png'
    },
    {
      key: 'imagens',
      title: 'Exames de Imagens',
      required: true,
      description: 'Tomografias, Ressonâncias ou Raios-X pertinentes',
      icon: 'radiology',
      accept: '.pdf,.jpg,.jpeg,.png,.zip'
    },
    {
      key: 'laudo',
      title: 'Laudo Médico / Justificativa Clínica',
      required: true,
      description: 'Laudo assinado e carimbado com indicação e CID',
      icon: 'clinical_notes',
      accept: '.pdf,.jpg,.jpeg,.png'
    },
    {
      key: 'complementar',
      title: 'Documentos Complementares',
      required: false,
      description: 'Relatórios adicionais, orçamentos prévios ou exames laboratoriais',
      icon: 'attach_file',
      accept: '.pdf,.jpg,.jpeg,.png,.zip'
    }
  ]

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline ativo: o envio e arquivos serão validados e simulados localmente.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-10 pb-32">
          {/* Page Header */}
          <div className="mb-stack-lg">
            <button
              onClick={() => navigate('/medico')}
              className="flex items-center gap-2 text-secondary mb-2 hover:text-on-background transition-colors text-label-md font-semibold"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Voltar para o Painel</span>
            </button>
            <h2 className="font-headline-lg text-headline-lg text-on-background font-black">Novo Pedido Médico</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 max-w-2xl">
              Preencha os dados e anexe a documentação obrigatória identificada para que o caso seja imediatamente recepcionado para cotação e regulação.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 overflow-hidden">
            <div className="h-1.5 w-full bg-surface-container">
              <div className={`h-full transition-all duration-300 ${hasMandatoryFiles ? 'bg-emerald-600 w-full' : 'bg-secondary w-2/3'}`}></div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-8">
              
              {/* Section 1: Dados do Paciente */}
              <section>
                <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3 mb-stack-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold">Dados do Paciente</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="nome-completo">Nome Completo do Paciente *</label>
                    <input 
                      type="text" 
                      id="nome-completo" 
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nome completo conforme RG/CPF" 
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
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
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
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
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
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
                      placeholder="Ex: Bradesco Saúde, Amil, SulAmérica, Unimed" 
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Dados Clínicos e Fornecedor */}
              <section>
                <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3 mb-stack-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold">Dados Clínicos & Fornecedor Preferencial</h3>
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
                        className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
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
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="procedimento">Procedimento Principal (TUSS) *</label>
                    <div className="relative">
                      <select 
                        id="procedimento" 
                        required
                        value={procedureId}
                        onChange={(e) => setProcedureId(e.target.value)}
                        className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
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
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="data-proposta">Data Prevista da Cirurgia *</label>
                    <input 
                      type="date" 
                      id="data-proposta" 
                      required
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                  </div>

                  {/* Campo Fornecedor Indicado */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="fornecedor-indicado">
                      Fornecedor Indicado / Preferencial (OPME)
                    </label>
                    <div className="relative">
                      <select 
                        id="fornecedor-indicado"
                        value={supplierIndicated}
                        onChange={(e) => setSupplierIndicated(e.target.value)}
                        className="w-full rounded-lg h-12 px-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
                      >
                        {KNOWN_SUPPLIERS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>

                    {supplierIndicated === 'Outro (Especificar)' && (
                      <input
                        type="text"
                        placeholder="Nome do fornecedor / distribuidor"
                        value={customSupplier}
                        onChange={(e) => setCustomSupplier(e.target.value)}
                        className="mt-2 w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                      />
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2" htmlFor="resumo">Resumo Clínico / Justificativa</label>
                    <textarea 
                      id="resumo" 
                      rows={3}
                      value={clinicalSummary}
                      onChange={(e) => setClinicalSummary(e.target.value)}
                      placeholder="Indique a gravidade do caso, diagnóstico, materiais necessários e a urgência clínica..."
                      className="w-full rounded-lg p-4 border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Documentação Identificada e Obrigatória */}
              <section>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-background font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-title-lg text-title-lg text-on-background font-bold">Documentação Identificada (Uploads)</h3>
                      <p className="text-xs text-on-surface-variant">O caso só segue para tratamento após o upload de todos os 4 documentos obrigatórios.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      hasMandatoryFiles ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {hasMandatoryFiles ? '✅ Todos os 4 Obrigatórios Anexados' : `⚠️ Faltam ${missingDocsList.length} documento(s)`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {documentSlots.map((slot) => {
                    const currentFile = uploadedFiles[slot.key]
                    const isAttached = Boolean(currentFile)

                    return (
                      <div 
                        key={slot.key}
                        className={`rounded-xl border p-4 flex flex-col justify-between transition-all relative ${
                          isAttached 
                            ? 'bg-emerald-50/60 border-emerald-300 shadow-sm' 
                            : slot.required 
                              ? 'bg-surface-container-lowest border-outline-variant hover:border-secondary'
                              : 'bg-surface-container-low/40 border-outline-variant/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[20px] ${isAttached ? 'text-emerald-700' : 'text-secondary'}`}>
                                {slot.icon}
                              </span>
                              <h4 className="font-bold text-sm text-on-background">{slot.title}</h4>
                            </div>
                            {slot.required ? (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                Obrigatório *
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                                Opcional
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                            {slot.description}
                          </p>
                        </div>

                        {/* File Upload Box */}
                        {isAttached ? (
                          <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between gap-2 shadow-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate text-on-background">{currentFile.name}</p>
                                <p className="text-[10px] text-on-surface-variant">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(slot.key)}
                              className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
                              title="Remover arquivo"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        ) : (
                          <label className="relative border-2 border-dashed border-outline-variant/70 hover:border-secondary rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-surface hover:bg-surface-container-low transition-all">
                            <input 
                              type="file" 
                              accept={slot.accept}
                              onChange={(e) => handleFileUpload(slot.key, e)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <span className="material-symbols-outlined text-secondary text-2xl mb-1">upload_file</span>
                            <span className="text-xs font-bold text-on-background">Selecionar Arquivo</span>
                            <span className="text-[10px] text-on-surface-variant mt-0.5">PDF, PNG, JPG (Até 15MB)</span>
                          </label>
                        )}
                      </div>
                    )
                  })}
                </div>

                {!hasMandatoryFiles && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-800 text-xl shrink-0 mt-0.5">info</span>
                    <div>
                      <h5 className="font-bold text-xs text-amber-900">Documentos obrigatórios pendentes:</h5>
                      <ul className="text-xs text-amber-800 mt-1 list-disc list-inside space-y-0.5 font-medium">
                        {missingDocsList.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/30 pt-6 mt-2">
                <button 
                  type="button"
                  onClick={() => navigate('/medico')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-label-md text-label-md text-on-background bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button 
                    type="submit"
                    disabled={loading || !hasMandatoryFiles}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2 shadow-level-1 ${
                      hasMandatoryFiles 
                        ? 'bg-secondary hover:bg-on-background text-on-secondary cursor-pointer' 
                        : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {loading ? 'Processando Pedido...' : 'Gerar Pedido Médico'}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <BottomNav role="medico" />
    </div>
  )
}

