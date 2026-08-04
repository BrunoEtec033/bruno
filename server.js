const jsonServer = require('json-server');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// ─── Setup ────────────────────────────────────────────────────────────────────

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ logger: false });

const openApiSpec = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'swagger', 'openapi.json'), 'utf-8')
);

const PORT = 3000;

// ─── Constantes de simulação ──────────────────────────────────────────────────

// Rotas /api/* que não exigem token
const ROTAS_PUBLICAS = ['POST /api/login'];

// Permissão necessária por operação (POST em recursos restritos)
const PERMISSOES_REQUERIDAS = {
  'POST /api/treinamentos': 'TREINAMENTOS:CRIAR',
  'POST /api/usuarios':     'USUARIOS:CRIAR',
  'POST /api/certificados': 'CERTIFICADOS:EMITIR'
};

// Campos obrigatórios por endpoint POST
const CAMPOS_OBRIGATORIOS = {
  'POST /api/usuarios':     ['email', 'senha'],
  'POST /api/funcionarios': ['nome', 'matricula'],
  'POST /api/treinamentos': ['titulo'],
  'POST /api/instrutores':  ['nome', 'especialidade']
};

// Verificações de conflito (409) por endpoint POST
const VERIFICACOES_CONFLITO = {
  'POST /api/usuarios': (db, body) => {
    if (body.email && db.usuarios.some(u => u.email === body.email))
      return 'E-mail já cadastrado.';
    return null;
  },
  'POST /api/funcionarios': (db, body) => {
    if (body.matricula && db.funcionarios.some(f => f.matricula === body.matricula))
      return 'Matrícula já cadastrada.';
    return null;
  },
  'POST /api/treinamentos': (db, body) => {
    if (body.titulo && db.treinamentos.some(t => t.titulo === body.titulo))
      return 'Treinamento com este título já existe.';
    return null;
  }
};

// ─── Helpers de resposta ──────────────────────────────────────────────────────

function responder(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

function responderErro(res, status, code, message) {
  res.status(status).json({ success: false, error: { code, message } });
}

// ─── Middlewares ──────────────────────────────────────────────────────────────

// Log de requisições; exibe headers quando modoDebug = true
function logger(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
    if (config.modoDebug) {
      console.log('  Headers:', JSON.stringify(req.headers, null, 2));
    }
  });
  next();
}

// Latência artificial configurável; ignora assets estáticos
function latencia(req, res, next) {
  if (!config.simularLatencia) return next();
  const excluidos = ['/docs', '/swagger', '/favicon'];
  if (excluidos.some(p => req.path.startsWith(p))) return next();
  const { latenciaMinima: min, latenciaMaxima: max } = config;
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  setTimeout(next, ms);
}

// Cabeçalhos HTTP padrão
function cabecalhos(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  next();
}

// Cenários especiais: x-force-error (500) e x-timeout (espera 10s)
function interceptarCenarios(req, res, next) {
  if (req.headers['x-force-error'] === 'true') {
    return responderErro(res, 500, 'INTERNAL_ERROR', 'Erro interno simulado.');
  }
  if (req.headers['x-timeout'] === 'true') {
    return setTimeout(
      () => responder(res, { mensagem: 'Resposta após timeout simulado.' }),
      10000
    );
  }
  next();
}

// Autenticação fake: Bearer token-fake obrigatório nas rotas privadas
function verificarAutenticacao(req, res, next) {
  if (!config.simularAutenticacao) return next();
  if (!req.path.startsWith('/api/')) return next();

  const chave = `${req.method} ${req.path}`;
  if (ROTAS_PUBLICAS.includes(chave)) return next();

  const auth = req.headers['authorization'] || '';
  if (!auth) {
    return responderErro(res, 401, 'UNAUTHORIZED', 'Token não informado.');
  }
  if (auth !== 'Bearer token-fake') {
    return responderErro(res, 401, 'UNAUTHORIZED', 'Token inválido.');
  }
  next();
}

// Permissões fake: header x-permissoes necessário em operações restritas
function verificarPermissao(req, res, next) {
  if (!config.simularPermissoes) return next();

  const caminhoBase = req.path.replace(/\/\d+([?#].*)?$/, '');
  const chave = `${req.method} ${caminhoBase}`;
  const permissaoRequerida = PERMISSOES_REQUERIDAS[chave];

  if (!permissaoRequerida) return next();

  const header = req.headers['x-permissoes'] || '';
  const permissoesCliente = header.split(',').map(p => p.trim()).filter(Boolean);

  if (!permissoesCliente.includes(permissaoRequerida)) {
    return responderErro(res, 403, 'FORBIDDEN', `Permissão necessária: ${permissaoRequerida}`);
  }
  next();
}

// Validação de campos obrigatórios (400) e conflitos (409) em POST
function validarRequisicao(req, res, next) {
  if (!config.simularErros) return next();
  if (req.method !== 'POST') return next();

  const chave = `POST ${req.path}`;

  const campos = CAMPOS_OBRIGATORIOS[chave];
  if (campos) {
    const faltando = campos.filter(
      c => !req.body || req.body[c] === undefined || req.body[c] === ''
    );
    if (faltando.length > 0) {
      return responderErro(res, 400, 'VALIDATION_ERROR',
        `Campos obrigatórios ausentes: ${faltando.join(', ')}.`);
    }
  }

  const verificar = VERIFICACOES_CONFLITO[chave];
  if (verificar) {
    const db = router.db.getState();
    const mensagem = verificar(db, req.body || {});
    if (mensagem) {
      return responderErro(res, 409, 'CONFLICT', mensagem);
    }
  }

  next();
}

// ─── Registro de middlewares ──────────────────────────────────────────────────

server.use(logger);
server.use(middlewares);
server.use(interceptarCenarios);
server.use(latencia);
server.use(cabecalhos);

server.use('/swagger', express.static(path.join(__dirname, 'swagger')));
server.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

server.use(verificarAutenticacao);
server.use(verificarPermissao);

// ─── Formato padrão das respostas do json-server ──────────────────────────────

router.render = (req, res) => {
  res.json({ success: true, data: res.locals.data });
};

// ─── Sistema ──────────────────────────────────────────────────────────────────

server.get('/', (req, res) => {
  responder(res, {
    nome: 'Mock API - Treinamentos',
    versao: '1.0.0',
    descricao: 'API Fake para desenvolvimento do aplicativo de gestão de treinamentos',
    documentacao: `http://localhost:${PORT}/docs`,
    dataHora: new Date().toISOString(),
    configuracao: {
      simularAutenticacao: config.simularAutenticacao,
      simularPermissoes:   config.simularPermissoes,
      simularErros:        config.simularErros,
      simularLatencia:     config.simularLatencia
    },
    rotas: [
      'POST   /api/login',
      'GET    /api/me',
      'GET    /api/dashboard',
      'GET    /api/funcionarios',
      'GET    /api/instrutores',
      'GET    /api/usuarios',
      'GET    /api/permissoes',
      'GET    /api/perfis',
      'GET    /api/perfilPermissoes',
      'GET    /api/usuarioPerfis',
      'GET    /api/treinamentos',
      'GET    /api/treinamentoResponsaveis',
      'GET    /api/treinamentoInstrutores',
      'GET    /api/treinamentoParticipantes',
      'GET    /api/assinaturas',
      'GET    /api/evidencias',
      'GET    /api/certificados',
      'GET    /api/auditorias',
      'GET    /api/treinamentos/:id/completo',
      'GET    /api/certificados/:id/completo',
      'GET    /health'
    ]
  });
});

server.get('/health', (req, res) => {
  responder(res, { status: 'UP', timestamp: new Date().toISOString() });
});

// ─── Autenticação ─────────────────────────────────────────────────────────────

server.post('/api/login', (req, res) => {
  const db = router.db.getState();
  const usuario = db.usuarios[0];
  const { senha, ...usuarioSemSenha } = usuario;
  responder(res, {
    token: 'token-fake',
    refreshToken: 'refresh-token-fake',
    usuario: usuarioSemSenha
  });
});

server.get('/api/me', (req, res) => {
  const db = router.db.getState();
  const usuario = db.usuarios[0];
  const { senha, ...usuarioSemSenha } = usuario;
  const funcionario = db.funcionarios.find(f => f.id === usuario.funcionarioId);
  const usuarioPerfisLinks = db.usuarioPerfis.filter(up => up.usuarioId === usuario.id);
  const perfis = usuarioPerfisLinks.map(up => db.perfis.find(p => p.id === up.perfilId));
  responder(res, { usuario: usuarioSemSenha, funcionario, perfis });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

server.get('/api/dashboard', (req, res) => {
  const db = router.db.getState();
  responder(res, {
    quantidadeFuncionarios: db.funcionarios.length,
    quantidadeUsuarios:     db.usuarios.length,
    quantidadeTreinamentos: db.treinamentos.length,
    quantidadeInstrutores:  db.instrutores.length,
    quantidadeCertificados: db.certificados.length
  });
});

// ─── Treinamento completo ─────────────────────────────────────────────────────

server.get('/api/treinamentos/:id/completo', (req, res) => {
  const db = router.db.getState();
  const id = parseInt(req.params.id);
  const treinamento = db.treinamentos.find(t => t.id === id);
  if (!treinamento) {
    return responderErro(res, 404, 'NOT_FOUND', 'Registro não encontrado.');
  }
  const instrutoresLinks = db.treinamentoInstrutores.filter(ti => ti.treinamentoId === id);
  const instrutores = instrutoresLinks.map(ti => db.instrutores.find(i => i.id === ti.instrutorId));
  const responsaveisLinks = db.treinamentoResponsaveis.filter(tr => tr.treinamentoId === id);
  const responsaveis = responsaveisLinks.map(tr => {
    const usr = db.usuarios.find(u => u.id === tr.usuarioId);
    if (!usr) return null;
    const { senha, ...semSenha } = usr;
    return semSenha;
  }).filter(Boolean);
  const participantes = db.treinamentoParticipantes.filter(tp => tp.treinamentoId === id);
  const evidencias = db.evidencias.filter(e => e.treinamentoId === id);
  responder(res, { treinamento, instrutores, responsaveis, participantes, evidencias });
});

// ─── Certificado completo ─────────────────────────────────────────────────────

server.get('/api/certificados/:id/completo', (req, res) => {
  const db = router.db.getState();
  const id = parseInt(req.params.id);
  const certificado = db.certificados.find(c => c.id === id);
  if (!certificado) {
    return responderErro(res, 404, 'NOT_FOUND', 'Registro não encontrado.');
  }
  const participante = db.treinamentoParticipantes.find(
    tp => tp.id === certificado.treinamentoParticipantesId
  );
  const funcionario = participante
    ? db.funcionarios.find(f => f.id === participante.funcionarioId)
    : null;
  const treinamento = participante
    ? db.treinamentos.find(t => t.id === participante.treinamentoId)
    : null;
  responder(res, { certificado, participante, funcionario, treinamento });
});

// ─── Validação antes do roteador json-server ──────────────────────────────────

server.use(validarRequisicao);

// ─── Reescrita e roteador do json-server ──────────────────────────────────────

server.use(jsonServer.rewriter(require('./routes.json')));
server.use(router);

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`JSON Server rodando em http://localhost:${PORT}`);
  console.log(`Swagger UI disponível em http://localhost:${PORT}/docs`);
  console.log(`Spec OpenAPI disponível em http://localhost:${PORT}/swagger/openapi.json`);
  console.log(`[config] autenticação=${config.simularAutenticacao} | permissões=${config.simularPermissoes} | erros=${config.simularErros} | debug=${config.modoDebug}`);
});

