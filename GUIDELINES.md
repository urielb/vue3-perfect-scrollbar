# BVRio — Guidelines de Engenharia

> **Fonte única da verdade.** Edite apenas em `/home/urielb/git/bvrio/GUIDELINES.md` e rode `./scripts/sync-guidelines.sh` para propagar para todos os subprojetos. Cópias em subprojetos **não devem ser editadas diretamente** — serão sobrescritas no próximo sync.

Este documento é o contrato de engenharia da BVRio. Vale para todos os projetos da workspace `bvrio/` (legados e novos), para humanos e para agentes de IA. Quando a guideline conflitar com o costume local de um projeto, **a guideline vence** — corrija o projeto, não a guideline.

---

## 0. Princípios

1. **KISS antes de DRY.** Três linhas parecidas é melhor do que uma abstração prematura. Refatore quando a duplicação dói, não antes.
2. **YAGNI.** Não adicione feature flag, fallback, ou parâmetro "para o caso de". Resolva o problema atual; o próximo problema você resolve quando aparecer.
3. **Transparência operacional.** Se um colega (ou Claude) consegue ler o repo em 10 minutos e entender o que ele faz e como rodar, está bom. Se precisa de explicação verbal, está faltando documentação.
4. **Segurança não é opcional.** Vazar credencial é sempre rollback obrigatório (rotacionar) + post-mortem. Não há "vou consertar depois".
5. **Cause raiz, não sintoma.** Se um teste falha de forma intermitente, investigue por que — não rode de novo até passar. Se um build quebra, não use `--no-verify`.

---

## 1. Engenharia

### 1.1 Estilo de código

#### Vue / Nuxt (frontend novo: Nuxt 3+)

- **Composables** sobre options API. Use `<script setup lang="ts">`.
- **Reactivity** via `ref`/`computed`/`useState` (Nuxt). Evite `reactive` em objetos grandes.
- **Pinia** para estado compartilhado entre páginas; `useState` (Nuxt) para estado simples.
- **Vuetify 3** é o design system padrão. Não misture Tailwind no mesmo componente. Se um projeto novo usar Tailwind, é decisão de equipe e vai num ADR.
- **Naming**: componentes em `PascalCase.vue`, composables `useXyz.ts` em `composables/`, páginas em `kebab-case.vue` em `pages/`.
- **i18n**: nada de string em PT hardcoded em componente novo. Use `$t('chave')` e adicione em `locales/pt.json` + `locales/en.json`.

#### Vue / Nuxt (frontend legado: Nuxt 2)

- **Não migre Nuxt 2 → Nuxt 3 oportunisticamente.** Migração é projeto, não bônus de PR. Se precisar de feature nova num app Nuxt 2, faça nele mesmo.
- Mantenha o padrão `nuxt.config.default.js` + `nuxt.config.js` local — não tente reorganizar.

#### Java (backend novo: `core-server`, Spring Boot 3 / Java 17)

- **Records** para DTOs imutáveis sempre que possível.
- **`var`** local quando o tipo é óbvio do RHS; tipo explícito quando é interface ou ajuda leitura.
- **Lombok**: permitido (`@Data`, `@Builder`, `@RequiredArgsConstructor`). Não abuse de `@SneakyThrows`.
- **Camadas**: `controller/` → `services/` → `dao/`. Controller não fala com DAO direto. Service não tem `@RestController`.
- **Organização por domínio**: pacotes como `controller/sim/`, `services/rcf/` (já é o padrão). Não crie pacotes técnicos (`utils`, `helpers`) — coloque junto do domínio que usa.
- **Exception handling**: use `@RestControllerAdvice` (já existe `RestResponseEntityExceptionHandler`). Não engula exceção em catch sem motivo documentado.

#### Java (backend legado: `bvrio-org`, `bvrio-madeira`, `capturadorMadeira`)

- **Não modernize sem necessidade.** Java 1.8 + Eclipse + Ant é o que é. Se for tocar, mantenha o estilo do arquivo.
- **Não introduza Lombok** em projeto legado que não usa.

### 1.2 Lint & Format

- **Frontend**: ESLint + Prettier configurados por projeto. **Rodar lint é obrigatório antes de PR.** Se o projeto não tem ESLint configurado, é dívida — abra issue antes de adicionar código novo.
  - Padrão recomendado: `eslint-plugin-vue` + `eslint-plugin-nuxt` + `prettier` (já presente em `portaldocodigo/`).
- **Java moderno**: Spotless + google-java-format via Maven plugin. Rode `./mvnw spotless:apply` antes de commit.
- **Java legado**: respeite o estilo do arquivo. Não rode formatador automático em arquivo legado sem combinar.

### 1.3 Testes

- **Cobertura mínima por tipo de mudança:**
  - Bug fix → teste que reproduz o bug (regressão).
  - Feature nova em path crítico (auth, persistência, integração externa) → testes de integração.
  - Refactor → testes existentes devem passar; sem teste novo é OK se a interface não mudou.
- **Não há cobertura mínima absoluta** (cobertura como meta vira teste lixo). O critério é: PR sem teste em código que merece teste é rejeitado em review.
- **Frontend**: testes E2E com Playwright (já presente em `intranet/`, `sim-anon-report/`). Testes de componente com Vitest quando o componente tem lógica não-trivial.
- **Backend Java moderno**: JUnit 5 + MockMvc para controllers. Use `@SpringBootTest` apenas quando precisar (lento). `@WebMvcTest` cobre controller; `@DataJpaTest` cobre DAO.

### 1.4 Git workflow

- **Branches:**
  - `main` é deploy-ready (homologação automática).
  - Feature: `feat/<descricao-curta>` (ex: `feat/sim-rate-limit`).
  - Bug: `fix/<descricao-curta>`.
  - Refactor sem mudança de comportamento: `refactor/<descricao>`.
- **Não faça force-push em `main`.** Em branches pessoais, OK.
- **Não amend** commit já pushado (a menos que ninguém mais tenha puxado).

### 1.5 Conventional Commits

Formato: `<tipo>(<escopo opcional>): <descrição>`

Tipos aceitos:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` reorganização sem mudança de comportamento
- `docs:` só documentação
- `test:` só testes
- `chore:` build, deps, config, scripts (não toca código de produção)
- `perf:` melhoria de performance
- `style:` formatação, lint (não toca lógica)

Exemplos bons:
```
feat(sim): rate limit por IP no SimReportController
fix(intranet): corrige redirect pós-logout do Keycloak
refactor(rcf): extrai geo-overlap para serviço dedicado
chore: bump nuxt 3.14 → 3.15 em sim-anon-report
```

Mensagens de commit em **português**, breve. O "porquê" vai no body se relevante. Não use emoji em commit.

### 1.6 Pull Requests

- **Tamanho**: PR ideal tem <400 linhas alteradas. PR grande (>800) precisa justificativa no description.
- **Descrição obrigatória**: _o quê_, _por quê_, e _como testei_.
- **Review**: 1 aprovação mínima de outro engenheiro. PRs em `core-server` que toquem `security/` ou DAO crítico exigem 2 aprovações.
- **CI verde antes de merge.** Não merge "vai dar tempo".
- **Squash merge** é o padrão (histórico de `main` linear). Branch é deletado pós-merge.
- **PR aberto >2 semanas**: ou termina, ou fecha. PR antigo é overhead.

---

## 2. Segurança & Deploy

### 2.1 Secrets — não commitar, nunca

- **Padrão `default.*.properties`/`default.*.js` da BVRio**: o arquivo `default.*` é versionado com placeholders. Você copia para `<nome>.properties`/`<nome>.js` e edita local — esse arquivo **deve estar em `.gitignore`**. Se você abrir um repo e o `.gitignore` não está protegendo, **isso é bug — reporte e corrija antes de adicionar credencial**.
- **`.env` files**: `.env`, `.env.local`, `.env.prod` **nunca** vão para o git. `.env.example` (sem valor real) pode ir.
- **Se vazou credencial em commit**: rotacione a credencial **imediatamente** (não basta `git revert` — o histórico expõe). Avise o time.
- **Não cole credencial em log** (nem em log de Claude, nem em chat). Use redaction quando precisar mostrar.

### 2.2 Keycloak (autenticação)

- **Issuer**: `https://accounts.bvrio.org`.
- **Realms**: `bvrio` (prod) | `homol-bvrio` (homol).
- **Clients**: `bvrio-prod` | `bvrio-homol`.
- **Roles em JWT**: chegam no claim `realm_access.roles` (ver `KeycloakJwtRolesConverter` em `core-server`).
- **Frontend**: roles são normalizados para UPPER_CASE em `useAuth.ts`. Use `hasRole('INTRANET')`, não `hasRole('intranet')`.
- **Nunca** misture realm: token homol em backend prod = `401`. Verifique `NUXT_PUBLIC_KEYCLOAK_REALM` antes de deploy.

### 2.3 CORS

- `core-server` → `bvrio.security.cors.allowed-origins`. Default cobre `localhost:3000` e `localhost:5173`, **não** cobre `3002` (porta do `intranet`). Adicione localmente.
- Em prod/homol, CORS é restrito por domínio. Não use `*` em produção, nunca.

### 2.4 Variáveis por ambiente

| Variável                      | Homologação                    | Produção                  |
| ----------------------------- | ------------------------------ | ------------------------- |
| `NUXT_PUBLIC_API_BASE`        | `https://homol-core.bvrio.org` | `https://core.bvrio.org`  |
| `NUXT_PUBLIC_KEYCLOAK_URL`    | `https://accounts.bvrio.org`   | idem                      |
| `NUXT_PUBLIC_KEYCLOAK_REALM`  | `homol-bvrio`                  | `bvrio`                   |
| `NUXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `bvrio-homol`               | `bvrio-prod`              |

### 2.5 Checklist pré-deploy

Mínimo, todo deploy:

- [ ] Build passou local com as variáveis de produção.
- [ ] Login Keycloak abre normalmente após deploy.
- [ ] Frontend bate no `core-server` correto (verificar Network tab).
- [ ] Endpoint crítico do app retorna 200 com token válido.
- [ ] Logs do backend não mostram exceção nova.

Em projetos sensíveis (RCF, SIM, CRA): rodar smoke-test manual num caso real antes de marcar deploy como ok.

### 2.6 Dependências

- **Não suba versão major** (Nuxt 3 → 4, Spring Boot 3.3 → 3.4) em PR de feature. Bump major é PR próprio + smoke test.
- **Vulnerabilidades**: rode `yarn audit` / `mvn dependency:tree` periodicamente. CVE crítica em produção = patch em até 7 dias.
- **Não adicione dependência nova** sem checar: (a) já tem algo similar no projeto? (b) está mantida (commit nos últimos 12 meses)? (c) licença é compatível (MIT/Apache-2.0/BSD ok; GPL/AGPL não)?

---

## 3. Uso de IA / Claude Code

### 3.1 Quando usar Claude

- **Greenfield**: scaffolding de componente, controller, teste.
- **Refactor mecânico**: rename, extract function, mover arquivos.
- **Lookup**: "onde está definido X?", "que arquivos chamam Y?"
- **Boilerplate**: i18n, formulário, CRUD básico.
- **Code review**: como segunda opinião, não como aprovador final.

### 3.2 Quando NÃO delegar

Estas decisões são humanas — Claude pode propor, você decide:

- **Arquitetura**: criar novo serviço, escolher banco, redesenhar fluxo de auth.
- **Segurança crítica**: lógica de autorização, criptografia, manipulação de credencial.
- **Escolha de dependência nova**: bibliotecas, frameworks, design systems.
- **Mudança em legado** (`bvrio-org`, `bvrio-madeira`): qualquer mudança não-trivial — pergunte humano antes.
- **Deletar código não-óbvio**: se não tem certeza por que existe, leia história + pergunte. Não delete por "achei que não usava".

### 3.3 Como revisar output do Claude

Antes de commitar código gerado por Claude:

1. **Leia o diff completo** — sem ler, não comita. "Tá funcionando" não é review.
2. **Rode build + lint + teste** local. Se um deles falhar, conserte antes do PR (Claude não termina o trabalho automaticamente, você termina).
3. **Cheque imports e dependências**: Claude às vezes inventa import path. `grep` nas declarações que ele referenciou.
4. **Cheque side effects**: ele criou arquivo novo? Mudou config? Mudou `.env.example`? Inclua no PR conscientemente.
5. **Compare com o pedido**: ele fez o que foi pedido, ou expandiu de própria conta? Se expandiu, ou aceita explicitamente, ou recusa.

### 3.4 Autoria de commits

Commits são atribuídos **somente ao autor humano**. **Não** adicione trailer `Co-Authored-By: Claude` nem qualquer co-autoria de IA — o GitHub interpreta esse trailer como co-autor e o exibe nos commits, o que não queremos. A mensagem e o conteúdo do commit são responsabilidade do autor humano (Claude pode sugerir, você revisa e aprova).

Use sua **identidade pessoal** no git, não a conta `bvrio` (que existe só para gestão dos repositórios, não é um usuário real). Antes de commitar, confira `git config user.email`: se apontar para um e-mail `@bvrio.org` (que o GitHub resolve para a conta `bvrio`), remova o override local com `git config --local --unset user.email` para herdar sua identidade global pessoal.

### 3.5 GUIDELINES.md como contrato

Este documento é instrução vinculante para Claude. Se Claude propõe algo que conflita (ex: criar `utils/` genérico, abstrair prematuramente, suprimir teste com mock), **rejeite e cite a guideline**. Claude também deve, ele mesmo, recusar pedidos que violem segurança ou conformidade descrita aqui.

### 3.6 Memória do Claude — divisão clara

- **`CLAUDE.md` (raiz e por projeto)**: arquitetura, comandos, gotchas. Atualize quando estrutura muda.
- **`GUIDELINES.md` (este arquivo)**: padrões trans-projeto. Edite na raiz, sincronize.
- **MEMORY (auto-memory file-based)**: preferências do desenvolvedor, feedback recorrente, decisões. Claude atualiza durante a conversa.

Não duplique entre eles. Se está em GUIDELINES, não copie em CLAUDE.md.

### 3.7 Planos vêm com checklist de execução

Para toda iniciativa não-trivial (algo que envolva múltiplas etapas ou PRs), Claude deve entregar **dois artefatos pareados** antes de começar a codar:

1. **Plano de design** (documento de arquitetura) — em `docs/initiatives/<nome>.md` no projeto principal afetado. Contém modelo de dados, APIs, estrutura de pacotes, riscos, decisões fechadas.
2. **Checklist de execução** (tarefas atômicas marcáveis) — em `docs/initiatives/<nome>-tasks.md`, ao lado do plano. Contém todas as ações concretas a executar, em `- [ ]` / `- [x]`.

**Regras do checklist:**
- Cada item é **atômico**: ou foi feito ou não foi (sem "meia"). Granularidade alvo: 5-30 min por item.
- Organizado por fase/PR; dentro de cada PR, agrupado por área (backend, frontend, testes, dependências externas, wrap-up).
- Inclui tarefas **externas** (pedir à infra criar bucket, criar role no Keycloak, etc), não só código.
- Claude marca `- [x]` no arquivo a cada item concluído, no mesmo PR/commit que entrega o trabalho.
- Em paralelo, Claude usa `TaskCreate`/`TaskUpdate` para visibilidade in-session — mas o **arquivo é a fonte da verdade entre sessões**.
- Quando uma sessão começa numa iniciativa com checklist existente, Claude **lê o checklist primeiro** para descobrir o ponto de retomada antes de qualquer ação.

**Why:** resiliência a interrupção de sessão. Se a conversa morre no meio, qualquer pessoa abre o checklist e vê exatamente onde parar e retomar — sem re-ler o plano inteiro nem perguntar de novo.

---

## 4. Cultura & Arquitetura

### 4.1 Comunicação

- **Issue tracker**: GitHub Issues no repo do projeto. Bug repetido em vários projetos → issue em cada repo + label `cross-project`.
- **PR description**: nunca vazia. Mínimo: o quê + por quê + como testar. Screenshot/GIF se for UI.
- **Code review**: comentário objetivo, não opinativo solto. Use `nit:` para sugestão estética opcional, `blocker:` para travar merge.
- **Não respondem em <1 dia útil?** Bate no Slack/Teams. PR estagnado é mais caro do que insistência.

### 4.2 Arquitetura — quando criar projeto novo vs estender

**Estender** (adicionar a `core-server`, ou a um Nuxt existente):
- Nova funcionalidade em domínio já existente (ex: novo endpoint em RCF).
- Compartilha auth, deploy, banco com algo existente.
- Time consegue absorver sem quebrar release de outro fluxo.

**Criar novo** (novo subdir em `bvrio/`):
- Domínio claramente separado (ex: SIM nasceu separado do RCF).
- Stack diferente justificada (ex: precisa de Python pra ML — mas pense duas vezes).
- Ciclo de release independente (deploy próprio, ownership próprio).

**Default é estender.** Cada novo projeto adiciona overhead de manutenção (CI, deploy, doc, on-call).

### 4.3 ADRs (Architectural Decision Records)

Quando registrar:
- Mudança que afeta >1 projeto.
- Escolha de stack ou dependência grande.
- Refactor estrutural irreversível em <1 sprint.

Onde: `docs/adr/000N-<titulo-curto>.md` no projeto principal afetado.

Formato mínimo (4 seções, 1 página):
```markdown
# ADR 0007: Migrar autenticação para Keycloak

## Status
Aceito — 2025-09-12

## Contexto
[1-3 parágrafos: situação atual, problema]

## Decisão
[1-2 parágrafos: o que decidimos fazer]

## Consequências
[Bullet points: trade-offs, o que muda, o que vai dar trabalho]
```

ADR não precisa ser perfeito. Precisa existir.

### 4.4 Princípios BVRio

A engenharia da BVRio existe para suportar a missão da organização: **transparência, rastreabilidade, e ação climática mensurável**. Em decisões de produto, na dúvida entre simples e correto vs complexo e impressionante: **simples e correto**, sempre. O usuário final dos nossos sistemas (produtor, auditor, denunciante anônimo, comprador internacional) não é programador — UX descomplicada > feature shine.

Acessibilidade (WCAG AA) é piso, não plus. Internacionalização (PT/EN mínimo) é piso em produto novo voltado para fora do Brasil.

---

## 5. Manutenção destas guidelines

- **Mudou padrão?** PR alterando `/home/urielb/git/bvrio/GUIDELINES.md` (raiz) + `./scripts/sync-guidelines.sh` antes de mergear o PR em qualquer subprojeto que dependa da nova regra.
- **Discordou de uma regra?** Abra issue no projeto principal afetado com proposta de mudança. Não ignore silenciosamente.
- **Versão**: este arquivo não tem versão semântica. A história está no git. Se quiser saber por que uma regra existe, `git blame`.

Última revisão estrutural: 2026-05-09.
