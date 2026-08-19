import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const MOCK_HOSPITALS = [
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320001', name: 'Hospital Sírio-Libanês', city: 'São Paulo - SP', cnpj: '61.644.731/0001-32', beds: 450, phone: '(11) 3394-8000' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320002', name: 'Hospital Albert Einstein', city: 'São Paulo - SP', cnpj: '60.765.823/0001-30', beds: 620, phone: '(11) 2151-1233' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320003', name: 'Clínica São José', city: 'Rio de Janeiro - RJ', cnpj: '33.542.119/0001-90', beds: 180, phone: '(21) 2538-7000' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320004', name: 'Hospital Samaritano', city: 'São Paulo - SP', cnpj: '60.912.441/0001-11', beds: 310, phone: '(11) 3821-5300' },
  { id: 'd3b07384-d113-4b0d-9fae-9d229a320005', name: 'Hospital Moinhos de Vento', city: 'Porto Alegre - RS', cnpj: '92.684.093/0001-88', beds: 380, phone: '(51) 3314-3434' }
]

const MOCK_INSURANCES = [
  { id: '1', name: 'Bradesco Saúde', ans_code: '005711', SLA: '3 dias úteis', coverage: 'Nacional' },
  { id: '2', name: 'SulAmérica Saúde', ans_code: '006246', SLA: '5 dias úteis', coverage: 'Nacional' },
  { id: '3', name: 'Amil Assistência Médica', ans_code: '326305', SLA: '4 dias úteis', coverage: 'Nacional' },
  { id: '4', name: 'Unimed Seguros', ans_code: '419141', SLA: '5 dias úteis', coverage: 'Regional' },
  { id: '5', name: 'Porto Seguro Saúde', ans_code: '000582', SLA: '3 dias úteis', coverage: 'Nacional' }
]

export default function CadastrosManager({ role = 'medico' }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('hospitais')
  const [hospitals, setHospitals] = useState([])
  const [insurances, setInsurances] = useState(MOCK_INSURANCES)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  // Complete New Hospital Form State
  const [newHospName, setNewHospName] = useState('')
  const [newHospCnpj, setNewHospCnpj] = useState('')
  const [newHospCity, setNewHospCity] = useState('')
  const [newHospAddress, setNewHospAddress] = useState('')
  const [newHospPhone, setNewHospPhone] = useState('')
  const [newHospEmail, setNewHospEmail] = useState('')
  const [newHospBeds, setNewHospBeds] = useState('')
  const [newHospSpecialties, setNewHospSpecialties] = useState('')
  const [newHospInsurances, setNewHospInsurances] = useState('')

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('hospitals').select('*').order('name', { ascending: true })
        if (error) throw error
        setHospitals(data || [])
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando hospitais offline:", e.message)
        setHospitals(MOCK_HOSPITALS)
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchHospitals()
  }, [])

  const handleAddHospital = async (e) => {
    e.preventDefault()
    if (!newHospName) return

    const specArray = newHospSpecialties ? newHospSpecialties.split(',').map(s => s.trim()) : undefined
    const insArray = newHospInsurances ? newHospInsurances.split(',').map(i => i.trim()) : undefined

    try {
      if (!isOffline) {
        const { data, error } = await supabase
          .from('hospitals')
          .insert({ name: newHospName })
          .select('*')
          .single()

        if (error) throw error
        setHospitals([...hospitals, { ...data, cnpj: newHospCnpj, city: newHospCity, phone: newHospPhone, beds: newHospBeds, specialties: specArray, insurances: insArray }])
      } else {
        const newObj = { 
          id: Date.now().toString(), 
          name: newHospName, 
          cnpj: newHospCnpj || '00.000.000/0001-00',
          city: newHospCity || 'São Paulo - SP',
          address: newHospAddress,
          phone: newHospPhone || '(11) 3000-0000',
          email: newHospEmail,
          beds: newHospBeds || 200,
          specialties: specArray || ['Cirurgia Geral', 'Ortopedia'],
          insurances: insArray || ['Bradesco Saúde', 'SulAmérica']
        }
        setHospitals([...hospitals, newObj])
      }

      setNewHospName('')
      setNewHospCnpj('')
      setNewHospCity('')
      setNewHospAddress('')
      setNewHospPhone('')
      setNewHospEmail('')
      setNewHospBeds('')
      setNewHospSpecialties('')
      setNewHospInsurances('')
      alert('Hospital cadastrado com sucesso!')
    } catch (err) {
      alert('Erro ao cadastrar hospital: ' + err.message)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role={role} />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline ativo: novos cadastros serão mantidos localmente na sessão.
          </div>
        )}

        <header className="w-full flex items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">app_registration</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background font-black">Rede Credenciada & Convênios</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Gerencie e visualize informações completas dos hospitais parceiros.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          {/* Tabs header */}
          <div className="flex border-b border-outline-variant/30 gap-6">
            <button
              onClick={() => setActiveTab('hospitais')}
              className={`pb-3 font-title-lg text-title-lg font-bold flex items-center gap-2 transition-all relative ${
                activeTab === 'hospitais'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-on-surface-variant hover:text-on-background'
              }`}
            >
              <span className="material-symbols-outlined">domain</span>
              Hospitais Credenciados ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('convenios')}
              className={`pb-3 font-title-lg text-title-lg font-bold flex items-center gap-2 transition-all relative ${
                activeTab === 'convenios'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-on-surface-variant hover:text-on-background'
              }`}
            >
              <span className="material-symbols-outlined">health_and_safety</span>
              Operadoras e Convênios ({insurances.length})
            </button>
          </div>

          {activeTab === 'hospitais' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
              
              {/* Form Add Hospital Complete */}
              <form onSubmit={handleAddHospital} className="col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
                <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">add_location_alt</span>
                  Cadastro Completo de Hospital
                </h3>

                <div>
                  <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-name">Nome do Hospital *</label>
                  <input
                    type="text"
                    id="hosp-name"
                    required
                    value={newHospName}
                    onChange={(e) => setNewHospName(e.target.value)}
                    placeholder="Ex: Hospital Vila Nova Star"
                    className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-cnpj">CNPJ</label>
                    <input
                      type="text"
                      id="hosp-cnpj"
                      value={newHospCnpj}
                      onChange={(e) => setNewHospCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-beds">Nº de Leitos</label>
                    <input
                      type="number"
                      id="hosp-beds"
                      value={newHospBeds}
                      onChange={(e) => setNewHospBeds(e.target.value)}
                      placeholder="Ex: 300"
                      className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-city">Cidade / Estado</label>
                  <input
                    type="text"
                    id="hosp-city"
                    value={newHospCity}
                    onChange={(e) => setNewHospCity(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                  />
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-address">Endereço Completo</label>
                  <input
                    type="text"
                    id="hosp-address"
                    value={newHospAddress}
                    onChange={(e) => setNewHospAddress(e.target.value)}
                    placeholder="Ex: Av. Paulista, 1000"
                    className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-phone">Telefone / OPME</label>
                    <input
                      type="text"
                      id="hosp-phone"
                      value={newHospPhone}
                      onChange={(e) => setNewHospPhone(e.target.value)}
                      placeholder="(11) 3000-0000"
                      className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-email">E-mail Regulação</label>
                    <input
                      type="email"
                      id="hosp-email"
                      value={newHospEmail}
                      onChange={(e) => setNewHospEmail(e.target.value)}
                      placeholder="opme@hospital.com"
                      className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-specialties">Especialidades (separadas por vírgula)</label>
                  <input
                    type="text"
                    id="hosp-specialties"
                    value={newHospSpecialties}
                    onChange={(e) => setNewHospSpecialties(e.target.value)}
                    placeholder="Ex: Ortopedia, Neurocirurgia, Bucomaxilofacial"
                    className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                  />
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant font-semibold mb-1" htmlFor="hosp-insurances">Convênios Aceitos (separados por vírgula)</label>
                  <input
                    type="text"
                    id="hosp-insurances"
                    value={newHospInsurances}
                    onChange={(e) => setNewHospInsurances(e.target.value)}
                    placeholder="Ex: Bradesco Saúde, SulAmérica, Amil"
                    className="w-full rounded-lg h-10 px-3 border border-outline-variant bg-surface text-body-md"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-on-background font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Cadastrar Hospital Completo
                </button>
              </form>

              {/* Hospital List Interactive */}
              <div className="col-span-1 lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-level-1 overflow-hidden">
                <div className="p-6 border-b border-surface flex items-center justify-between">
                  <div>
                    <h3 className="font-title-lg text-title-lg text-on-background font-bold">Rede Hospitalar Cadastrada</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Clique em qualquer hospital para visualizar o perfil detalhado.</p>
                  </div>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-on-surface-variant">Carregando hospitais...</div>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {hospitals.map((h) => (
                      <div 
                        key={h.id} 
                        onClick={() => navigate(`/${role}/hospital/${h.id}`)}
                        className="p-5 hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                            <span className="material-symbols-outlined text-2xl">domain</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-background text-base group-hover:text-secondary transition-colors">{h.name}</h4>
                            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                              {h.city || 'São Paulo - SP'} {h.cnpj && `• CNPJ: ${h.cnpj}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                            Credenciado
                          </span>
                          <Link
                            to={`/${role}/hospital/${h.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-background px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <span>Ver Perfil</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'convenios' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-level-1 overflow-hidden">
              <div className="p-6 border-b border-surface flex items-center justify-between">
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-background font-bold">Operadoras de Saúde Parceiras</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Tempo médio estimado de retorno e regulação ANS.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Operadora</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Registro ANS</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Abrangência</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">SLA Médio de Autorização</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {insurances.map((ins) => (
                      <tr key={ins.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 font-semibold text-on-background flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary">verified_user</span>
                          {ins.name}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{ins.ans_code}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{ins.coverage}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container text-secondary border border-secondary-container">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {ins.SLA}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      <BottomNav role={role} />
    </div>
  )
}
