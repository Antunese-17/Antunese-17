# Gestão Documental de Frota

Sistema web responsivo para **controle documental multi-transportadora** voltado a TRRs
e operações de combustíveis. Permite cadastrar, consultar e controlar documentos de
várias transportadoras ao mesmo tempo — motoristas, cavalos mecânicos, tanques/implementos,
vencimentos, pendências e status operacional.

Estrutura genérica e escalável: a empresa inicial é a **Atual Via Petro**, mas a plataforma
é multiempresa e atende outras TRRs do mesmo segmento.

## Como executar

Não há build. Basta abrir o arquivo `index.html` no navegador:

```bash
# opção 1: abrir direto
xdg-open app/index.html      # Linux
open app/index.html          # macOS

# opção 2: servidor local (recomendado)
cd app && python3 -m http.server 8080
# acesse http://localhost:8080
```

**Login de demonstração:** qualquer e-mail/senha é aceito. Selecione a empresa
(Atual Via Petro ou Petro Sul) para ver o isolamento multiempresa.

## Módulos

1. **Login** — autenticação simples com seleção de empresa.
2. **Dashboard** — cards de resumo, status operacional das entidades e alertas de vencimento.
3. **Transportadoras** — empresas de transporte e documentos corporativos (IBAMA, ANP/TRR, RNTRC).
4. **Motoristas** — CNH, MOPP, ASO, toxicológico.
5. **Veículos** — cavalos mecânicos, CRLV, CIPP.
6. **Tanques/Implementos** — capacidade, compartimentos, CIV, teste hidrostático, calibração.
7. **Documentos** — repositório central com filtros por vínculo e status.
8. **Vencimentos** — documentos vencidos e a vencer (janela de 30 dias).
9. **Consulta Operacional** — verifica se um conjunto (transportadora + motorista + cavalo +
   tanque, base e produto opcionais) está **liberado, liberado com atenção, pendente ou bloqueado**.
10. **Bases de Carregamento** — exigências específicas (integração, agendamento, cadastro prévio,
    documentos obrigatórios, observações). Peso mediano, como apoio à liberação.
11. **Relatórios** — indicadores de conformidade, distribuição por status e por transportadora (export CSV).
12. **Configurações** — empresa ativa, tipos de documento e restauração dos dados de demonstração.

## Entidades

`companies`, `carriers`, `drivers`, `vehicles`, `trailers`, `documents`, `document_types`,
`loading_bases`, `loading_base_requirements`, `operations`, `operation_checks`, `users`.

O modelo de dados relacional completo (PostgreSQL, multiempresa, com
relacionamentos, índices, triggers e RLS) está em [`/db`](../db/README.md)
(`schema.sql` + `seed.sql`). A aplicação demo replica esse modelo em
`assets/js/data.js` com os mesmos nomes de campos.

## Regras de status

**Documento** (calculado automaticamente pela validade, referência 20/06/2026):

| Status | Critério |
|---|---|
| Válido | validade além da janela de alerta do tipo |
| A vencer | validade dentro da janela de alerta (`alert_days_before`, padrão 30 dias) |
| Vencido | validade no passado |
| Pendente | sem validade ou documento obrigatório ausente |
| Não aplicável | tipo sem validade ou marcado manualmente |

**Entidade** (status operacional derivado dos documentos):
`Apto` · `Atenção` (documento a vencer) · `Pendente` (obrigatório ausente) · `Bloqueado` (documento vencido).

## Arquitetura

Aplicação SPA em **HTML + CSS + JavaScript puro** (sem dependências nem build):

```
app/
├── index.html
└── assets/
    ├── css/styles.css          # design system (paleta corporativa neutra)
    └── js/
        ├── data.js             # dados mockados de demonstração
        ├── store.js            # estado, persistência (localStorage), status e queries
        ├── components.js       # UI: badges, tabelas, modal, toast, formulários
        ├── views.js            # os 12 módulos
        ├── router.js           # navegação, menu lateral, título
        └── app.js              # bootstrap, login, sessão, menu mobile
```

Os dados são persistidos no `localStorage` do navegador. Em **Configurações** é possível
restaurar a base mockada original.

## Responsividade

Menu lateral fixo no desktop e menu hambúrguer com overlay no mobile/tablet. Tabelas com
rolagem horizontal, grids fluidos e cards adaptáveis.
