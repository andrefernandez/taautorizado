import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPatients } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_PATIENTS = [
  { id: 'f3b07384-d113-4b0d-9fae-9d229a320001', name: 'Mariana Santos', birth_date: '1985-05-14', cpf: '111.111.111-11', insurance: 'Bradesco Saúde' },
  { id: 'f3b07384-d113-4b0d-9fae-9d229a320002', name: 'Carlos Oliveira', birth_date: '1972-08-22', cpf: '222.222.222-22', insurance: 'SulAmérica' },
  { id: 'f3b07384-d113-4b0d-9fae-9d229a320003', name: 'Ana Lúcia Ferreira', birth_date: '1990-11-05', cpf: '333.333.333-33', insurance: 'Amil' },
  { id: 'f3b07384-d113-4b0d-9fae-9d229a320004', name: 'Ricardo Souza', birth_date: '1965-03-30', cpf: '444.444.444-44', insurance: 'Unimed Seguros' },
  { id: 'f3b07384-d113-4b0d-9fae-9d229a320005', name: 'Fernanda Mendes', birth_date: '1988-02-18', cpf: '555.555.555-55', insurance: 'Bradesco Saúde' }
]

export default function PatientRecords() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isOffline, setIsOffline] = useState(false)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await getPatients()
      setPatients(data || [])
      setIsOffline(false)
    } catch (e) {
      console.warn("Utilizando lista de pacientes offline:", e.message)
      setPatients(OFFLINE_PATIENTS)
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search) ||
    p.insurance.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="medico" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Demonstração offline: Exibindo banco de pacientes fictício.
          </div>
        )}

        <header className="w-full flex items-center justify-between px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">person</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-background">Registros de Pacientes</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Base de dados cadastrais dos seus pacientes.</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-margin-mobile md:px-margin-desktop pb-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">
          
          <section className="bg-surface-container-lowest rounded-xl shadow-level-1 border border-surface-container-high overflow-hidden flex-1 flex flex-col min-h-[400px]">
            {/* Search Bar */}
            <div className="p-6 border-b border-surface flex items-center justify-between gap-4">
              <h3 className="font-title-lg text-title-lg text-on-background font-bold hidden sm:block">Todos os Pacientes</h3>
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-outline-variant text-body-md font-body-md text-on-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all h-10"
                  placeholder="Buscar por nome, CPF ou convênio..."
                />
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body-md text-on-surface-variant mt-4">Buscando registros...</span>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">person</span>
                <h4 className="font-title-lg font-bold text-on-background">Nenhum paciente cadastrado</h4>
                <p className="text-body-md text-on-surface-variant mt-1">Os pacientes são adicionados automaticamente ao criar solicitações.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/65">
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Nome Completo</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Data de Nascimento</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Convênio</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background divide-y divide-surface-container-highest/50">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => navigate(`/medico/paciente/${p.id}`)}>
                        <td className="px-6 py-4 font-semibold text-on-background group-hover:text-secondary transition-colors">{p.name}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{p.cpf}</td>
                        <td className="px-6 py-4 text-on-surface-variant">
                          {p.birth_date ? new Date(p.birth_date).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-surface-container px-2.5 py-1 rounded-md text-xs font-semibold text-on-surface">
                            {p.insurance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/medico/paciente/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-secondary hover:text-on-background font-semibold text-xs bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>Ver Prontuário</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                          </Link>
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

      <BottomNav role="medico" />
    </div>
  )
}
