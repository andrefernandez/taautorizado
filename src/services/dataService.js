import { supabase } from '../supabaseClient'

// Seed mock enricher when fields might be null in basic db
export const enrichCaseData = (c, patientMap, hospitalMap, procedureMap) => {
  const patient = patientMap?.get(c.patient_id) || c.patients || { name: 'Paciente', insurance: 'Bradesco Saúde' }
  const hospital = hospitalMap?.get(c.hospital_id) || c.hospitals || { name: 'Hospital Geral' }
  const procedure = procedureMap?.get(c.procedure_id) || c.procedures || { description: 'Procedimento Geral', code: '30205012' }

  return {
    ...c,
    patients: patient,
    hospitals: hospital,
    procedures: procedure,
    insurance: c.insurance || patient.insurance || 'Bradesco Saúde',
    supplier_indicated: c.supplier_indicated || 'OPME Sul Distribuidora',
    supplier_authorized: c.supplier_authorized || (c.status === 'Autorizado' ? (c.supplier_indicated || 'OPME Sul Distribuidora') : 'Aguardando Regulação'),
    doctor_name: c.doctor_name || 'Dr. Carlos Silva',
    follow_ups: c.follow_ups || [
      {
        id: 'f1',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '2026-08-18 14:32',
        type: 'call',
        title: 'Contato com a Operadora',
        content: 'Protocolo gerado nº 849201948 junto ao convênio. Solicitação em fila de auditoria médica prioritária.',
        badge: 'Em Regulação'
      },
      {
        id: 'f2',
        author: 'Camila (Equipe Tá Autorizado)',
        date: '2026-08-19 10:15',
        type: 'doc',
        title: 'Verificação de Laudos',
        content: 'Documentos técnicos e laudos de imagem conferidos com sucesso e anexados ao portal do convênio.',
        badge: 'Docs OK'
      }
    ],
    support_messages: c.support_messages || []
  }
}

// Helper to fetch all cases enriched with patient, hospital and procedure details
export async function getCases() {
  const [casesRes, patientsRes, hospitalsRes, proceduresRes] = await Promise.all([
    supabase.from('cases').select('*').order('created_at', { ascending: false }),
    supabase.from('patients').select('*'),
    supabase.from('hospitals').select('*'),
    supabase.from('procedures').select('*')
  ])

  if (casesRes.error) throw casesRes.error
  if (patientsRes.error) throw patientsRes.error
  if (hospitalsRes.error) throw hospitalsRes.error
  if (proceduresRes.error) throw proceduresRes.error

  const patientMap = new Map((patientsRes.data || []).map(p => [p.id, p]))
  const hospitalMap = new Map((hospitalsRes.data || []).map(h => [h.id, h]))
  const procedureMap = new Map((proceduresRes.data || []).map(pr => [pr.id, pr]))

  return (casesRes.data || []).map(c => enrichCaseData(c, patientMap, hospitalMap, procedureMap))
}

// Helper to fetch a single case by ID with full relations and budget items
export async function getCaseById(id) {
  const { data: c, error: cErr } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (cErr) throw cErr
  if (!c) throw new Error("Caso não encontrado")

  const [patientRes, hospitalRes, procedureRes, budgetRes] = await Promise.all([
    c.patient_id ? supabase.from('patients').select('*').eq('id', c.patient_id).single() : { data: null },
    c.hospital_id ? supabase.from('hospitals').select('*').eq('id', c.hospital_id).single() : { data: null },
    c.procedure_id ? supabase.from('procedures').select('*').eq('id', c.procedure_id).single() : { data: null },
    supabase.from('budget_items').select('*').eq('case_id', id)
  ])

  const patient = patientRes.data || { name: 'Paciente', cpf: '000.000.000-00', insurance: 'Bradesco Saúde' }
  const hospital = hospitalRes.data || { name: 'Hospital' }
  const procedure = procedureRes.data || { description: 'Procedimento', code: '00000000' }

  return {
    ...enrichCaseData(c),
    patients: patient,
    hospitals: hospital,
    procedures: procedure,
    insurance: c.insurance || patient.insurance || 'Bradesco Saúde',
    budget_items: budgetRes.data || []
  }
}

// Helper to fetch patients
export async function getPatients() {
  const { data, error } = await supabase.from('patients').select('*').order('name', { ascending: true })
  if (error) throw error
  return data || []
}

// Helper to fetch single patient with case history
export async function getPatientById(id) {
  const { data: patient, error: pErr } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (pErr) throw pErr
  if (!patient) throw new Error("Paciente não encontrado")

  const { data: casesData, error: cErr } = await supabase
    .from('cases')
    .select('*')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  if (cErr) throw cErr

  const [hospitalsRes, proceduresRes] = await Promise.all([
    supabase.from('hospitals').select('*'),
    supabase.from('procedures').select('*')
  ])

  const hospitalMap = new Map((hospitalsRes.data || []).map(h => [h.id, h]))
  const procedureMap = new Map((proceduresRes.data || []).map(pr => [pr.id, pr]))

  const enrichedCases = (casesData || []).map(c => enrichCaseData(c, null, hospitalMap, procedureMap))

  return {
    patient,
    cases: enrichedCases
  }
}

// Helper to fetch hospitals
export async function getHospitals() {
  const { data, error } = await supabase.from('hospitals').select('*').order('name', { ascending: true })
  if (error) throw error
  return data || []
}

// Helper to fetch single hospital with cases
export async function getHospitalById(id) {
  const { data: hospital, error: hErr } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single()

  if (hErr) throw hErr
  if (!hospital) throw new Error("Hospital não encontrado")

  const { data: casesData, error: cErr } = await supabase
    .from('cases')
    .select('*')
    .eq('hospital_id', id)
    .order('created_at', { ascending: false })

  if (cErr) throw cErr

  const [patientsRes, proceduresRes] = await Promise.all([
    supabase.from('patients').select('*'),
    supabase.from('procedures').select('*')
  ])

  const patientMap = new Map((patientsRes.data || []).map(p => [p.id, p]))
  const procedureMap = new Map((proceduresRes.data || []).map(pr => [pr.id, pr]))

  const enrichedCases = (casesData || []).map(c => enrichCaseData(c, patientMap, null, procedureMap))

  return {
    hospital,
    cases: enrichedCases
  }
}

// Helper to fetch procedures
export async function getProcedures() {
  const { data, error } = await supabase.from('procedures').select('*').order('description', { ascending: true })
  if (error) throw error
  return data || []
}

// Helper to fetch billing cases
export async function getBillingCases() {
  const [casesRes, patientsRes, hospitalsRes, proceduresRes, budgetRes] = await Promise.all([
    supabase.from('cases').select('*').in('status', ['Autorizado', 'Em Análise']).order('created_at', { ascending: false }),
    supabase.from('patients').select('*'),
    supabase.from('hospitals').select('*'),
    supabase.from('procedures').select('*'),
    supabase.from('budget_items').select('*')
  ])

  if (casesRes.error) throw casesRes.error

  const patientMap = new Map((patientsRes.data || []).map(p => [p.id, p]))
  const hospitalMap = new Map((hospitalsRes.data || []).map(h => [h.id, h]))
  const procedureMap = new Map((proceduresRes.data || []).map(pr => [pr.id, pr]))

  // Group budget items by case_id
  const budgetMap = new Map()
  for (const item of (budgetRes.data || [])) {
    if (!budgetMap.has(item.case_id)) budgetMap.set(item.case_id, [])
    budgetMap.get(item.case_id).push(item)
  }

  return (casesRes.data || []).map(c => ({
    ...enrichCaseData(c, patientMap, hospitalMap, procedureMap),
    budget_items: budgetMap.get(c.id) || []
  }))
}
