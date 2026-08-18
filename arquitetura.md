# Arquitetura - Mock API de Treinamentos

## 1. Visão Geral

A **Mock API de Treinamentos** é uma API REST fake desenvolvida com **Express.js** e **json-server**, que fornece um contrato de API para o desenvolvimento do aplicativo mobile React Native de gestão de treinamentos.

A API simula um sistema completo de gestão de treinamentos corporativos, permitindo que o desenvolvimento frontend e mobile ocorra em paralelo com a implementação backend, sem dependências críticas.

---

## 2. Objetivos da Arquitetura

- ✅ Fornecer um **contrato estável** de API durante o desenvolvimento mobile
- ✅ Simular **cenários de erro** e **latência** para testar resiliência
- ✅ Implementar **autenticação** e **permissões** fake configuráveis
- ✅ Validar **campos obrigatórios** e **conflitos de dados**
- ✅ Documentar endpoints com **Swagger UI** (OpenAPI 3.1)
- ✅ Permitir **hot-reload** em desenvolvimento com nodemon

---

## 3. Arquitetura Técnica

### 3.1 Stack Tecnológico

| Componente | Tecnologia | Versão | Propósito |
|---|---|---|---|
| **Runtime** | Node.js | ≥ 18 | Execução do servidor |
| **Web Framework** | Express.js | (via json-server) | Roteamento HTTP e middlewares |
| **Data Source** | json-server | 0.17.x | Servir dados de arquivo JSON |
| **Documentação** | Swagger UI Express | 5.x | Interface interativa OpenAPI |
| **Dev Tool** | nodemon | 3.x | Auto-reload em desenvolvimento |

### 3.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Cliente (React Native)                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    HTTP/HTTPS (REST API)
                             │
┌────────────────────────────▼────────────────────────────────────────────┐
│                       Express.js Server                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                          MIDDLEWARES                                     │
├──────────────────────────────────────────────────────────────────────────┤
│  1. Logger              (Log de requisições com timing)                  │
│  2. Latência            (Simula delay configurável 200-500ms)            │
│  3. Headers             (Cache-Control, etc)                            │
│  4. Cenários Especiais  (x-force-error, x-timeout)                      │
│  5. Autenticação        (Bearer token obrigatório em rotas privadas)     │
│  6. Permissões          (Validação de x-permissoes header)              │
│  7. Validação           (Campos obrigatórios e conflitos 400/409)        │
└──────────────────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴─────────────┐
                │                         │
        ┌───────▼────────┐        ┌──────▼────────┐
        │  Rotas Públicas │        │ Rotas Privadas │
        │  /              │        │ /api/*         │
        │  /health        │        │ (+Token)       │
        │  /docs          │        │ (+Permissões)  │
        │  /swagger       │        │                │
        └────────┬────────┘        └────────┬───────┘
                 │                         │
        ┌────────┴─────────────────────────┴────────┐
        │     JSON Server Router & Reescrita       │
        │     (routes.json: /api/* → /*)           │
        └────────┬────────────────────────────────┘
                 │
        ┌────────▼──────────────┐
        │  db.json (Data Store)  │
        │  - Funcionários        │
        │  - Instrutores         │
        │  - Usuários            │
        │  - Treinamentos        │
        │  - Participantes       │
        │  - Certificados        │
        │  - Evidências          │
        │  - Permissões & Perfis │
        │  - Auditorias          │
        └───────────────────────┘
```

---

## 4. Estrutura de Diretórios

```
bruno/
├── server.js              # Arquivo principal - Configuração do Express & Middlewares
├── config.js              # Configuração de simulação (auth, permissões, erros, latência)
├── db.json                # Dados da API (fonte de verdade)
├── routes.json            # Reescrita de rotas (/api/* → /*)
├── package.json           # Dependências e scripts
├── README.md              # Documentação de uso
│
└── swagger/
    └── openapi.json       # Especificação OpenAPI 3.1 (documentação formal)

└── docs/
    └── Aula_01—Arquitetura_do_APP_Mobile.md  # Contexto educacional
```

---

## 5. Camadas da Arquitetura

### 5.1 Camada de Entrada (server.js)

**Responsabilidades:**
- Inicializar Express.js e json-server
- Registrar middlewares na ordem correta
- Definir rotas customizadas (login, me, dashboard)
- Servir arquivos estáticos (Swagger)
- Inicializar servidor na porta 3000

**Ordem de Middlewares (importante!):**
```
1. Logger                 ← Registra todas as requisições
2. json-server defaults   ← Parsers de corpo, etc
3. Interceptar cenários   ← Simula erros/timeouts via headers
4. Latência              ← Aguarda tempo configurado
5. Headers               ← Define headers HTTP padrão
6. Swagger/Docs          ← Servir UI estática
7. Autenticação          ← Valida token Bearer
8. Permissões            ← Valida header x-permissoes
9. Validação             ← Campos obrigatórios & conflitos
10. Roteador json-server ← Serve dados do db.json
```

### 5.2 Camada de Configuração (config.js)

**Parâmetros configuráveis:**

```javascript
{
  simularLatencia: false,        // Aguarda 200-500ms em cada requisição
  latenciaMinima: 200,           // em ms
  latenciaMaxima: 500,           // em ms
  simularAutenticacao: false,    // Exige "Bearer token-fake"
  simularPermissoes: false,      // Exige header "x-permissoes"
  simularErros: false,           // Valida campos & conflitos
  modoDebug: false               // Exibe headers no console
}
```

**Uso:** Permite ativar/desativar funcionalidades de teste sem alterar código.

### 5.3 Camada de Dados (db.json)

**Entidades gerenciadas:**

| Entidade | Descrição | Exemplo |
|---|---|---|
| **funcionarios** | Dados de funcionários da empresa | `{id, nome, matricula, cargo, setor}` |
| **instrutores** | Instrutores de treinamentos | `{id, nome, especialidade, registro, email, interno}` |
| **usuarios** | Usuários do sistema com credenciais | `{id, email, senha, funcionarioId, ativo, criadoEm}` |
| **treinamentos** | Programas de treinamento | `{id, titulo, descricao, dataInicio, dataFim}` |
| **treinamentoResponsaveis** | Vínculo: Treinamento ↔ Usuário Responsável | `{id, treinamentoId, usuarioId}` |
| **treinamentoInstrutores** | Vínculo: Treinamento ↔ Instrutor | `{id, treinamentoId, instrutorId}` |
| **treinamentoParticipantes** | Participantes de treinamentos | `{id, treinamentoId, funcionarioId, presenca}` |
| **assinaturas** | Lista de presença | `{id, treinamentoParticipantesId, dataAssinatura}` |
| **evidencias** | Provas de realização de treinamento | `{id, treinamentoId, tipo, url, dataUploaded}` |
| **certificados** | Certificados de conclusão | `{id, treinamentoParticipantesId, numero, dataEmissao}` |
| **permissoes** | Definição de permissões do sistema | `{id, codigo, recurso, metodo, rotaTemplate, ehPublico}` |
| **perfis** | Papéis de usuários (Admin, Instrutor, etc) | `{id, nome, descricao}` |
| **perfilPermissoes** | Vínculo: Perfil ↔ Permissão | `{id, perfilId, permissaoId}` |
| **usuarioPerfis** | Vínculo: Usuário ↔ Perfil | `{id, usuarioId, perfilId}` |
| **auditorias** | Log de ações do sistema | `{id, acao, usuario, dataHora}` |

### 5.4 Camada de Documentação (swagger/openapi.json)

**Especificação:** OpenAPI 3.1.0

**Funcionalidades:**
- Define todos os endpoints, parâmetros e schemas
- Gera Swagger UI automático em `/docs`
- Permite testar endpoints diretamente pela interface
- Serve como contrato formal da API

---

## 6. Fluxos Principais

### 6.1 Fluxo de Login (Autenticação)

```
Cliente                          Servidor
  │
  ├─ POST /api/login            ──────────────>
  │  { email, senha }
  │
  │  <────────────────────────────────────────
  │  {
  │    token: "token-fake",
  │    refreshToken: "refresh-token-fake",
  │    usuario: { id, email, funcionarioId, ... }
  │  }
  │
  └─ Armazena token no localStorage / AsyncStorage
```

**Observações:**
- Não valida a senha (é uma API fake)
- Retorna sempre o primeiro usuário do db.json
- Token é "token-fake" hardcoded

### 6.2 Fluxo de Validação de Autenticação

```
Cliente                          Servidor
  │
  ├─ GET /api/me                ──────────────>
  │  Header: Authorization: Bearer token-fake
  │
  │  [Middleware: verificarAutenticacao]
  │  • Valida se header Authorization existe
  │  • Valida se é "Bearer token-fake"
  │
  │  <────────────────────────────────────────
  │  {
  │    usuario: { ... },
  │    funcionario: { ... },
  │    perfis: [ { ... } ]
  │  }
```

### 6.3 Fluxo de Validação de Permissões

```
Cliente                          Servidor
  │
  ├─ POST /api/treinamentos     ──────────────>
  │  Header: x-permissoes: TREINAMENTOS:CRIAR
  │  Body: { titulo: "..." }
  │
  │  [Middleware: verificarPermissao]
  │  • Extrai permissão requerida: "TREINAMENTOS:CRIAR"
  │  • Valida se header x-permissoes contém permissão
  │
  │  [Middleware: validarRequisicao]
  │  • Valida campos obrigatórios: ["titulo"]
  │  • Valida conflitos (título já existe?)
  │
  │  <────────────────────────────────────────
  │  {
  │    success: true,
  │    data: { id: 5, titulo: "...", ... }
  │  }
```

### 6.4 Fluxo de Obtenção de Treinamento Completo

```
Cliente                          Servidor
  │
  ├─ GET /api/treinamentos/1/completo  ──────>
  │
  │  [Roteador Custom]
  │  • Busca treinamento (id=1)
  │  • Busca instrutores vinculados
  │  • Busca responsáveis vinculados
  │  • Busca participantes
  │  • Busca evidências
  │
  │  <────────────────────────────────────────
  │  {
  │    success: true,
  │    data: {
  │      treinamento: { ... },
  │      instrutores: [ { ... }, ... ],
  │      responsaveis: [ { ... }, ... ],
  │      participantes: [ { ... }, ... ],
  │      evidencias: [ { ... }, ... ]
  │    }
  │  }
```

---

## 7. Endpoints Disponíveis

### 7.1 Sistema

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/` | Metadados da API e lista de rotas | ❌ Não |
| `GET` | `/health` | Health check (status: "UP") | ❌ Não |

### 7.2 Autenticação

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/login` | Login com email/senha | ❌ Não |
| `GET` | `/api/me` | Dados do usuário logado | ✅ Sim |

### 7.3 Dashboard

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/dashboard` | Resumo geral (quantidades) | ✅ Sim |

### 7.4 Recursos Principais (CRUD)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/funcionarios` | Lista todos |
| `POST` | `/api/funcionarios` | Cria novo (requer: `nome`, `matricula`) |
| `GET` | `/api/funcionarios/:id` | Busca por ID |
| `PUT` | `/api/funcionarios/:id` | Atualiza |
| `DELETE` | `/api/funcionarios/:id` | Deleta |
| *idem* | `/api/instrutores` | Instrutores |
| *idem* | `/api/usuarios` | Usuários |
| *idem* | `/api/treinamentos` | Treinamentos |
| *idem* | `/api/certificados` | Certificados |

### 7.5 Recursos Compostos

| Método | Rota | Descrição | Retorna |
|---|---|---|---|
| `GET` | `/api/treinamentos/:id/completo` | Treinamento + instrutores + responsáveis + participantes + evidências | Objeto complexo |
| `GET` | `/api/certificados/:id/completo` | Certificado + participante + funcionário + treinamento | Objeto complexo |

---

## 8. Formato Padrão de Respostas

### 8.1 Sucesso (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Carlos Souza",
    "...": "..."
  }
}
```

### 8.2 Lista (200 OK)

```json
{
  "success": true,
  "data": [
    { "id": 1, "..." },
    { "id": 2, "..." }
  ]
}
```

### 8.3 Erro (4xx/5xx)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campos obrigatórios ausentes: titulo."
  }
}
```

**Códigos de erro comuns:**

| Status | Code | Significado |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Campo obrigatório ausente |
| 401 | `UNAUTHORIZED` | Token inválido ou ausente |
| 403 | `FORBIDDEN` | Permissão insuficiente |
| 404 | `NOT_FOUND` | Recurso não encontrado |
| 409 | `CONFLICT` | Conflito de dados (email duplicado, etc) |
| 500 | `INTERNAL_ERROR` | Erro interno simulado (via header x-force-error) |

---

## 9. Recursos de Simulação

### 9.1 Latência Artificial

**Objetivo:** Testar comportamento da UI durante requisições lentas

**Ativação:**
```javascript
// config.js
simularLatencia: true,
latenciaMinima: 200,   // 200ms
latenciaMaxima: 500    // 500ms
```

**Efeito:** Cada requisição aguarda 200-500ms antes de responder

**Exceções:** Assets estáticos (/docs, /swagger, /favicon) não sofrem latência

### 9.2 Cenários de Erro Simulados

**1. Erro 500 (Internal Server Error)**

```bash
curl -H "x-force-error: true" http://localhost:3000/api/usuarios
# Retorna: 500 { success: false, error: { code: "INTERNAL_ERROR" } }
```

**2. Timeout Simulado (10 segundos)**

```bash
curl -H "x-timeout: true" http://localhost:3000/api/usuarios
# Aguarda 10s, depois retorna resposta
```

### 9.3 Autenticação Fake

**Ativação:**
```javascript
// config.js
simularAutenticacao: true
```

**Comportamento:**
- Rotas públicas: `POST /api/login` (sem token)
- Rotas privadas: Exigem `Authorization: Bearer token-fake`

**Teste:**
```bash
# Sem token (401)
curl http://localhost:3000/api/me

# Com token correto (200)
curl -H "Authorization: Bearer token-fake" http://localhost:3000/api/me

# Com token errado (401)
curl -H "Authorization: Bearer token-invalido" http://localhost:3000/api/me
```

### 9.4 Validação de Permissões

**Ativação:**
```javascript
// config.js
simularPermissoes: true
```

**Permissões definidas:**
```javascript
const PERMISSOES_REQUERIDAS = {
  'POST /api/treinamentos': 'TREINAMENTOS:CRIAR',
  'POST /api/usuarios': 'USUARIOS:CRIAR',
  'POST /api/certificados': 'CERTIFICADOS:EMITIR'
};
```

**Teste:**
```bash
# Sem permissão (403)
curl -X POST http://localhost:3000/api/treinamentos \
  -H "Authorization: Bearer token-fake" \
  -d '{"titulo": "Segurança"}'

# Com permissão (201)
curl -X POST http://localhost:3000/api/treinamentos \
  -H "Authorization: Bearer token-fake" \
  -H "x-permissoes: TREINAMENTOS:CRIAR" \
  -d '{"titulo": "Segurança"}'
```

### 9.5 Validação de Campos Obrigatórios

**Ativação:**
```javascript
// config.js
simularErros: true
```

**Validações definidas:**
```javascript
const CAMPOS_OBRIGATORIOS = {
  'POST /api/usuarios': ['email', 'senha'],
  'POST /api/funcionarios': ['nome', 'matricula'],
  'POST /api/treinamentos': ['titulo'],
  'POST /api/instrutores': ['nome', 'especialidade']
};
```

**Teste:**
```bash
# Sem campo obrigatório (400)
curl -X POST http://localhost:3000/api/treinamentos \
  -d '{}'
# Retorna: { success: false, error: { code: "VALIDATION_ERROR", message: "Campos obrigatórios ausentes: titulo." } }

# Com campo obrigatório (201)
curl -X POST http://localhost:3000/api/treinamentos \
  -d '{"titulo": "Segurança do Trabalho"}'
```

### 9.6 Verificação de Conflitos

**Ativação:**
```javascript
// config.js
simularErros: true
```

**Conflitos definidos:**
```javascript
const VERIFICACOES_CONFLITO = {
  'POST /api/usuarios': (db, body) => {
    // Verifica se email já existe
    if (body.email && db.usuarios.some(u => u.email === body.email))
      return 'E-mail já cadastrado.';
  },
  'POST /api/funcionarios': (db, body) => {
    // Verifica se matrícula já existe
    if (body.matricula && db.funcionarios.some(f => f.matricula === body.matricula))
      return 'Matrícula já cadastrada.';
  }
};
```

**Teste:**
```bash
# Email duplicado (409)
curl -X POST http://localhost:3000/api/usuarios \
  -d '{"email": "carlo.souza@empresa.com", "senha": "123"}'
# Retorna: { success: false, error: { code: "CONFLICT", message: "E-mail já cadastrado." } }
```

### 9.7 Modo Debug

**Ativação:**
```javascript
// config.js
modoDebug: true
```

**Efeito:** Exibe headers de cada requisição no console:
```
[2026-08-18T10:30:45.123Z] GET /api/funcionarios → 200 (145ms)
  Headers: {
    "user-agent": "curl/7.68.0",
    "accept": "*/*",
    ...
  }
```

---

## 10. Instalação e Execução

### 10.1 Pré-requisitos

- Node.js ≥ 18
- npm ou yarn

### 10.2 Instalação

```bash
cd /workspaces/bruno
npm install
```

### 10.3 Execução

**Modo Produção:**
```bash
npm start
# Servidor em http://localhost:3000
```

**Modo Desenvolvimento (com hot-reload):**
```bash
npm run dev
# Servidor em http://localhost:3000 com nodemon
```

### 10.4 Acessar API

- **Documentação Interativa:** http://localhost:3000/docs
- **Spec OpenAPI:** http://localhost:3000/swagger/openapi.json
- **Health Check:** http://localhost:3000/health
- **Metadados:** http://localhost:3000

---

## 11. Decisões Arquiteturais

### 11.1 Por que json-server?

✅ **Vantagens:**
- Zero configuração necessária
- CRUD automático para db.json
- Reescrita de rotas simples
- Prototipagem rápida

### 11.2 Por que Express.js + json-server?

✅ **Combinação ideal para:**
- Manter controle sobre middlewares e rotas customizadas
- Implementar autenticação/permissões simuladas
- Servir Swagger UI junto
- Adicionar lógica especial (latência, cenários de erro)

### 11.3 Por que Swagger UI?

✅ **Benefícios:**
- Documentação interativa
- Testar endpoints sem ferramentas externas
- Contrato formal (OpenAPI 3.1)
- Auto-descoberta de endpoints

### 11.4 Por que separar em middlewares?

✅ **Razões:**
- **Modulação:** Cada middleware faz uma coisa
- **Flexibilidade:** Fácil ativar/desativar via config.js
- **Testabilidade:** Cada middleware pode ser testado isoladamente
- **Manutenibilidade:** Fácil adicionar novos cenários

### 11.5 Por que formato de resposta padrão?

✅ **Benefícios:**
- Cliente sabe sempre onde encontrar dados (`response.data`)
- Erros sempre têm `code` e `message` estruturados
- Simplifica tratamento de respostas no frontend
- Fácil diferenciar sucesso de erro (`response.success`)

### 11.6 Por que separar config.js?

✅ **Motivos:**
- Permite testar diferentes cenários sem alterar código
- Simula comportamento real (latência, timeouts, erros)
- Facilita testes de resiliência da UI
- Sem necessidade de recompilação

---

## 12. Extensibilidade

### 12.1 Adicionar novo middleware

```javascript
// server.js
function meuMiddleware(req, res, next) {
  // Sua lógica
  next();
}

server.use(meuMiddleware); // Registrar na ordem desejada
```

### 12.2 Adicionar nova rota customizada

```javascript
// server.js
server.get('/api/metricas', (req, res) => {
  const db = router.db.getState();
  responder(res, {
    totalFuncionarios: db.funcionarios.length,
    totalTreinamentos: db.treinamentos.length,
    // ... mais métricas
  });
});
```

### 12.3 Adicionar novo recurso ao db.json

```json
{
  "funcionarios": [...],
  "novoRecurso": [
    { "id": 1, "..." },
    { "id": 2, "..." }
  ]
}
```

CRUD automático em `/api/novoRecurso` via json-server.

### 12.4 Adicionar validação customizada

```javascript
// server.js
const VERIFICACOES_CONFLITO = {
  // ... existentes
  'POST /api/novoRecurso': (db, body) => {
    if (/* sua validação */) {
      return 'Mensagem de erro customizada.';
    }
    return null;
  }
};
```

---

## 13. Relacionamento com o App Mobile

A documentação educacional em `docs/Aula_01—Arquitetura_do_APP_Mobile.md` indica que:

- ✅ O app Mobile será desenvolvido com **React Native + Expo + TypeScript**
- ✅ A API é um **contrato formal** entre frontend e backend
- ✅ A API não determina a estrutura do app (dados ≠ funcionalidades)
- ✅ O app terá sua própria **arquitetura em camadas** independente da API
- ✅ Separação entre **interface do usuário** e **acesso aos dados** é crítica

**Implicações para a API:**
- Endpoints devem ser estáveis e bem documentados
- Respostas devem ser previsíveis e estruturadas
- Simulações (latência, erros) ajudam a validar resiliência do app

---

## 14. Considerações de Segurança

⚠️ **IMPORTANTE:** Esta é uma API **FAKE** para desenvolvimento. NÃO usar em produção.

### 14.1 Limitações

- Senhas não são validadas (login aceita qualquer senha)
- Token é hardcoded ("token-fake")
- Permissões são simuladas (header x-permissoes)
- Não há HTTPS
- Dados em memória (resetam ao reiniciar servidor)

### 14.2 Uso Recomendado

- ✅ Desenvolvimento local
- ✅ Testes de UI
- ✅ Prototipagem
- ✅ Simulação de cenários de erro

### 14.3 Não recomendado para

- ❌ Produção
- ❌ Dados confidenciais
- ❌ Autenticação real

---

## 15. Métricas e Monitoramento

### 15.1 Log de Requisições

Todos os requests são logados com formato:
```
[ISO_TIMESTAMP] METHOD PATH → STATUS_CODE (RESPONSE_TIME_MS)
```

**Exemplo:**
```
[2026-08-18T10:30:45.123Z] GET /api/funcionarios → 200 (145ms)
```

### 15.2 Debug Mode

Quando `modoDebug: true`, headers são exibidos:
```
[2026-08-18T10:30:45.123Z] GET /api/funcionarios → 200 (145ms)
  Headers: {
    "authorization": "Bearer token-fake",
    "content-type": "application/json",
    ...
  }
```

### 15.3 Métricas Disponíveis via Dashboard

```bash
GET /api/dashboard
{
  "quantidadeFuncionarios": 3,
  "quantidadeUsuarios": 2,
  "quantidadeTreinamentos": 5,
  "quantidadeInstrutores": 1,
  "quantidadeCertificados": 8
}
```

---

## 16. Troubleshooting

### Problema: Porta 3000 já está em uso

```bash
# Altere a porta em server.js
const PORT = 3001; // ou outro número livre
```

### Problema: nodemon não faz reload

```bash
# Instale novamente
npm install nodemon --save-dev

# Ou execute manualmente
npm start
```

### Problema: Dados não atualizam após restart

✅ **Comportamento esperado:** db.json persiste no disco, mas se você editar em tempo real, pode precisar reiniciar.

### Problema: CORS com React Native

A API não define headers CORS explicitamente. Se precisar, adicione:

```javascript
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-permissoes');
  next();
});
```

---

## 17. Próximos Passos

1. **Desenvolvimento Mobile:** Iniciar app React Native
2. **Integração da API:** Consumir endpoints do mobile app
3. **Testes:** Validar autenticação, permissões e erros
4. **Evolução:** Adicionar novos recursos conforme demanda
5. **Documentação:** Manter OpenAPI.json atualizado

---

## 18. Referências

- **Express.js:** https://expressjs.com/
- **json-server:** https://github.com/typicode/json-server
- **Swagger UI:** https://swagger.io/tools/swagger-ui/
- **OpenAPI 3.1:** https://spec.openapis.org/oas/v3.1.0
- **React Native:** https://reactnative.dev/
- **Expo:** https://docs.expo.dev/

---

**Versão:** 1.0.0  
**Última atualização:** 2026-08-18  
**Autor:** Equipe de Desenvolvimento
