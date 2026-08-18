# Spec.md - Especificação Técnica Completa

Documento de especificação técnica detalhada da **Mock API de Treinamentos**.

---

## 1. Visão Geral

### 1.1 Informações Gerais

| Campo | Valor |
|---|---|
| **Nome** | Mock API - Treinamentos |
| **Versão** | 1.0.0 |
| **Tipo** | REST API |
| **Status** | Ativa |
| **Ambiente** | Desenvolvimento Local |
| **Base URL** | `http://localhost:3000` |

### 1.2 Propósito

Fornecer um contrato de API stable e confiável para o desenvolvimento paralelo do aplicativo mobile React Native de gestão de treinamentos corporativos.

### 1.3 Funcionalidades Principais

1. **Autenticação Simulada** - Login/logout com tokens fake
2. **Gestão de Usuários** - CRUD de usuários e credenciais
3. **Gestão de Funcionários** - Dados de RH
4. **Gestão de Instrutores** - Professores e especialidades
5. **Gestão de Treinamentos** - Cursos, módulos, agendamentos
6. **Gerência de Participantes** - Inscrições e presença
7. **Certificação** - Emissão de certificados
8. **Evidências** - Fotos e documentos de treinamento
9. **Auditoria** - Log de ações
10. **Simulação de Cenários** - Latência, erros, timeouts, permissões

---

## 2. Especificação Técnica

### 2.1 Requisitos Não-Funcionais

| Requisito | Valor |
|---|---|
| **Runtime Mínimo** | Node.js 18.x |
| **Porta Padrão** | 3000 |
| **Protocolo** | HTTP (não-HTTPS em dev) |
| **Formato de Dados** | JSON |
| **Charset** | UTF-8 |
| **Max Request Size** | 1MB (padrão Express) |
| **Timeout Padrão** | 30s |
| **Persistência** | Arquivo (db.json) |
| **Replicação** | N/A (arquivo em disco) |
| **Backup** | Manual (copiar db.json) |

### 2.2 Dependências de Produção

```json
{
  "json-server": "^0.17.4",
  "swagger-ui-express": "^5.0.1"
}
```

| Pacote | Versão | Propósito |
|---|---|---|
| **json-server** | 0.17.4+ | Servir dados de arquivo JSON com CRUD automático |
| **swagger-ui-express** | 5.0.1+ | Interface interativa da especificação OpenAPI |

### 2.3 Dependências de Desenvolvimento

```json
{
  "nodemon": "^3.1.0"
}
```

| Pacote | Versão | Propósito |
|---|---|---|
| **nodemon** | 3.1.0+ | Auto-reload do servidor em mudanças |

---

## 3. Arquitetura da Aplicação

### 3.1 Camadas

```
┌─────────────────────────────────────────┐
│       Cliente (REST JSON)               │ ← HTTP Requests
├─────────────────────────────────────────┤
│      Layer 1: Middlewares               │
│  ├─ Logger                              │
│  ├─ Body Parser (json)                  │
│  ├─ Interceptor (error/timeout)         │
│  ├─ Latência Simulada                   │
│  ├─ Headers Padrão                      │
│  ├─ Autenticação (Bearer Token)         │
│  ├─ Validação de Permissões             │
│  └─ Validação de Entrada (body)         │
├─────────────────────────────────────────┤
│      Layer 2: Rotas Customizadas        │
│  ├─ /                (Metadados)        │
│  ├─ /health          (Status)           │
│  ├─ /api/login       (Autenticação)     │
│  ├─ /api/me          (Usuário Atual)    │
│  ├─ /api/dashboard   (Resumo)           │
│  ├─ /api/**/completo (Compostas)        │
│  └─ etc.                                │
├─────────────────────────────────────────┤
│      Layer 3: Router JSON-Server        │
│  └─ CRUD automático para db.json        │
├─────────────────────────────────────────┤
│      Layer 4: Persistent Data           │
│  └─ db.json (arquivo em disco)          │
└─────────────────────────────────────────┘
```

### 3.2 Fluxo de Requisição

```
Request HTTP
     ↓
[Logger] - Registra entrada
     ↓
[Middlewares de Parsing] - json-server defaults
     ↓
[Interceptor de Cenários] - x-force-error, x-timeout
     ↓
[Latência] - Aguarda se config.simularLatencia
     ↓
[Headers Padrão] - Cache-Control, etc
     ↓
[Documentação Estática] - /docs, /swagger
     ↓
[Autenticação] - Valida Bearer token
     ↓
[Permissões] - Valida x-permissoes header
     ↓
[Rota Customizada?]
     ├─ SIM → Processa e responde
     └─ NÃO → Continua
     ↓
[Validação de Entrada] - Campos obrigatórios, conflitos
     ↓
[Roteador JSON-Server] - CRUD automático
     ↓
[Response Formatter] - { success: true, data: ... }
     ↓
Response HTTP
```

### 3.3 Padrão de Resposta

**Sucesso (2xx):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "field": "value",
    "nested": { "..." }
  }
}
```

**Erro (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição clara do erro"
  }
}
```

---

## 4. Especificação de Dados

### 4.1 Schema de Funcionário

```typescript
interface Funcionario {
  id: number;                    // Auto-increment, único
  nome: string;                  // Obrigatório
  matricula: string;             // Obrigatório, único
  cargo: string;                 // Tipo de função
  setor: string;                 // Departamento
}
```

**Validações:**
- `nome`: Não vazio
- `matricula`: Não duplicada (409 CONFLICT)

**Exemplo:**
```json
{
  "id": 1,
  "nome": "Carlos Souza",
  "matricula": "F001",
  "cargo": "Analista de Qualidade",
  "setor": "Qualidade"
}
```

### 4.2 Schema de Instrutor

```typescript
interface Instrutor {
  id: number;                    // Auto-increment, único
  nome: string;                  // Obrigatório
  especialidade: string;         // Área de expertise (obrigatório)
  registro: string;              // Credencial profissional (ex: CREA-SP-123456)
  email: string;                 // Email
  interno: boolean;              // Funciona na empresa?
}
```

**Validações:**
- `nome`: Não vazio
- `especialidade`: Obrigatório

**Exemplo:**
```json
{
  "id": 1,
  "nome": "Marcos Oliveira",
  "especialidade": "Segurança do Trabalho",
  "registro": "CREA-SP-123456",
  "email": "marcos.oliveira@empresa.com",
  "interno": true
}
```

### 4.3 Schema de Usuário

```typescript
interface Usuario {
  id: number;                    // Auto-increment, único
  email: string;                 // Obrigatório, único
  senha: string;                 // Armazenada (não validada em mock)
  funcionarioId: number;         // FK → Funcionario
  ativo: boolean;                // Status de acesso
  criadoEm: string;              // ISO 8601 timestamp
}
```

**Validações:**
- `email`: Não duplicado (409 CONFLICT)
- `senha`: Não retornada em respostas

**Exemplo:**
```json
{
  "id": 1,
  "email": "carlo.souza@empresa.com",
  "senha": "senhaSegura123",
  "funcionarioId": 1,
  "ativo": true,
  "criadoEm": "2026-01-10T08:00:00.000Z"
}
```

### 4.4 Schema de Treinamento

```typescript
interface Treinamento {
  id: number;                    // Auto-increment
  titulo: string;                // Nome do curso (obrigatório)
  descricao: string;             // Detalhes
  cargaHoraria: number;          // Horas
  status: 'planejado' | 'em_andamento' | 'concluido';
  dataInicio: string;            // ISO 8601
  dataFim: string;               // ISO 8601
}
```

**Validações:**
- `titulo`: Não duplicado (409 CONFLICT), obrigatório

**Exemplo:**
```json
{
  "id": 1,
  "titulo": "NR-35 - Trabalho em Altura",
  "descricao": "Treinamento obrigatório conforme Norma Regulamentadora 35",
  "cargaHoraria": 8,
  "status": "concluido",
  "dataInicio": "2026-03-10T08:00:00.000Z",
  "dataFim": "2026-03-10T17:00:00.000Z"
}
```

### 4.5 Schema de Certificado

```typescript
interface Certificado {
  id: number;                    // Auto-increment
  treinamentoParticipantesId: number;  // FK
  numero: string;                // Número único (ex: CERT-2026-0001)
  dataEmissao: string;           // ISO 8601
  dataValidade: string;          // ISO 8601
  status: 'valido' | 'expirado' | 'cancelado';
}
```

**Exemplo:**
```json
{
  "id": 1,
  "treinamentoParticipantesId": 1,
  "numero": "CERT-2026-0001",
  "dataEmissao": "2026-03-11T08:00:00.000Z",
  "dataValidade": "2027-03-11T08:00:00.000Z",
  "status": "valido"
}
```

### 4.6 Schema de Evidência

```typescript
interface Evidencia {
  id: number;                    // Auto-increment
  treinamentoId: number;         // FK
  tipo: 'foto' | 'video' | 'documento' | 'audio';
  descricao: string;             // Detalhes
  arquivo: string;               // Filename
  registradoEm: string;          // ISO 8601
}
```

**Exemplo:**
```json
{
  "id": 1,
  "treinamentoId": 1,
  "tipo": "foto",
  "descricao": "Foto do participante durante a prática em altura",
  "arquivo": "evidencia_carlos_souza_nr35_2026.jpg",
  "registradoEm": "2026-03-10T14:00:00.000Z"
}
```

### 4.7 Schema de Assinatura (Presença)

```typescript
interface Assinatura {
  id: number;                    // Auto-increment
  treinamentoParticipantesId: number;  // FK
  tipo: 'lista_de_presenca' | 'eletronica';
  assinadoEm: string;            // ISO 8601
  hash: string;                  // SHA256 ou similar (validação)
}
```

**Exemplo:**
```json
{
  "id": 1,
  "treinamentoParticipantesId": 1,
  "tipo": "lista_de_presenca",
  "assinadoEm": "2026-03-10T08:30:00.000Z",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### 4.8 Schema de Auditoria

```typescript
interface Auditoria {
  id: number;                    // Auto-increment
  entidade: string;              // Tabela afetada (ex: 'certificados')
  entidadeId: number;            // ID do registro
  acao: 'criacao' | 'atualizacao' | 'exclusao' | 'leitura';
  usuarioId: number;             // FK → Usuario
  detalhe: string;               // Descrição da ação
  realizadoEm: string;           // ISO 8601
}
```

**Exemplo:**
```json
{
  "id": 1,
  "entidade": "certificados",
  "entidadeId": 1,
  "acao": "criacao",
  "usuarioId": 1,
  "detalhe": "Certificado CERT-2026-0001 emitido para Carlos Souza (NR-35)",
  "realizadoEm": "2026-03-11T08:01:00.000Z"
}
```

### 4.9 Tabelas de Relacionamento (Vínculo)

#### TreinamentoParticipantes

```typescript
interface TreinamentoParticipantes {
  id: number;
  treinamentoId: number;        // FK → Treinamento
  funcionarioId: number;        // FK → Funcionario
  status: 'inscrito' | 'em_andamento' | 'aprovado' | 'reprovado';
  inscritoEm: string;           // ISO 8601
}
```

#### TreinamentoInstrutores

```typescript
interface TreinamentoInstrutores {
  id: number;
  treinamentoId: number;        // FK → Treinamento
  instrutorId: number;          // FK → Instrutor
}
```

#### TreinamentoResponsaveis

```typescript
interface TreinamentoResponsaveis {
  id: number;
  treinamentoId: number;        // FK → Treinamento
  usuarioId: number;            // FK → Usuario
}
```

#### UsuarioPerfis

```typescript
interface UsuarioPerfis {
  id: number;
  usuarioId: number;            // FK → Usuario
  perfilId: number;             // FK → Perfil
}
```

#### PerfilPermissoes

```typescript
interface PerfilPermissoes {
  id: number;
  perfilId: number;             // FK → Perfil
  permissaoId: number;          // FK → Permissao
}
```

---

## 5. API REST Endpoints

### 5.1 Endpoints de Sistema

#### GET /

**Descrição:** Metadados da API e lista de rotas disponíveis

**Headers Requeridos:** Nenhum

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "nome": "Mock API - Treinamentos",
    "versao": "1.0.0",
    "descricao": "API Fake para desenvolvimento do aplicativo de gestão de treinamentos",
    "documentacao": "http://localhost:3000/docs",
    "dataHora": "2026-08-18T10:30:45.123Z",
    "configuracao": {
      "simularAutenticacao": false,
      "simularPermissoes": false,
      "simularErros": false,
      "simularLatencia": false
    },
    "rotas": [
      "POST   /api/login",
      "GET    /api/me",
      "GET    /api/dashboard",
      "GET    /api/funcionarios",
      "..."
    ]
  }
}
```

#### GET /health

**Descrição:** Health check do servidor

**Headers Requeridos:** Nenhum

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-08-18T10:30:45.123Z"
  }
}
```

---

### 5.2 Endpoints de Autenticação

#### POST /api/login

**Descrição:** Autentica usuário e retorna token simulado

**Headers Requeridos:** Nenhum

**Body:**
```json
{
  "email": "carlo.souza@empresa.com",
  "senha": "qualquerSenha"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "token": "token-fake",
    "refreshToken": "refresh-token-fake",
    "usuario": {
      "id": 1,
      "email": "carlo.souza@empresa.com",
      "funcionarioId": 1,
      "ativo": true,
      "criadoEm": "2026-01-10T08:00:00.000Z"
    }
  }
}
```

**Observações:**
- Não valida senha (sempre aceita)
- Sempre retorna primeiro usuário de db.json
- Token é hardcoded "token-fake"

---

#### GET /api/me

**Descrição:** Retorna dados do usuário autenticado

**Headers Requeridos:**
- `Authorization: Bearer token-fake` (se simularAutenticacao ativa)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "email": "carlo.souza@empresa.com",
      "funcionarioId": 1,
      "ativo": true,
      "criadoEm": "2026-01-10T08:00:00.000Z"
    },
    "funcionario": {
      "id": 1,
      "nome": "Carlos Souza",
      "matricula": "F001",
      "cargo": "Analista de Qualidade",
      "setor": "Qualidade"
    },
    "perfis": [
      {
        "id": 1,
        "nome": "Administrador",
        "descricao": "Acesso total ao sistema"
      }
    ]
  }
}
```

**Erros:**
- `401 UNAUTHORIZED` - Token ausente ou inválido (se simulação ativa)

---

### 5.3 Endpoints de Dashboard

#### GET /api/dashboard

**Descrição:** Retorna resumo geral do sistema (contadores)

**Headers Requeridos:**
- `Authorization: Bearer token-fake` (se simularAutenticacao ativa)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "quantidadeFuncionarios": 3,
    "quantidadeUsuarios": 2,
    "quantidadeTreinamentos": 5,
    "quantidadeInstrutores": 1,
    "quantidadeCertificados": 8
  }
}
```

---

### 5.4 Endpoints de CRUD Automático (json-server)

#### GET /api/{recurso}

Exemplo: `GET /api/funcionarios`

**Query Parameters:**
- `_page=1` - Página (1-indexed)
- `_limit=10` - Itens por página
- `_sort=nome` - Campo para ordenar
- `_order=asc|desc` - Direção
- `campo=valor` - Filtro por campo

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nome": "Carlos Souza", "matricula": "F001", ... },
    { "id": 2, "nome": "Maria Oliveira", "matricula": "F002", ... }
  ]
}
```

**Erros:**
- `400 BAD_REQUEST` - Parâmetros inválidos

---

#### POST /api/{recurso}

Exemplo: `POST /api/funcionarios`

**Body:**
```json
{
  "nome": "João Silva",
  "matricula": "F004",
  "cargo": "Engenheiro",
  "setor": "Produção"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "nome": "João Silva",
    "matricula": "F004",
    "cargo": "Engenheiro",
    "setor": "Produção"
  }
}
```

**Erros:**
- `400 VALIDATION_ERROR` - Campo obrigatório faltando (se simularErros ativa)
- `409 CONFLICT` - Valor duplicado/conflito (se simularErros ativa)

---

#### GET /api/{recurso}/{id}

Exemplo: `GET /api/funcionarios/1`

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Carlos Souza",
    "matricula": "F001",
    "cargo": "Analista de Qualidade",
    "setor": "Qualidade"
  }
}
```

**Erros:**
- `404 NOT_FOUND` - ID não existe

---

#### PUT /api/{recurso}/{id}

Exemplo: `PUT /api/funcionarios/1`

**Body:** (substitui completo)
```json
{
  "nome": "Carlos Souza Atualizado",
  "matricula": "F001",
  "cargo": "Analista Sênior",
  "setor": "Qualidade"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Carlos Souza Atualizado",
    "matricula": "F001",
    "cargo": "Analista Sênior",
    "setor": "Qualidade"
  }
}
```

---

#### PATCH /api/{recurso}/{id}

Exemplo: `PATCH /api/funcionarios/1`

**Body:** (substitui apenas campos fornecidos)
```json
{
  "cargo": "Analista Sênior"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Carlos Souza",
    "matricula": "F001",
    "cargo": "Analista Sênior",
    "setor": "Qualidade"
  }
}
```

---

#### DELETE /api/{recurso}/{id}

Exemplo: `DELETE /api/funcionarios/1`

**Resposta (200):**
```json
{
  "success": true,
  "data": {}
}
```

**Erros:**
- `404 NOT_FOUND` - ID não existe

---

### 5.5 Endpoints Compostos (Customizados)

#### GET /api/treinamentos/{id}/completo

**Descrição:** Retorna treinamento + instrutores + responsáveis + participantes + evidências

**Parâmetros:**
- `{id}` - ID do treinamento

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "treinamento": {
      "id": 1,
      "titulo": "NR-35 - Trabalho em Altura",
      "descricao": "...",
      "cargaHoraria": 8,
      "status": "concluido",
      "dataInicio": "2026-03-10T08:00:00.000Z",
      "dataFim": "2026-03-10T17:00:00.000Z"
    },
    "instrutores": [
      {
        "id": 1,
        "nome": "Marcos Oliveira",
        "especialidade": "Segurança do Trabalho",
        "registro": "CREA-SP-123456",
        "email": "marcos.oliveira@empresa.com",
        "interno": true
      }
    ],
    "responsaveis": [
      {
        "id": 1,
        "email": "carlo.souza@empresa.com",
        "funcionarioId": 1,
        "ativo": true,
        "criadoEm": "2026-01-10T08:00:00.000Z"
      }
    ],
    "participantes": [
      {
        "id": 1,
        "treinamentoId": 1,
        "funcionarioId": 1,
        "status": "aprovado",
        "inscritoEm": "2026-03-01T09:00:00.000Z"
      }
    ],
    "evidencias": [
      {
        "id": 1,
        "treinamentoId": 1,
        "tipo": "foto",
        "descricao": "Foto do participante durante a prática em altura",
        "arquivo": "evidencia_carlos_souza_nr35_2026.jpg",
        "registradoEm": "2026-03-10T14:00:00.000Z"
      }
    ]
  }
}
```

**Erros:**
- `404 NOT_FOUND` - Treinamento não existe

---

#### GET /api/certificados/{id}/completo

**Descrição:** Retorna certificado + participante + funcionário + treinamento

**Parâmetros:**
- `{id}` - ID do certificado

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "certificado": {
      "id": 1,
      "treinamentoParticipantesId": 1,
      "numero": "CERT-2026-0001",
      "dataEmissao": "2026-03-11T08:00:00.000Z",
      "dataValidade": "2027-03-11T08:00:00.000Z",
      "status": "valido"
    },
    "participante": {
      "id": 1,
      "treinamentoId": 1,
      "funcionarioId": 1,
      "status": "aprovado",
      "inscritoEm": "2026-03-01T09:00:00.000Z"
    },
    "funcionario": {
      "id": 1,
      "nome": "Carlos Souza",
      "matricula": "F001",
      "cargo": "Analista de Qualidade",
      "setor": "Qualidade"
    },
    "treinamento": {
      "id": 1,
      "titulo": "NR-35 - Trabalho em Altura",
      "descricao": "...",
      "cargaHoraria": 8,
      "status": "concluido",
      "dataInicio": "2026-03-10T08:00:00.000Z",
      "dataFim": "2026-03-10T17:00:00.000Z"
    }
  }
}
```

**Erros:**
- `404 NOT_FOUND` - Certificado não existe

---

## 6. Recursos de Simulação

### 6.1 Simulação de Latência

**Ativação:** `config.js` → `simularLatencia: true`

**Comportamento:** Cada requisição aguarda 200-500ms antes de responder (aleatório)

**Exclusões:** `/docs`, `/swagger`, `/favicon`

**Teste:**
```bash
time curl http://localhost:3000/api/funcionarios
# Resposta leva ~200-500ms
```

---

### 6.2 Simulação de Erro 500

**Header:** `x-force-error: true`

**Resposta (500):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erro interno simulado."
  }
}
```

**Teste:**
```bash
curl -H "x-force-error: true" http://localhost:3000/api/funcionarios
```

---

### 6.3 Simulação de Timeout

**Header:** `x-timeout: true`

**Comportamento:** Aguarda 10 segundos antes de responder

**Teste:**
```bash
curl -H "x-timeout: true" http://localhost:3000/api/funcionarios
# Aguarda 10s...
```

---

### 6.4 Simulação de Autenticação

**Ativação:** `config.js` → `simularAutenticacao: true`

**Comportamento:**
- Rotas públicas: `POST /api/login` (sem token)
- Rotas privadas: Exigem `Authorization: Bearer token-fake`

**Validações:**
- Header ausente → 401 UNAUTHORIZED
- Token inválido (não é "token-fake") → 401 UNAUTHORIZED

**Teste:**
```bash
# Sem token (401)
curl http://localhost:3000/api/me

# Com token válido (200)
curl -H "Authorization: Bearer token-fake" http://localhost:3000/api/me

# Com token inválido (401)
curl -H "Authorization: Bearer token-invalido" http://localhost:3000/api/me
```

---

### 6.5 Simulação de Permissões

**Ativação:** `config.js` → `simularPermissoes: true`

**Permissões Definidas:**

| Rota | Permissão Requerida |
|---|---|
| `POST /api/treinamentos` | `TREINAMENTOS:CRIAR` |
| `POST /api/usuarios` | `USUARIOS:CRIAR` |
| `POST /api/certificados` | `CERTIFICADOS:EMITIR` |

**Validação:** Header `x-permissoes` deve conter permissão

**Teste:**
```bash
# Sem permissão (403)
curl -X POST http://localhost:3000/api/treinamentos \
  -H "Authorization: Bearer token-fake" \
  -d '{"titulo": "Novo Treinamento"}'

# Com permissão (201)
curl -X POST http://localhost:3000/api/treinamentos \
  -H "Authorization: Bearer token-fake" \
  -H "x-permissoes: TREINAMENTOS:CRIAR" \
  -d '{"titulo": "Novo Treinamento"}'
```

---

### 6.6 Validação de Campos Obrigatórios

**Ativação:** `config.js` → `simularErros: true`

**Campos Obrigatórios:**

| Rota | Campos |
|---|---|
| `POST /api/usuarios` | `['email', 'senha']` |
| `POST /api/funcionarios` | `['nome', 'matricula']` |
| `POST /api/treinamentos` | `['titulo']` |
| `POST /api/instrutores` | `['nome', 'especialidade']` |

**Resposta (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campos obrigatórios ausentes: titulo."
  }
}
```

**Teste:**
```bash
# Faltando campo (400)
curl -X POST http://localhost:3000/api/treinamentos \
  -d '{}'

# Com campo obrigatório (201)
curl -X POST http://localhost:3000/api/treinamentos \
  -d '{"titulo": "Novo Treinamento"}'
```

---

### 6.7 Verificação de Conflitos

**Ativação:** `config.js` → `simularErros: true`

**Conflitos Verificados:**

| Rota | Campo | Erro |
|---|---|---|
| `POST /api/usuarios` | `email` | "E-mail já cadastrado." |
| `POST /api/funcionarios` | `matricula` | "Matrícula já cadastrada." |
| `POST /api/treinamentos` | `titulo` | "Treinamento com este título já existe." |

**Resposta (409):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "E-mail já cadastrado."
  }
}
```

**Teste:**
```bash
# Email duplicado (409)
curl -X POST http://localhost:3000/api/usuarios \
  -d '{"email": "carlo.souza@empresa.com", "senha": "123"}'
```

---

### 6.8 Modo Debug

**Ativação:** `config.js` → `modoDebug: true`

**Saída:** Headers de cada requisição aparecem no console

**Exemplo:**
```
[2026-08-18T10:30:45.123Z] GET /api/funcionarios → 200 (145ms)
  Headers: {
    "authorization": "Bearer token-fake",
    "content-type": "application/json",
    "accept": "*/*",
    "user-agent": "curl/7.68.0",
    "host": "localhost:3000"
  }
```

---

## 7. Códigos de Erro HTTP

| Status | Code | Message | Quando? |
|---|---|---|---|
| **400** | `VALIDATION_ERROR` | Campos obrigatórios ausentes | `simularErros: true` |
| **401** | `UNAUTHORIZED` | Token não informado / inválido | `simularAutenticacao: true` |
| **403** | `FORBIDDEN` | Permissão necessária: X | `simularPermissoes: true` |
| **404** | `NOT_FOUND` | Registro não encontrado | ID inexistente |
| **409** | `CONFLICT` | Violação de unicidade | `simularErros: true` |
| **500** | `INTERNAL_ERROR` | Erro interno simulado | `x-force-error: true` |

---

## 8. Headers HTTP

### 8.1 Headers de Requisição

| Header | Obrigatório | Exemplo | Uso |
|---|---|---|---|
| `Content-Type` | Não* | `application/json` | Body em JSON |
| `Authorization` | Condicional | `Bearer token-fake` | Autenticação (se simulada) |
| `x-permissoes` | Condicional | `TREINAMENTOS:CRIAR` | Permissões (se simuladas) |
| `x-force-error` | Não | `true` | Forçar erro 500 |
| `x-timeout` | Não | `true` | Simular timeout (10s) |

*Obrigatório se body present

### 8.2 Headers de Resposta

| Header | Valor | Propósito |
|---|---|---|
| `Content-Type` | `application/json; charset=utf-8` | Formato da resposta |
| `Cache-Control` | `no-store` | Não cachear |
| `X-Powered-By` | `Express` | Framework |

---

## 9. Autenticação & Autorização

### 9.1 Modelo de Autenticação

**Tipo:** Bearer Token (simulado)

**Token:** `token-fake` (hardcoded)

**Refresh Token:** `refresh-token-fake` (não é renovado)

**Validade:** Infinita (simulado)

### 9.2 Modelo de Autorização

**Padrão:** RBAC (Role-Based Access Control)

**Hierarquia:**
```
Usuario (n) ←→ (n) Perfil (n) ←→ (n) Permissao
```

**Exemplo:**
- Usuario: "carlo.souza@empresa.com"
- Perfil: "Administrador"
- Permissões: ["TREINAMENTOS:LISTAR", "TREINAMENTOS:CRIAR", ...]

### 9.3 Fluxo de Autenticação

1. **Login:** `POST /api/login` → Retorna `token-fake`
2. **Incluir Token:** `Authorization: Bearer token-fake` em requests
3. **Validação:** Middleware verifica presença e valor
4. **Sucesso:** Continua processamento
5. **Falha:** Retorna 401

---

## 10. Documentação da API

### 10.1 Swagger UI

**URL:** `http://localhost:3000/docs`

**Funcionalidades:**
- ✅ Visualizar todos os endpoints
- ✅ Ver schemas e tipos
- ✅ Testar requisições diretamente
- ✅ Ver exemplos de resposta

### 10.2 OpenAPI Spec

**URL:** `http://localhost:3000/swagger/openapi.json`

**Versão:** 3.1.0

**Uso:** Importar em ferramentas (Postman, Insomnia, etc)

---

## 11. Instalação & Execução

### 11.1 Pré-requisitos

- Node.js ≥ 18.x
- npm ≥ 9.x

### 11.2 Instalação

```bash
cd /workspaces/bruno
npm install
```

### 11.3 Execução

**Modo Produção:**
```bash
npm start
# http://localhost:3000
```

**Modo Desenvolvimento:**
```bash
npm run dev
# http://localhost:3000 com auto-reload
```

### 11.4 Verificar Instalação

```bash
curl http://localhost:3000/health
# Retorna: { "success": true, "data": { "status": "UP" } }
```

---

## 12. Performance & Limites

| Métrica | Valor |
|---|---|
| **Throughput** | ~1000 req/s (depende do hardware) |
| **Max Body Size** | 1MB |
| **Timeout** | 30s |
| **Max Connections** | Ilimitado (Node.js default) |
| **Latência Base** | <10ms |
| **Latência Simulada** | 200-500ms (configurável) |

---

## 13. Segurança

⚠️ **IMPORTANTE:** Esta é uma API FAKE para desenvolvimento. Não usar em produção.

### 13.1 Limitações

- ❌ Senhas não validadas
- ❌ Token hardcoded
- ❌ Sem HTTPS
- ❌ Sem rate limiting
- ❌ Sem CORS restritivo
- ❌ Dados em memória (resetam ao restart)

### 13.2 Uso Recomendado

- ✅ Desenvolvimento local
- ✅ Testes unitários
- ✅ Testes de UI
- ✅ Simulação de cenários

### 13.3 Não Usar Para

- ❌ Dados sensíveis
- ❌ Produção
- ❌ Integração com sistemas reais
- ❌ Armazenamento de informações críticas

---

## 14. Changelog

| Versão | Data | Mudanças |
|---|---|---|
| **1.0.0** | 2026-08-18 | Versão inicial com arquitetura completa |

---

## 15. Suporte & Troubleshooting

### 15.1 Porta 3000 Já em Uso

```bash
# Alterar porta em server.js
const PORT = 3001;

# Ou encontrar processo na porta
lsof -i :3000
kill -9 <PID>
```

### 15.2 Nodemon Não Reloading

```bash
npm install nodemon --save-dev
npm run dev
```

### 15.3 CORS Issues

Adicionar em server.js:
```javascript
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-permissoes');
  next();
});
```

### 15.4 Dados Reset ao Restart

✅ **Comportamento esperado:** db.json persiste, mas `router.db` em memória reseta.

---

## 16. Relacionamento com App Mobile

### 16.1 Contrato

A API serve como **contrato formal** entre backend e app mobile React Native.

**Responsabilidades do App:**
- Validar resposta com estrutura `{ success, data, error }`
- Tratar `error.code` específicos
- Implementar retry logic para latência/timeouts
- Armazenar token seguramente

### 16.2 Incompatibilidades Futuras

Ao migrar para API real:
- Validar se formatos de resposta mudam
- Verificar se novos campos são adicionados
- Testar permissões com dados reais
- Adaptar timeouts se latência aumentar

---

**Versão:** 1.0.0  
**Última atualização:** 2026-08-18  
**Compatível com:** Node.js ≥ 18.x
