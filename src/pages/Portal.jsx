import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Portal() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile">
      <div className="w-full max-w-md text-center mb-stack-lg">
        <h1 className="text-display-lg font-black text-on-background tracking-tight leading-none">Tá Autorizado</h1>
        <p className="text-body-lg text-on-surface-variant mt-3">Plataforma Inteligente de Autorizações Cirúrgicas</p>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Card Médico */}
        <button
          onClick={() => navigate('/medico')}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 text-left shadow-level-1 hover:border-secondary-container hover:-translate-y-1 hover:shadow-level-2 transition-all duration-300 group flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
            <span className="material-symbols-outlined text-[28px] icon-fill">medical_services</span>
          </div>
          <div>
            <h3 className="text-title-lg font-black text-on-background group-hover:text-secondary transition-colors">Cirurgião / Médico</h3>
            <p className="text-body-md text-on-surface-variant mt-2">Cadastre solicitações, envie documentos e acompanhe aprovações das operadoras.</p>
          </div>
        </button>

        {/* Card Fornecedor */}
        <button
          onClick={() => navigate('/fornecedor')}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 text-left shadow-level-1 hover:border-secondary-container hover:-translate-y-1 hover:shadow-level-2 transition-all duration-300 group flex flex-col justify-between min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
            <span className="material-symbols-outlined text-[28px] icon-fill">medication</span>
          </div>
          <div>
            <h3 className="text-title-lg font-black text-on-background group-hover:text-secondary transition-colors">Fornecedor / OPME</h3>
            <p className="text-body-md text-on-surface-variant mt-2">Responda a cotações de materiais especiais e acompanhe faturamento de cirurgias.</p>
          </div>
        </button>
      </div>

      <div className="mt-12 text-center text-label-md text-on-surface-variant font-medium">
        Tá Autorizado © {new Date().getFullYear()} • Clinical Precision
      </div>
    </div>
  )
}
