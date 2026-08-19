import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portal from './pages/Portal'
import SurgeonDashboard from './pages/SurgeonDashboard'
import NewRequest from './pages/NewRequest'
import CaseDetails from './pages/CaseDetails'
import RequestList from './pages/RequestList'
import PatientRecords from './pages/PatientRecords'
import PatientDetails from './pages/PatientDetails'
import CadastrosManager from './pages/CadastrosManager'
import HospitalDetails from './pages/HospitalDetails'
import ProviderDashboard from './pages/ProviderDashboard'
import BudgetManagement from './pages/BudgetManagement'
import BillingReports from './pages/BillingReports'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry portal to select role */}
        <Route path="/" element={<Portal />} />

        {/* Surgeon / Doctor Flow */}
        <Route path="/medico" element={<SurgeonDashboard />} />
        <Route path="/medico/novo-pedido" element={<NewRequest />} />
        <Route path="/medico/pedidos" element={<RequestList />} />
        <Route path="/medico/caso/:id" element={<CaseDetails />} />
        <Route path="/medico/pacientes" element={<PatientRecords />} />
        <Route path="/medico/paciente/:id" element={<PatientDetails />} />
        <Route path="/medico/cadastros" element={<CadastrosManager role="medico" />} />
        <Route path="/medico/hospital/:id" element={<HospitalDetails role="medico" />} />

        {/* Supplier / Provider Flow */}
        <Route path="/fornecedor" element={<ProviderDashboard />} />
        <Route path="/fornecedor/cotacao/:id" element={<BudgetManagement />} />
        <Route path="/fornecedor/faturamento" element={<BillingReports />} />
        <Route path="/fornecedor/cadastros" element={<CadastrosManager role="fornecedor" />} />
        <Route path="/fornecedor/hospital/:id" element={<HospitalDetails role="fornecedor" />} />
      </Routes>
    </BrowserRouter>
  )
}
