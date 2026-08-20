import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getCaseById } from '../services/dataService'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'

const OFFLINE_CASES = {
  'a3b07384-d113-4b0d-9fae-9d229a320005': {
    id: 'a3b07384-d113-4b0d-9fae-9d229a320005',
    status: 'Aguardando Orçamento',
    proposed_date: '2026-10-25',
    clinical_summary: 'Colecistopatia calculosa crônica. Solicitado kit de videocirurgia.',
    patients: { name: 'Fernanda Mendes', insurance: 'Bradesco Saúde' },
    procedures: { description: 'Colecistectomia', code: '31001016' },
    hospitals: { name: 'Hospital Samaritano' }
  }
}

export default function BudgetManagement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // Budget Rows
  const [provider, setProvider] = useState('OPME Sul Distribuidora')
  const [materials, setMaterials] = useState([
    { name: '', quantity: 1, value: '' }
  ])

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true)
        const data = await getCaseById(id)
        setItem(data)
        setIsOffline(false)
      } catch (e) {
        console.warn("Utilizando dados do caso offline:", e.message)
        const offlineCase = OFFLINE_CASES[id] || {
          id: id,
          status: 'Aguardando Orçamento',
          proposed_date: '2026-10-25',
          clinical_summary: 'Caso de teste offline.',
          patients: { name: 'Paciente Offline', insurance: 'Bradesco' },
          procedures: { description: 'Procedimento Geral', code: '00000000' },
          hospitals: { name: 'Hospital Geral' }
        }
        setItem(offlineCase)
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchCase()
  }, [id])

  const handleRowChange = (index, field, value) => {
    const updated = [...materials]
    updated[index][field] = value
    setMaterials(updated)
  }

  const addRow = () => {
    setMaterials([...materials, { name: '', quantity: 1, value: '' }])
  }

  const removeRow = (index) => {
    if (materials.length === 1) return
    setMaterials(materials.filter((_, idx) => idx !== index))
  }

  const totalValue = materials.reduce((sum, m) => {
    const qty = Number(m.quantity) || 0
    const val = Number(m.value) || 0
    return sum + (qty * val)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar linhas
    const invalid = materials.some(m => !m.name || !m.quantity || !m.value)
    if (invalid) {
      alert("Por favor, preencha todos os campos dos materiais.")
      return
    }

    setSubmitting(true)
    try {
      if (isOffline) {
        alert("Simulação offline: Orçamento enviado!")
        navigate('/fornecedor')
        return
      }

      // 1. Inserir itens de orçamento no Supabase
      const insertRows = materials.map(m => ({
        case_id: id,
        name: m.name,
        quantity: Number(m.quantity),
        value: Number(m.value),
        provider: provider
      }))

      const { error: insertErr } = await supabase
        .from('budget_items')
        .insert(insertRows)

      if (insertErr) throw insertErr

      // 2. Atualizar status do caso para "Em Análise"
      const { error: updateErr } = await supabase
        .from('cases')
        .update({ status: 'Em Análise' })
        .eq('id', id)

      if (updateErr) throw updateErr

      alert("Orçamento enviado com sucesso! O caso agora está Em Análise pela operadora.")
      navigate('/fornecedor')
    } catch (err) {
      console.error(err)
      alert("Erro ao enviar orçamento: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-body-md text-on-surface-variant">Carregando detalhes do orçamento...</span>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-margin-mobile">
        <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
        <h3 className="font-title-lg font-bold text-on-background">Caso não encontrado</h3>
        <button onClick={() => navigate('/fornecedor')} className="mt-4 bg-secondary text-on-secondary px-6 py-2 rounded-lg text-label-md">
          Voltar à Fila
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden font-body-md bg-background">
      <Sidebar role="fornecedor" />

      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto relative pb-20 md:pb-0">
        
        {isOffline && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-200">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            Modo offline ativo: as cotações serão simuladas localmente.
          </div>
        )}

        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg lg:py-12 pb-32">
          {/* Page Header */}
          <div className="mb-stack-lg">
            <Link 
              to="/fornecedor"
              className="inline-flex items-center gap-2 text-secondary hover:text-on-background transition-colors text-label-md font-semibold mb-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Voltar para Fila de Cotações</span>
            </Link>
            <h2 className="font-headline-lg text-headline-lg text-on-background">Gestão de Orçamento OPME</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              Forneça os valores comerciais dos materiais solicitados para a cirurgia de <span className="font-semibold text-on-background">{item.patients?.name}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="col-span-1 lg:col-span-2 bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-6">
              
              <div className="border-b border-outline-variant/30 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-title-lg text-title-lg text-on-background font-bold">Adicionar Itens e Órteses/Próteses</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-on-surface-variant font-medium shrink-0" htmlFor="distribuidora">Sua Distribuidora:</label>
                  <input
                    type="text"
                    id="distribuidora"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="border border-outline-variant rounded-md px-3 py-1 bg-background text-body-md font-semibold h-8"
                  />
                </div>
              </div>

              {/* Dynamic Rows */}
              <div className="space-y-4">
                {materials.map((row, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 relative">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Nome do Material</label>
                      <input 
                        type="text"
                        required
                        value={row.name}
                        onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                        placeholder="Ex: Placa Ortognática, Prótese..."
                        className="w-full rounded-md border border-outline-variant bg-surface-container-lowest text-body-md px-3 py-2"
                      />
                    </div>
                    <div className="w-full sm:w-24">
                      <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Qtd</label>
                      <input 
                        type="number"
                        min="1"
                        required
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-full rounded-md border border-outline-variant bg-surface-container-lowest text-body-md px-3 py-2 text-center"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Val. Unitário (R$)</label>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={row.value}
                        onChange={(e) => handleRowChange(idx, 'value', e.target.value)}
                        placeholder="0,00"
                        className="w-full rounded-md border border-outline-variant bg-surface-container-lowest text-body-md px-3 py-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={materials.length === 1}
                      className="text-error hover:bg-error/10 p-2 rounded-md self-end sm:self-center disabled:opacity-30 mt-2 sm:mt-5"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Material Button */}
              <button
                type="button"
                onClick={addRow}
                className="w-full py-3 border-2 border-dashed border-outline-variant/60 rounded-lg hover:border-secondary hover:text-secondary text-on-surface-variant transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Adicionar Outro Item
              </button>

              {/* Total Summary */}
              <div className="mt-4 pt-6 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                <div>
                  <span className="text-body-md text-on-surface-variant font-medium">Valor Total da Proposta</span>
                  <p className="text-xs text-on-surface-variant mt-1">Soma de todos os insumos e OPME listados.</p>
                </div>
                <span className="text-2xl font-black text-secondary">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-6 mt-4">
                <button 
                  type="button"
                  onClick={() => navigate('/fornecedor')}
                  className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-background bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-lg font-label-md text-label-md text-on-primary bg-secondary hover:bg-on-background shadow-level-1 transition-all flex items-center gap-2 disabled:opacity-50 font-bold"
                >
                  {submitting ? 'Enviando...' : 'Enviar Orçamento'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

            </form>

            {/* Case Details Sidebar */}
            <div className="col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-level-1 flex flex-col gap-4">
              <h3 className="font-title-lg text-title-lg text-on-background font-bold border-b border-outline-variant/30 pb-2">
                Resumo da Solicitação
              </h3>
              <div className="space-y-3 text-body-md">
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Cirurgião Solicitante</span>
                  <span className="font-bold text-on-background flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-sm">person</span>
                    {item.doctor_name || 'Dr. Carlos Silva'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Paciente</span>
                  <span className="font-semibold text-on-background">{item.patients?.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Convênio / Operadora</span>
                  <span className="font-semibold text-on-background">{item.insurance || item.patients?.insurance || 'Bradesco Saúde'}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Fornecedor Indicado</span>
                  <span className="font-semibold text-xs text-on-background">{item.supplier_indicated || 'OPME Sul Distribuidora'}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Procedimento</span>
                  <span className="font-semibold text-on-background">{item.procedures?.code} - {item.procedures?.description}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Hospital</span>
                  <span className="font-semibold text-on-background">{item.hospitals?.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-on-surface-variant font-medium">Data Proposta</span>
                  <span className="font-semibold text-on-background">
                    {item.proposed_date ? new Date(item.proposed_date).toLocaleDateString('pt-BR') : 'A agendar'}
                  </span>
                </div>
                {item.clinical_summary && (
                  <div className="pt-2 border-t border-outline-variant/20">
                    <span className="block text-xs text-on-surface-variant font-medium mb-1">Resumo Clínico</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-lg">
                      {item.clinical_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav role="fornecedor" />
    </div>
  )
}
