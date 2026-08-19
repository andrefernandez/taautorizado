-- Script de Criação do Banco de Dados - Tá Autorizado

-- 1. Tabela de Pacientes
create table patients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  birth_date date not null,
  cpf text unique not null,
  insurance text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Hospitais
create table hospitals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Procedimentos (TUSS)
create table procedures (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Casos (Solicitações Médicas)
create table cases (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade,
  hospital_id uuid references hospitals(id) on delete set null,
  procedure_id uuid references procedures(id) on delete set null,
  status text not null default 'Aguardando Orçamento', -- 'Aguardando Orçamento', 'Em Análise', 'Autorizado', 'Pendente Docs', 'Negado'
  proposed_date date,
  clinical_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Itens de Orçamento (OPME)
create table budget_items (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases(id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  value numeric(10, 2),
  provider text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS) mas criar políticas públicas irrestritas para facilitar o protótipo
alter table patients enable row level security;
alter table hospitals enable row level security;
alter table procedures enable row level security;
alter table cases enable row level security;
alter table budget_items enable row level security;

create policy "Permitir leitura pública de pacientes" on patients for select using (true);
create policy "Permitir escrita pública de pacientes" on patients for insert with check (true);
create policy "Permitir update público de pacientes" on patients for update using (true);

create policy "Permitir leitura pública de hospitais" on hospitals for select using (true);
create policy "Permitir escrita pública de hospitais" on hospitals for insert with check (true);

create policy "Permitir leitura pública de procedimentos" on procedures for select using (true);
create policy "Permitir escrita pública de procedimentos" on procedures for insert with check (true);

create policy "Permitir leitura pública de casos" on cases for select using (true);
create policy "Permitir escrita pública de casos" on cases for insert with check (true);
create policy "Permitir update público de casos" on cases for update using (true);

create policy "Permitir leitura pública de orçamentos" on budget_items for select using (true);
create policy "Permitir escrita pública de orçamentos" on budget_items for insert with check (true);
create policy "Permitir update público de orçamentos" on budget_items for update using (true);
