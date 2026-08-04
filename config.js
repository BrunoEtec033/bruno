// Configuração da Mock API
// Altere os valores abaixo para controlar o comportamento da simulação

module.exports = {
  // Simular atraso nas respostas da API
  simularLatencia: false,
  latenciaMinima: 200,      // ms
  latenciaMaxima: 500,      // ms

  // Exigir Authorization: Bearer token-fake nos endpoints privados
  simularAutenticacao: false,

  // Retornar 403 em endpoints que requerem permissões específicas
  // Enviar header x-permissoes: <PERMISSAO> para liberar o acesso
  simularPermissoes: false,

  // Validar campos obrigatórios (400) e conflitos de dados (409)
  simularErros: false,

  // Exibir headers das requisições no console de log
  modoDebug: false
};
