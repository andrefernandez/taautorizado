# 🏥 Tá Autorizado — Clinical Precision

> Plataforma inteligente e integrada para gestão de solicitações cirúrgicas, cotação de materiais especiais (OPME), regulação com operadoras de saúde e prontuário de pacientes.

---

## 📌 Sobre o Projeto

O **Tá Autorizado** foi desenvolvido para transformar o fluxo burocrático de autorizações médicas no Brasil. Ele unifica em um único ecossistema digital a comunicação entre **Cirurgiões/Médicos**, **Distribuidores de OPME (Órteses, Próteses e Materiais Especiais)**, **Hospitais** e **Operadoras de Planos de Saúde**.

Com atualização em tempo real via **Supabase**, a plataforma reduz o tempo médio de autorização cirúrgica, evita atrasos no faturamento de materiais e oferece transparência em cada etapa da solicitação.

---

## ✨ Principais Funcionalidades

### 🩺 1. Painel do Médico / Cirurgião
- **Dashboard de Métricas**: Visualização consolidada de cirurgias em tempo real (*Em Análise*, *Autorizado*, *Pendente Docs*, *Negado*, *Aguardando Orçamento*).
- **Lista Geral de Solicitações (`/medico/pedidos`)**: Tabela completa com filtros dinâmicos por status e busca por paciente, código TUSS ou hospital.
- **Novo Pedido Médico (`/medico/novo-pedido`)**: Cadastro passo a passo com validação de paciente, seleção de hospital parceiro, código do procedimento TUSS, resumo clínico e anexo de exames e laudos.
- **Linha do Tempo da Cirurgia (`/medico/caso/:id`)**: Acompanhamento visual de todas as etapas (Documentos recebidos ➔ Cotação de OPME ➔ Análise Técnica ➔ Autorização Final).
- **Aprovação de Orçamentos**: Validação e aceite direto das propostas comerciais enviadas pelos distribuidores de OPME.
- **Prontuário & Carteirinha Digital (`/medico/paciente/:id`)**: Perfil individual com número da carteirinha, operadora, tipo de plano, acomodação (Apartamento/Enfermaria) e histórico cirúrgico.

### 📦 2. Painel do Fornecedor / Distribuidor OPME
- **Fila de Cotações (`/fornecedor`)**: Listagem das cirurgias que aguardam proposta de órteses, próteses e insumos cirúrgicos.
- **Gestão de Orçamento Comercial (`/fornecedor/cotacao/:id`)**: Interface para precificação item a item, quantidades, marcas e envio da proposta para aprovação.
- **Controle de Faturamento & Relatórios (`/fornecedor/faturamento`)**: Painel financeiro com valores totais autorizados para faturamento e valores em análise com as operadoras.

### 🏥 3. Rede Credenciada & Convênios (`/medico/cadastros`)
- **Gestão de Hospitais**: Cadastro completo de hospitais com CNPJ, endereço, central de regulação/OPME, leitos, especialidades e convênios aceitos.
- **Perfil do Hospital (`/medico/hospital/:id`)**: Histórico de cirurgias vinculadas a cada hospital e gestão de especialidades atendidas.
- **Operadoras de Saúde**: Tabela informativa com código ANS, abrangência e SLA médio de retorno de autorização.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Roteamento**: [React Router DOM v6](https://reactrouter.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL com Row Level Security)
- **Ícones**: [Google Material Symbols & Icons](https://fonts.google.com/icons)
- **Deploy**: [Vercel](https://vercel.com/) (com suporte nativo a SPA Rewrites)

---

## 📁 Estrutura de Pastas

```bash
taautorizado/
├── public/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Barra lateral responsiva
│   │   └── BottomNav.jsx        # Navegação inferior para dispositivos móveis
│   ├── pages/
│   │   ├── Portal.jsx           # Tela de entrada (Seleção Médico vs. Fornecedor)
│   │   ├── SurgeonDashboard.jsx # Dashboard principal do médico
│   │   ├── RequestList.jsx      # Lista geral de pedidos com filtros
│   │   ├── NewRequest.jsx       # Formulário de nova solicitação cirúrgica
│   │   ├── CaseDetails.jsx      # Detalhes do caso e aprovação de OPME
│   │   ├── PatientRecords.jsx   # Listagem geral de pacientes
│   │   ├── PatientDetails.jsx   # Prontuário e carteirinha digital do paciente
│   │   ├── CadastrosManager.jsx # Gestão de hospitais credenciados e convênios
│   │   ├── HospitalDetails.jsx  # Perfil institucional do hospital
│   │   ├── ProviderDashboard.jsx# Fila de cotações para distribuidores
│   │   ├── BudgetManagement.jsx # Precificação de orçamentos OPME
│   │   └── BillingReports.jsx   # Relatório financeiro e faturamento
│   ├── services/
│   │   └── dataService.js       # Camada de integração direta com Supabase
│   ├── supabaseClient.js        # Configuração do cliente Supabase
│   ├── App.jsx                  # Definição de rotas da aplicação
│   ├── main.jsx                 # Ponto de entrada do React
│   └── index.css                # Estilos globais Tailwind
├── .env.example
├── vercel.json                  # Configuração de deploy e rotas SPA no Vercel
├── package.json
└── README.md
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 1. Clonar o repositório
```bash
git clone https://github.com/andrefernandez/taautorizado.git
cd taautorizado
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (ou utilize os valores pré-configurados):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Executar em modo de desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: **`http://localhost:5173/`**

---

## ☁️ Deploy no Vercel

O projeto já inclui o arquivo `vercel.json` configurado para SPA (Single Page Application).

1. Faça o fork ou envie seu código para o GitHub.
2. Importe o repositório no painel do [Vercel](https://vercel.com).
3. (Opcional) Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Settings ➔ Environment Variables**.
4. O Vercel executará o comando `npm run build` e disponibilizará a aplicação online automaticamente!

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

Feito com ☕ e precisão clínica por [André Fernandez](https://github.com/andrefernandez).
