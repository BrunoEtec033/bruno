# Mock API — Treinamentos

API Fake construída com **json-server** e **Express**, documentada com **Swagger UI**.

Serve como contrato para o desenvolvimento do aplicativo React Native de gestão de treinamentos.

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| Node.js | ≥ 18 |
| json-server | 0.17.x |
| swagger-ui-express | 5.x |
| nodemon (dev) | 3.x |

---

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar em modo produção
npm start

# Iniciar em modo desenvolvimento (hot-reload)
npm run dev
```

---

## Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `npm start` | `node server.js` | Servidor em produção |
| `npm run dev` | `nodemon server.js` | Servidor com hot-reload |

---

## Estrutura do projeto

```
mock-api/
├── server.js          # Servidor principal
├── db.json            # Dados da API (fonte de verdade)
├── routes.json        # Reescrita de rotas (/api/* → /*)
├── package.json
├── README.md
└── swagger/
    └── openapi.json   # Especificação OpenAPI 3.1
```

---

## URLs disponíveis

| URL | Descrição |
|---|---|
| `http://localhost:3000` | Informações da API |
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/docs` | Swagger UI (documentação interativa) |
| `http://localhost:3000/swagger/openapi.json` | Spec OpenAPI 3.1 |

---

## Formato das respostas

Todas as respostas seguem o mesmo envelope:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "NAO_ENCONTRADO",
    "message": "Recurso não encontrado"
  }
}
```

---

## Endpoints

### Sistema

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Metadados e lista de rotas |
| GET | `/health` | Health check |

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/login` | Login simulado (retorna token-fake) |
| GET | `/api/me` | Usuário logado com perfis |

### Dashboard

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/dashboard` | Contadores gerais do sistema |

### CRUD — Recursos

Todos os recursos abaixo suportam operações completas de CRUD:

| Rota | Recurso |
|---|---|
| `/api/funcionarios` | Funcionários |
| `/api/instrutores` | Instrutores |
| `/api/usuarios` | Usuários |
| `/api/perfis` | Perfis |
| `/api/permissoes` | Permissões |
| `/api/perfilPermissoes` | Perfil × Permissão |
| `/api/usuarioPerfis` | Usuário × Perfil |
| `/api/treinamentos` | Treinamentos |
| `/api/treinamentoResponsaveis` | Responsáveis por treinamento |
| `/api/treinamentoInstrutores` | Instrutores por treinamento |
| `/api/treinamentoParticipantes` | Participantes por treinamento |
| `/api/assinaturas` | Assinaturas de presença |
| `/api/evidencias` | Evidências |
| `/api/certificados` | Certificados |
| `/api/auditorias` | Auditorias |

**Operações disponíveis por recurso:**

```
GET    /api/{recurso}       → listar
POST   /api/{recurso}       → criar
GET    /api/{recurso}/:id   → buscar por ID
PUT    /api/{recurso}/:id   → substituir
PATCH  /api/{recurso}/:id   → atualizar parcialmente
DELETE /api/{recurso}/:id   → excluir
```

### Recursos compostos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/treinamentos/:id/completo` | Treinamento com instrutores, responsáveis, participantes e evidências |
| GET | `/api/certificados/:id/completo` | Certificado com participante, funcionário e treinamento |

---

## Parâmetros suportados

### Paginação

```
GET /api/treinamentos?_page=1&_limit=10
GET /api/usuarios?_page=2&_per_page=5
GET /api/funcionarios?_start=0&_end=5
```

### Ordenação

```
GET /api/usuarios?_sort=nome
GET /api/treinamentos?_sort=dataInicio&_order=desc
```

### Filtros por campo

```
GET /api/usuarios?ativo=true
GET /api/funcionarios?setor=Qualidade
GET /api/treinamentos?status=concluido
GET /api/certificados?status=valido
```

### Busca textual

```
GET /api/funcionarios?q=Carlos
GET /api/treinamentos?q=NR-35
```

---

## Exemplos de uso

### Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlo.souza@empresa.com","senha":"senhaSegura123"}'
```

### Dashboard

```bash
curl http://localhost:3000/api/dashboard
```

### Listar treinamentos com filtro e ordenação

```bash
curl "http://localhost:3000/api/treinamentos?status=concluido&_sort=dataInicio&_order=desc"
```

### Treinamento completo

```bash
curl http://localhost:3000/api/treinamentos/1/completo
```

### Busca textual

```bash
curl "http://localhost:3000/api/funcionarios?q=Carlos"
```

---

## Características técnicas

- **Latência:** 200–500ms configurável via `config.js` (`simularLatencia`, `latenciaMinima`, `latenciaMaxima`)
- **CORS:** liberado para todas as origens
- **Cache-Control:** `no-store` em todas as respostas
- **Logs:** método, rota, status e tempo em cada requisição; headers exibidos quando `modoDebug: true`
- **Porta:** 3000 (fixa)
- **Token fake:** `token-fake`

---

## Configuração (config.js)

Edite o arquivo `config.js` na raiz do projeto para controlar os comportamentos simulados:

```js
module.exports = {
  simularLatencia:     true,   // atraso nas respostas
  latenciaMinima:      200,    // ms
  latenciaMaxima:      500,    // ms
  simularAutenticacao: true,   // exige Authorization: Bearer token-fake
  simularPermissoes:   true,   // exige x-permissoes header em rotas restritas
  simularErros:        true,   // valida campos obrigatórios e conflitos
  modoDebug:           false   // exibe headers no console
};
```

---

## Cenários de Teste

Esta API foi construída para exercitar cenários comuns no desenvolvimento de aplicativos React Native. Use os headers abaixo para acionar cada comportamento.

### 401 — Token não informado
Requisite qualquer rota `/api/*` (exceto `POST /api/login`) sem o header `Authorization`.

```
GET /api/funcionarios
```
> Resposta: `{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Token não informado." } }`

### 401 — Token inválido
Envie um token diferente de `token-fake`.

```
Authorization: Bearer token-errado
```
> Resposta: `{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Token inválido." } }`

### 403 — Permissão negada
Acesse um endpoint restrito sem o header `x-permissoes` adequado.

```
POST /api/treinamentos
Authorization: Bearer token-fake
Content-Type: application/json
```
> Resposta: `{ "success": false, "error": { "code": "FORBIDDEN", "message": "Permissão necessária: TREINAMENTOS:CRIAR" } }`

Para liberar, adicione:
```
x-permissoes: TREINAMENTOS:CRIAR
```

Endpoints restritos e suas permissões:
| Endpoint | Permissão requerida |
|---|---|
| `POST /api/treinamentos` | `TREINAMENTOS:CRIAR` |
| `POST /api/usuarios` | `USUARIOS:CRIAR` |
| `POST /api/certificados` | `CERTIFICADOS:EMITIR` |

### 404 — Recurso não encontrado
```
GET /api/treinamentos/9999/completo
Authorization: Bearer token-fake
```
> Resposta: `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Registro não encontrado." } }`

### 400 — Campos obrigatórios ausentes
```
POST /api/usuarios
Authorization: Bearer token-fake
x-permissoes: USUARIOS:CRIAR
Content-Type: application/json

{ "nome": "Sem email" }
```
> Resposta: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Campos obrigatórios ausentes: email, senha." } }`

Campos obrigatórios por endpoint:
| Endpoint | Campos |
|---|---|
| `POST /api/usuarios` | `email`, `senha` |
| `POST /api/funcionarios` | `nome`, `matricula` |
| `POST /api/treinamentos` | `titulo` |
| `POST /api/instrutores` | `nome`, `especialidade` |

### 409 — Conflito (dado duplicado)
```
POST /api/usuarios
Authorization: Bearer token-fake
x-permissoes: USUARIOS:CRIAR
Content-Type: application/json

{ "email": "carlo.souza@empresa.com", "senha": "123" }
```
> Resposta: `{ "success": false, "error": { "code": "CONFLICT", "message": "E-mail já cadastrado." } }`

### 500 — Erro interno simulado
Adicione o header `x-force-error: true` em qualquer requisição.

```
GET /api/funcionarios
Authorization: Bearer token-fake
x-force-error: true
```
> Resposta: `{ "success": false, "error": { "code": "INTERNAL_ERROR", "message": "Erro interno simulado." } }`

### Timeout simulado
Adicione o header `x-timeout: true`. A resposta virá com 10 segundos de atraso.

```
GET /api/treinamentos
Authorization: Bearer token-fake
x-timeout: true
```

### Latência configurável
Altere `latenciaMinima` e `latenciaMaxima` no `config.js` para simular redes lentas. Use `simularLatencia: false` para respostas instantâneas.

