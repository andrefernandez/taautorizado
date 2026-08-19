-- Dados de Teste (Seed) - Tá Autorizado

-- 1. Inserir Hospitais
insert into hospitals (id, name) values
  ('d3b07384-d113-4b0d-9fae-9d229a320001', 'Hospital Sírio-Libanês'),
  ('d3b07384-d113-4b0d-9fae-9d229a320002', 'Hospital Albert Einstein'),
  ('d3b07384-d113-4b0d-9fae-9d229a320003', 'Clínica São José'),
  ('d3b07384-d113-4b0d-9fae-9d229a320004', 'Hospital Samaritano'),
  ('d3b07384-d113-4b0d-9fae-9d229a320005', 'Hospital Moinhos de Vento')
on conflict (id) do nothing;

-- 2. Inserir Procedimentos (TUSS)
insert into procedures (id, code, description) values
  ('e3b07384-d113-4b0d-9fae-9d229a320001', '30205012', 'Cirurgia Ortognática'),
  ('e3b07384-d113-4b0d-9fae-9d229a320002', '30725113', 'Artroplastia de Joelho'),
  ('e3b07384-d113-4b0d-9fae-9d229a320003', '30101292', 'Rinoplastia Estruturada'),
  ('e3b07384-d113-4b0d-9fae-9d229a320004', '31002390', 'Herniorrafia Inguinal'),
  ('e3b07384-d113-4b0d-9fae-9d229a320005', '31001016', 'Colecistectomia')
on conflict (id) do nothing;

-- 3. Inserir Pacientes
insert into patients (id, name, birth_date, cpf, insurance) values
  ('f3b07384-d113-4b0d-9fae-9d229a320001', 'Mariana Santos', '1985-05-14', '111.111.111-11', 'Bradesco Saúde'),
  ('f3b07384-d113-4b0d-9fae-9d229a320002', 'Carlos Oliveira', '1972-08-22', '222.222.222-22', 'SulAmérica'),
  ('f3b07384-d113-4b0d-9fae-9d229a320003', 'Ana Lúcia Ferreira', '1990-11-05', '333.333.333-33', 'Amil'),
  ('f3b07384-d113-4b0d-9fae-9d229a320004', 'Ricardo Souza', '1965-03-30', '444.444.444-44', 'Unimed Seguros'),
  ('f3b07384-d113-4b0d-9fae-9d229a320005', 'Fernanda Mendes', '1988-02-18', '555.555.555-55', 'Bradesco Saúde')
on conflict (id) do nothing;

-- 4. Inserir Casos (Solicitações Médicas)
insert into cases (id, patient_id, hospital_id, procedure_id, status, proposed_date, clinical_summary) values
  ('a3b07384-d113-4b0d-9fae-9d229a320001', 'f3b07384-d113-4b0d-9fae-9d229a320001', 'd3b07384-d113-4b0d-9fae-9d229a320001', 'e3b07384-d113-4b0d-9fae-9d229a320001', 'Em Análise', '2026-11-05', 'Paciente apresenta má oclusão esquelética Classe III severa, necessitando de intervenção cirúrgica ortognática bimaxilar.'),
  ('a3b07384-d113-4b0d-9fae-9d229a320002', 'f3b07384-d113-4b0d-9fae-9d229a320002', 'd3b07384-d113-4b0d-9fae-9d229a320002', 'e3b07384-d113-4b0d-9fae-9d229a320002', 'Autorizado', '2026-10-15', 'Paciente com osteoartrose severa de joelho direito, indicada artroplastia total.'),
  ('a3b07384-d113-4b0d-9fae-9d229a320003', 'f3b07384-d113-4b0d-9fae-9d229a320003', 'd3b07384-d113-4b0d-9fae-9d229a320003', 'e3b07384-d113-4b0d-9fae-9d229a320003', 'Pendente Docs', '2026-11-12', 'Paciente com deformidade nasal obstrutiva funcional.'),
  ('a3b07384-d113-4b0d-9fae-9d229a320004', 'f3b07384-d113-4b0d-9fae-9d229a320004', 'd3b07384-d113-4b0d-9fae-9d229a320005', 'e3b07384-d113-4b0d-9fae-9d229a320004', 'Negado', '2026-09-20', 'Hérnia inguinal bilateral sintomática.'),
  ('a3b07384-d113-4b0d-9fae-9d229a320005', 'f3b07384-d113-4b0d-9fae-9d229a320005', 'd3b07384-d113-4b0d-9fae-9d229a320004', 'e3b07384-d113-4b0d-9fae-9d229a320005', 'Aguardando Orçamento', '2026-10-25', 'Colecistopatia calculosa crônica.')
on conflict (id) do nothing;

-- 5. Inserir Itens do Orçamento
insert into budget_items (case_id, name, quantity, value, provider) values
  ('a3b07384-d113-4b0d-9fae-9d229a320001', 'Placa Ortognática 2.0mm', 4, 1200.00, 'OPME Sul Distribuidora'),
  ('a3b07384-d113-4b0d-9fae-9d229a320001', 'Parafuso de Fixação 2.0mm', 16, 150.00, 'OPME Sul Distribuidora'),
  ('a3b07384-d113-4b0d-9fae-9d229a320002', 'Prótese Total de Joelho Primária', 1, 8500.00, 'OrtoPrime Hospitalar')
on conflict (id) do nothing;
