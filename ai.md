# AI.md - Diretrizes para Assistentes de IA

Este arquivo contém diretrizes, contexto e padrões para assistentes de IA (como GitHub Copilot, Claude, etc.) ao trabalhar com este projeto.

## 1. Contexto do Projeto

### Nome
**Mock API de Treinamentos** - Sistema de Gestão de Treinamentos Corporativos

### Propósito
API REST fake desenvolvida com Express.js + json-server para servir como contrato durante o desenvolvimento do aplicativo mobile React Native de gestão de treinamentos.

### Público-alvo
- Desenvolvedores do app Mobile (React Native + Expo)
- Desenvolvedores backend que irão evoluir a API real
- Estudantes de programação aprendendo arquitetura de APIs

### Status
✅ Em desenvolvimento / Prototipagem

---

## 2. Stack Tecnológico

```
Runtime:         Node.js ≥ 18
Server:          Express.js (via json-server v0.17.x)
Database:        JSON em memória (db.json)
Documentation:   Swagger UI v5.x + OpenAPI 3.1.0
Dev Tool:        nodemon v3.x
```

**Linguagem:** JavaScript (compatível com CommonJS e ES Modules)

**Padrão de Código:** Node.js/Express.js moderno com middlewares funcionais

---

## 3. Estrutura do Projeto

```
bruno/
├── server.js              ← Arquivo principal (init, middlewares, rotas customizadas)
├── config.js              ← Config de simulação (sem alterar server.js)
├── db.json                ← Fonte de verdade (dados)
├── routes.json            ← Reescrita de rotas json-server
├── package.json           ← Dependências
├── README.md              ← Quick start
├── arquitetura.md         ← Documentação de arquitetura (detalhada)
├── ai.md                  ← Este arquivo (diretrizes para IA)
├── spec.md                ← Especificação técnica
├── swagger/
│   └── openapi.json       ← Spec OpenAPI 3.1 (documentação formal)
└── docs/
    └── Aula_01—Arquitetura_do_APP_Mobile.md  ← Contexto educacional
```

---

## 4. Padrões de Código

### 4.1 Estrutura de Resposta

**SEMPRE seguir este padrão em novas rotas:**

```javascript
// ✅ CORRETO
server.get('/api/novo-endpoint', (req, res) => {
  try {
    const db = router.db.getState();
    const data = /* sua lógica */;
    responder(res, data); // 200 com { success: true, data }
  } catch (error) {
    responderErro(res, 500, 'ERROR_CODE', 'Mensagem descritiva');
  }
});

// ❌ EVITAR
res.json({ data: /* ... */ }); // Não segue o padrão
res.status(200).send(/* ... */); // Não usa helper
```

### 4.2 Padrão de Middleware

```javascript
// ✅ CORRETO - Middleware bem definido
function meuMiddleware(req, res, next) {
  // 1. Validar condição
  if (!config.meiaFeature) return next();
  
  // 2. Executar lógica
  const resultado = /* ... */;
  
  // 3. Passar para próximo ou responder
  next(); // ou responder(res, data)
}

// ❌ EVITAR - Middleware sem ordem clara
function meuMiddleware(req, res, next) {
  if (condicao) responder(res, {});
  else if (outraCondicao) responderErro(res, 400, 'CODE', 'msg');
  next(); // Pode executar mesmo após responder!
}
```

### 4.3 Ordem de Middlewares (CRÍTICA)

```javascript
// server.js - Ordem importa!
server.use(logger);                    // 1️⃣  Registra tudo
server.use(middlewares);               // 2️⃣  Parsers json-server
server.use(interceptarCenarios);       // 3️⃣  Simula erros/timeouts
server.use(latencia);                  // 4️⃣  Aguarda tempo
server.use(cabecalhos);                // 5️⃣  Headers HTTP
server.use('/swagger', express.static(...)); // 6️⃣  Arquivos estáticos
server.use('/docs', swaggerUi.serve, swaggerUi.setup(...)); // 7️⃣  Swagger
server.use(verificarAutenticacao);     // 8️⃣  Valida Bearer token
server.use(verificarPermissao);        // 9️⃣  Valida x-permissoes
// ⬆️ Rotas customizadas aqui (antes do roteador)
server.use(validarRequisicao);         // 🔟 Campos obrigatórios
server.use(jsonServer.rewriter(...));  // 1️⃣1️⃣ Reescrita de rotas
server.use(router);                    // 1️⃣2️⃣ Router json-server
```

### 4.4 Convenção de Nomes

| Tipo | Padrão | Exemplo |
|---|---|---|
| **Variáveis** | camelCase | `usuarioId`, `treinamentoInstrutores` |
| **Constantes** | UPPER_SNAKE_CASE | `ROTAS_PUBLICAS`, `PERMISSOES_REQUERIDAS` |
| **Objetos de Config** | camelCase | `simularLatencia`, `modoDebug` |
| **Middlewares** | camelCase + verbo | `verificarAutenticacao`, `validarRequisicao` |
| **Rotas** | kebab-case em URLs | `/api/treinamentos`, `/api/usuarios` |
| **Campos BD** | camelCase | `treinamentoId`, `criadoEm`, `dataEmissao` |

---

## 5. Dados & Relacionamentos

### 5.1 Entidades Principais

| Entidade | Exemplo de Propriedade | Observações |
|---|---|---|
| **funcionarios** | `{id, nome, matricula, cargo, setor}` | Dados de RH |
| **instrutores** | `{id, nome, especialidade, registro, email, interno}` | Professores |
| **usuarios** | `{id, email, senha, funcionarioId, ativo, criadoEm}` | Acesso ao sistema |
| **treinamentos** | `{id, titulo, descricao, cargaHoraria, status, dataInicio, dataFim}` | Cursos |
| **certificados** | `{id, treinamentoParticipantesId, numero, dataEmissao, dataValidade, status}` | Diplomas |
| **auditorias** | `{id, entidade, entidadeId, acao, usuarioId, detalhe, realizadoEm}` | Logs |

### 5.2 Relacionamentos (Vínculo)

```
Treinamento 1 ---< * TrainamentoParticipantes >--- 1 Funcionario
Treinamento 1 ---< * TreinamentoInstrutores >--- 1 Instrutor
Treinamento 1 ---< * TreinamentoResponsaveis >--- 1 Usuario
Certificado 1 ---< 1 TreinamentoParticipantes
Usuario 1 ---< * UsuarioPerfis >--- 1 Perfil
Perfil 1 ---< * PerfilPermissoes >--- 1 Permissao
```

### 5.3 Endpoints Compostos

```javascript
// Retorna objeto complexo (rota customizada em server.js)
GET /api/treinamentos/{id}/completo
→ {
    treinamento: { ... },
    instrutores: [ ... ],
    responsaveis: [ ... ],
    participantes: [ ... ],
    evidencias: [ ... ]
  }

GET /api/certificados/{id}/completo
→ {
    certificado: { ... },
    participante: { ... },
    funcionario: { ... },
    treinamento: { ... }
  }
```

---

## 6. Configuração & Simulação

### 6.1 Arquivo config.js

```javascript
module.exports = {
  simularLatencia: false,      // true = aguarda 200-500ms
  latenciaMinima: 200,
  latenciaMaxima: 500,
  
  simularAutenticacao: false,  // true = exige Bearer token-fake
  simularPermissoes: false,    // true = exige x-permissoes header
  simularErros: false,         // true = valida campos & conflitos
  modoDebug: false             // true = exibe headers no console
};
```

**Padrão:** Sempre que adicionar nova feature, adicionar flag em config.js ANTES de implementar.

### 6.2 Quando Usar Cada Flag

| Flag | Usar quando... | Exemplo |
|---|---|---|
| `simularLatencia` | Testar UI com requisições lentas | Validar loading states, spinners |
| `simularAutenticacao` | Testar fluxo de login/auth | Integração com app mobile |
| `simularPermissoes` | Testar RBAC (Role-Based Access) | Diferentes perfis de usuário |
| `simularErros` | Testar tratamento de erros | 400 validation, 409 conflict |
| `modoDebug` | Debugar requisições | Verificar headers enviados |

---

## 7. Helpers de Resposta (Usar sempre!)

### 7.1 Função `responder()`

```javascript
// Responde com 200 + { success: true, data }
function responder(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

// Uso
responder(res, { id: 1, nome: 'Carlos' });
responder(res, usuarios, 201); // status customizado
```

### 7.2 Função `responderErro()`

```javascript
// Responde com status + { success: false, error: { code, message } }
function responderErro(res, status, code, message) {
  res.status(status).json({ success: false, error: { code, message } });
}

// Uso
responderErro(res, 400, 'VALIDATION_ERROR', 'Email obrigatório');
responderErro(res, 404, 'NOT_FOUND', 'Registro não encontrado');
responderErro(res, 403, 'FORBIDDEN', 'Permissão insuficiente');
```

---

## 8. Como Adicionar Novo Recurso

### 8.1 Passo 1: Adicionar ao db.json

```json
{
  "novoRecurso": [
    { "id": 1, "nome": "Item 1" }
  ]
}
```

✅ CRUD automático em `/api/novoRecurso` via json-server

### 8.2 Passo 2: Adicionar Validações em config.js (opcional)

```javascript
// config.js
const CAMPOS_OBRIGATORIOS = {
  'POST /api/novoRecurso': ['nome']
};

const VERIFICACOES_CONFLITO = {
  'POST /api/novoRecurso': (db, body) => {
    if (body.nome && db.novoRecurso.some(nr => nr.nome === body.nome))
      return 'Nome já existe';
    return null;
  }
};
```

### 8.3 Passo 3: Adicionar Documentação em swagger/openapi.json

```json
{
  "paths": {
    "/api/novoRecurso": {
      "get": {
        "tags": ["Novo Recurso"],
        "summary": "Listar itens",
        "responses": { "200": { "description": "Lista de itens" } }
      }
    }
  }
}
```

### 8.4 Passo 4: Adicionar Rota Customizada em server.js (se necessário)

```javascript
server.get('/api/novoRecurso/completo', (req, res) => {
  const db = router.db.getState();
  const dados = db.novoRecurso.map(nr => ({
    ...nr,
    relacionado: db.outraTabela.find(ot => ot.id === nr.id)
  }));
  responder(res, dados);
});
```

### 8.5 Passo 5: Atualizar arquitetura.md (se mudança significativa)

---

## 9. Boas Práticas

### 9.1 ✅ FAZER

- ✅ Usar helpers `responder()` e `responderErro()`
- ✅ Validar autenticação ANTES de processar
- ✅ Usar try-catch em rotas customizadas
- ✅ Ativar features via config.js
- ✅ Manter db.json atualizado
- ✅ Documentar em OpenAPI.json
- ✅ Testar com diferentes valores de config
- ✅ Usar middleware na ordem correta
- ✅ Retornar mensagens de erro descritivas
- ✅ Registrar ações em auditorias (futura integração)

### 9.2 ❌ EVITAR

- ❌ Responder diretamente com `res.json()`
- ❌ Retirar/alterar ordem de middlewares sem motivo
- ❌ Adicionar lógica complexa sem documentar
- ❌ Usar respostas inconsistentes (às vezes success, às vezes data direto)
- ❌ Fazer requisições ao db sem `router.db.getState()`
- ❌ Ignorar flags de config (simular direto no code)
- ❌ Deixar senha do usuário na resposta
- ❌ Adicionar campos sem documentar no OpenAPI.json
- ❌ Resolver requisições sem passar pelo middleware de validação
- ❌ Usar `console.log()` quando houver sistema de logging

---

## 10. Fluxo de Desenvolvimento

### 10.1 Criar Nova Feature

1. **Definir em config.js** - Adicionar flag `simularNovaFeature: false`
2. **Implementar middleware** - Se necessário
3. **Adicionar ao db.json** - Dados de exemplo
4. **Documentar em OpenAPI** - Swagger spec
5. **Registrar em server.js** - Middleware na ordem certa
6. **Testar** - Com flag ligada/desligada
7. **Documenta em arquitetura.md** - Se impacto significativo

### 10.2 Bugfix

1. **Reproduzir** - Com config específica
2. **Debugar** - Ativar `modoDebug: true`
3. **Corrigir** - Minimal change
4. **Testar** - Cenários afetados
5. **Atualizar documentação** - Se comportamento mudou

### 10.3 Refatoração

1. **Não quebrar contrato** - Respostas devem manter formato
2. **Testar** - Todos os endpoints
3. **Atualizar docs** - Se estrutura mudou
4. **Comunicar** - Equipe mobile

---

## 11. Contexto da App Mobile

### 11.1 Relacionamento

A API fake serve como **contrato** para o app mobile React Native que será desenvolvido. O app:

- Consumirá endpoints desta API
- Terá sua própria arquitetura (não espelha a API)
- Validará respostas com estrutura `{ success, data, error }`
- Implementará tratamento de erro baseado em `error.code`

### 11.2 Importante

> **A API representa os RECURSOS do sistema. O app representa as FUNCIONALIDADES e experiências do usuário.**

Implicações:
- Não alterar formato de resposta sem avisar dev mobile
- Manter endpoints estáveis durante desenvolvimento
- Adicionar novos endpoints sem remover antigos
- Documentar mudanças em CHANGELOG (futuro)

---

## 12. Debugging & Troubleshooting

### 12.1 Ativar Modo Debug

```javascript
// config.js
modoDebug: true
```

**Saída no console:**
```
[ISO_TIMESTAMP] METHOD /PATH → STATUS (RESPONSE_TIME_ms)
  Headers: { ... completo ... }
```

### 12.2 Simular Erro 500

```bash
curl -H "x-force-error: true" http://localhost:3000/api/usuarios
```

### 12.3 Simular Timeout

```bash
curl -H "x-timeout: true" http://localhost:3000/api/usuarios
# Aguarda 10s
```

### 12.4 Testar Autenticação

```bash
# Sem token (401)
curl http://localhost:3000/api/me

# Com token (200)
curl -H "Authorization: Bearer token-fake" http://localhost:3000/api/me
```

---

## 13. Roadmap & TODOs

### Fase 1 (✅ Atual)
- [x] Estrutura base com Express + json-server
- [x] Middlewares de autenticação/permissões/validação
- [x] Swagger UI + OpenAPI spec
- [x] Documentação em arquitetura.md
- [x] Config.js com features configuráveis

### Fase 2 (📋 Planejado)
- [ ] Testes automatizados (Jest/Supertest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] CHANGELOG.md (rastrear mudanças)
- [ ] Auditorias com persistência
- [ ] Logs estruturados (Winston/Morgan)
- [ ] Rate limiting simulado

### Fase 3 (🎯 Futuro)
- [ ] Migração para API real (PostgreSQL, Prisma)
- [ ] Autenticação real (JWT, OAuth2)
- [ ] Permissões baseadas em BD
- [ ] Cache (Redis)
- [ ] Relatórios & Analytics
- [ ] Webhooks

---

## 14. Contato & Suporte

- 📖 **Documentação Principal:** Ver [arquitetura.md](arquitetura.md)
- 📝 **Spec Técnica:** Ver [spec.md](spec.md)
- 🐛 **Issues:** Reportar em GitHub Issues
- 💬 **Discussões:** GitHub Discussions

---

## 15. Changelog Rápido

| Data | Mudança |
|---|---|
| 2026-08-18 | Criado ai.md com diretrizes |

---

**Última atualização:** 2026-08-18  
**Versão:** 1.0.0  
**Compatível com:** Node.js ≥ 18
