# Modelagem de dados — Gestão Documental de Frota

Esquema relacional **PostgreSQL** multiempresa (multi-tenant) para o sistema de
controle documental de frota.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `schema.sql` | DDL completo: tabelas, relacionamentos, índices, enums (via CHECK), triggers de `updated_at` e bloco de RLS pronto para ativar. |
| `seed.sql` | Dados de demonstração (2 empresas, transportadoras, motoristas, veículos, tanques, documentos válidos/a vencer/vencidos, bases e exigências). |

## Como aplicar

```bash
createdb frota
psql -d frota -f schema.sql
psql -d frota -f seed.sql
```

Em Supabase/Postgres gerenciado, rode o conteúdo de `schema.sql` como uma migration.

## Tabelas (12)

| Tabela | Papel | Principais relacionamentos |
|---|---|---|
| `companies` | Empresas/tenants da plataforma | — |
| `users` | Usuários do sistema | `company_id → companies` |
| `carriers` | Transportadoras | `company_id → companies` |
| `drivers` | Motoristas | `company_id`, `carrier_id` |
| `vehicles` | Cavalos mecânicos | `company_id`, `carrier_id` |
| `trailers` | Tanques / implementos | `company_id`, `carrier_id` |
| `document_types` | Catálogo de tipos de documento | — (global) |
| `documents` | Documentos das entidades | `company_id`, `document_type_id`, vínculo polimórfico `(entity_type, entity_id)` |
| `loading_bases` | Bases de carregamento | `company_id` |
| `loading_base_requirements` | Exigências documentais por base | `company_id`, `loading_base_id`, `document_type_id` |
| `operations` | Consultas operacionais (conjunto) | `company_id`, `carrier_id`, `driver_id`, `vehicle_id`, `trailer_id`, `loading_base_id` |
| `operation_checks` | Itens verificados em cada consulta | `operation_id → operations` |

## Decisões de modelagem

- **Multi-tenant por `company_id`.** Toda tabela de negócio carrega `company_id`,
  permitindo várias empresas no mesmo banco com isolamento total. O bloco de
  **RLS** (Row Level Security) ao final de `schema.sql` está pronto para ativar:
  o app define `SET app.current_company_id = '<uuid>'` e as políticas restringem
  cada linha à empresa corrente.
- **Vínculo polimórfico em `documents`.** Um documento aponta para qualquer
  entidade via `(entity_type, entity_id)`, evitando 5 colunas FK opcionais.
- **`loading_base_requirements` normalizada.** Uma linha por
  (base, tipo de documento, entidade alvo), com flags `is_required` e
  `is_blocking` — substitui a lista textual anterior e permite consultas e
  cruzamentos diretos no banco.
- **Status calculado vs. persistido.** O status do documento
  (`valido / a_vencer / vencido / pendente / nao_aplicavel`) é derivado pela
  aplicação a partir de `expiration_date`, `has_expiration` e `alert_days_before`
  do tipo; a coluna `status` guarda o snapshot. O status operacional das
  entidades (`apto / atencao / pendente / bloqueado`) é computado a partir dos
  documentos; a coluna `status` das entidades guarda o estado administrativo
  (`ativo / inativo / bloqueado`), que também influencia a liberação.
- **Integridade.** FKs com `ON DELETE CASCADE` em dependentes e `SET NULL` em
  `operations` (preserva histórico mesmo se uma entidade for removida);
  `ON DELETE RESTRICT` em `documents → document_types`. Índices em todas as FKs e
  em `documents.expiration_date` (consultas de vencimento). Triggers mantêm
  `updated_at`.

> A aplicação demo (`/app`) usa uma réplica deste modelo em JavaScript
> (`assets/js/data.js`), com os mesmos nomes de campos, persistida em
> `localStorage`. O esquema SQL é a fonte de verdade para um back-end real.
