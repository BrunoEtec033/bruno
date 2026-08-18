# Projeto Mobile — Sistema de Gestão de Treinamentos

## Aula 01 — Arquitetura do APP Mobile

### 1. Apresentação

A partir desta aula, iniciaremos o desenvolvimento do aplicativo Mobile do Sistema de Gestão de Treinamentos.

O aplicativo será desenvolvido utilizando:

- React Native;
- Expo;
- TypeScript;
- React Native Paper
- API REST;
- Mock API disponibilizada para o projeto.

A API já possui funcionalidades relacionadas a autenticação, usuários, funcionários, treinamentos, instrutores, participantes, certificados, evidências e outros recursos do sistema.

Entretanto, o aplicativo não deverá simplesmente reproduzir a estrutura da API.

> **A API representa os recursos e dados do sistema. O aplicativo representa as funcionalidades e experiências do usuário.**

Por isso, antes de desenvolver as telas, precisamos definir uma arquitetura que permita que o projeto cresça de maneira organizada.

---

# 2. Objetivo da aula

Ao final desta aula, você deverá ser capaz de:

- analisar uma documentação de API;
- identificar funcionalidades de uma aplicação;
- separar funcionalidades em Features;
- propor uma estrutura de projeto;
- compreender a responsabilidade de cada camada;
- definir onde ficará o acesso à API;
- compreender a importância da separação entre interface e acesso aos dados;
- planejar a navegação do aplicativo;
- justificar decisões arquiteturais.

### O objetivo NÃO é:

- desenvolver todas as telas;
- implementar todas as chamadas da API;
- criar todos os componentes;
- finalizar o aplicativo.

Nesta aula, o objetivo é **decidir como o aplicativo será construído**.

---

# 3. O problema

Você recebeu a documentação de uma API REST de um Sistema de Gestão de Treinamentos.

A API possui diversos recursos, entre eles:

- autenticação;
- usuários;
- funcionários;
- instrutores;
- treinamentos;
- participantes;
- evidências;
- certificados;
- auditorias.

Além dos recursos individuais, existem operações que retornam informações relacionadas.

Por exemplo:

```text
GET /api/treinamentos/{id}/completo
```

Esse recurso pode retornar informações do treinamento juntamente com instrutores, responsáveis, participantes e evidências.

Também existem recursos específicos para consultar certificados completos.

Portanto, existe uma grande quantidade de informações disponíveis.

### O desafio

Você precisa construir um aplicativo Mobile utilizando React Native + Expo.

Mas existe uma condição:

> **O aplicativo deverá continuar organizado mesmo quando novas funcionalidades forem adicionadas.**

Imagine que daqui a alguns meses o sistema precise receber:

- notificações;
- avaliação de treinamentos;
- histórico do funcionário;
- documentos;
- novos tipos de certificados;
- novas telas administrativas.

Se toda a aplicação estiver misturada, cada nova funcionalidade poderá afetar várias partes do projeto.

Seu primeiro trabalho será justamente evitar esse problema.

---

# 4. Regra principal do projeto

Durante todo o desenvolvimento, adotaremos como princípio:

> **O aplicativo será organizado por Features.**

Uma Feature representa uma funcionalidade ou área de negócio do aplicativo.

Exemplo:

```text
features/
├── auth/
├── dashboard/
├── treinamentos/
├── certificados/
└── perfil/
```

Cada Feature deverá concentrar os elementos relacionados àquela funcionalidade.

---

# 5. Uma pergunta importante

Observe a API.

Ela possui recursos como:

```text
/api/funcionarios
/api/instrutores
/api/usuarios
/api/perfis
/api/permissoes
/api/perfilPermissoes
/api/usuarioPerfis
/api/treinamentos
/api/treinamentoResponsaveis
/api/treinamentoInstrutores
/api/treinamentoParticipantes
/api/assinaturas
/api/evidencias
/api/certificados
/api/auditorias
```

Isso significa que precisamos necessariamente criar uma Feature para cada um deles?

### Pense antes de responder.

Por exemplo:

```text
features/
├── funcionarios/
├── instrutores/
├── usuarios/
├── perfis/
├── permissoes/
├── perfilPermissoes/
├── usuarioPerfis/
├── treinamentos/
├── treinamentoResponsaveis/
├── treinamentoInstrutores/
├── treinamentoParticipantes/
├── assinaturas/
├── evidencias/
├── certificados/
└── auditorias/
```

### Sua tarefa será decidir:

**Quais desses recursos realmente representam funcionalidades do aplicativo Mobile?**

Justifique suas decisões.

---

# 6. Atividade 01 — Analisando a API

Consulte a documentação da Mock API fornecida pelo professor.

Para cada grupo abaixo, responda:

### Autenticação

- O que o usuário precisa fazer para entrar no aplicativo?
- Quais informações precisamos armazenar?
- Qual endpoint será utilizado?

### Treinamentos

- Como listar os treinamentos?
- Como visualizar um treinamento específico?
- Quais informações relacionadas ao treinamento podem ser apresentadas?

### Certificados

- Como o aplicativo poderá consultar certificados?
- Quais informações podem ser apresentadas ao usuário?

### Usuário

- Como descobrir quem está logado?
- Quais informações do usuário podem ser exibidas?

### Dashboard

- Quais informações podem ser apresentadas inicialmente ao usuário?

As respostas deverão ser baseadas na documentação da API.

---

# 7. Atividade 02 — Pensando em Features

Agora imagine que você seja responsável pela arquitetura do aplicativo.

Proponha as Features iniciais.

Uma possibilidade seria:

```text
features/
├── auth/
├── dashboard/
├── treinamentos/
├── certificados/
└── perfil/
```

Porém, **não copie simplesmente essa estrutura**.

Analise a API e o objetivo do aplicativo.

Para cada Feature escolhida, explique:

1. Qual problema ela resolve?
2. Quais telas ela poderá possuir?
3. Quais dados ela utilizará?
4. Quais endpoints da API ela utilizará?

Exemplo:

```text
Feature: treinamentos

Responsabilidade:
Permitir que o usuário consulte os treinamentos disponíveis
e visualize seus detalhes.

Possíveis telas:
- Lista de treinamentos
- Detalhes do treinamento

Possíveis dados:
- título
- descrição
- carga horária
- status
- data de início
- data de término

Endpoints:
GET /api/treinamentos
GET /api/treinamentos/{id}
GET /api/treinamentos/{id}/completo
```

---

# 8. Atividade 03 — Definindo a arquitetura

Agora crie a estrutura inicial do projeto.

A arquitetura deverá possuir pelo menos quatro áreas:

```text
src/
├── app/
├── core/
├── shared/
└── features/
```

### `app`

Responsável pela composição da aplicação.

Exemplos:

```text
app/
├── navigation/
└── providers/
```

Aqui ficará a configuração da navegação e dos Providers utilizados pela aplicação.

---

### `core`

Responsável por recursos de infraestrutura utilizados pelo aplicativo.

Exemplos:

```text
core/
├── api/
├── storage/
├── config/
└── errors/
```

O acesso HTTP à API deverá ficar aqui, e não espalhado pelas telas.

---

### `shared`

Responsável por elementos realmente reutilizáveis entre diferentes Features.

Exemplos:

```text
shared/
├── components/
├── hooks/
├── utils/
└── types/
```

Importante:

> Não coloque tudo em `shared` apenas porque poderá ser reutilizado no futuro.

Primeiro desenvolva a funcionalidade. A reutilização deve ser identificada durante o desenvolvimento.

---

### `features`

Contém as funcionalidades do aplicativo.

Exemplo:

```text
features/
├── auth/
├── dashboard/
├── treinamentos/
├── certificados/
└── perfil/
```

Cada Feature poderá possuir sua própria organização interna.

Por exemplo:

```text
features/
└── treinamentos/
    ├── components/
    ├── hooks/
    ├── screens/
    ├── services/
    ├── types/
    └── index.ts
```

---

# 9. Atividade 04 — Quem é responsável pelo quê?

Considere o seguinte fluxo:

```text
Usuário abre a tela de treinamentos
        ↓
Aplicativo precisa buscar os dados
        ↓
API retorna os treinamentos
        ↓
Aplicativo apresenta os dados
```

Agora responda:

### Quem deve:

**A)** apresentar a interface?

**B)** controlar a interação da tela?

**C)** realizar a chamada para a API?

**D)** configurar o cliente HTTP?

**E)** armazenar o token de autenticação?

Não basta responder apenas com o nome de uma pasta.

Explique **por que** cada responsabilidade deve estar naquele local.

---

# 10. Uma regra de comunicação entre camadas

Adotaremos inicialmente o seguinte fluxo:

```text
Screen
   ↓
Hook
   ↓
Service
   ↓
API
```

Por exemplo:

```text
TreinamentosScreen
        ↓
useTreinamentos()
        ↓
treinamentosService.listar()
        ↓
api.get()
```

### O que não queremos:

```text
TreinamentosScreen
        ↓
axios.get(...)
```

A tela não deverá conhecer detalhes da infraestrutura HTTP.

Isso permite que a interface permaneça independente da forma como os dados são obtidos.

---

# 11. Atividade 05 — Pensando na mudança da API

Imagine que hoje o aplicativo utiliza:

```text
Mock API
```

E daqui a algumas semanas passaremos a utilizar:

```text
API Real
```

Agora responda:

### Se a URL da API mudar, quantos arquivos do aplicativo deveriam precisar ser modificados?

Idealmente, uma alteração de infraestrutura não deveria obrigar a equipe a procurar chamadas HTTP espalhadas por dezenas de telas.

Essa é uma das razões pelas quais estamos separando:

```text
Screen
    ↓
Hook
    ↓
Service
    ↓
API
```

---

# 12. Atividade 06 — Planejando a navegação

Agora pense no aplicativo como usuário.

Proponha um fluxo inicial.

Uma possibilidade:

```text
                        Aplicativo
                             │
                             ▼
                    Verificar autenticação
                             │
                    ┌────────┴────────┐
                    │                 │
                  SIM                NÃO
                    │                 │
                    |                 ▼
                    |                Login
                    |               /
                    |             /
                    |           /
                    |         /
                    |       /                                      
                    ▼      ▼
                    Dashboard         
                    │                 
          ┌─────────┼─────────┐       
          │         │         │      
          ▼         ▼         ▼       
    Treinamentos Certificados Perfil 
          │                          
          ▼                          
        Lista                        
          │                          
          ▼                         
      Detalhes                      
                                     
                        
```

Não é obrigatório utilizar exatamente esse fluxo.

A equipe deverá propor uma solução e justificar.

---

# 13. Atividade 07 — Criando o mapa da aplicação

Cada equipe deverá produzir um pequeno mapa contendo:

### Telas

Quais telas existirão inicialmente?

### Navegação

Como o usuário chegará a cada tela?

### Features

A qual Feature cada tela pertence?

### API

Quais endpoints serão utilizados?

Exemplo:

```text
LOGIN
  │
  └── auth
       │
       └── POST /api/login

DASHBOARD
  │
  └── dashboard
       │
       └── GET /api/dashboard

TREINAMENTOS
  │
  ├── Lista
  │     └── GET /api/treinamentos
  │
  └── Detalhes
        └── GET /api/treinamentos/{id}/completo

CERTIFICADOS
  │
  └── Lista
       └── GET /api/certificados
```

---

# 14. Entrega da Aula 01

Ao final da aula, o grupo deverá entregar:

## 1. Projeto Expo criado

O projeto deverá executar corretamente.

## 2. Estrutura inicial

```text
src/
├── app/
├── core/
├── shared/
└── features/
```

## 3. Documento de arquitetura

Criar:

```text
docs/arquitetura.md
```

O documento deverá conter:

### A. Features escolhidas

Quais são e por quê.

### B. Estrutura de pastas

Representação da arquitetura.

### C. Navegação

Fluxo inicial do aplicativo.

### D. Comunicação com a API

Explicação do fluxo:

```text
Screen
↓
Hook
↓
Service
↓
API
```

### E. Decisões arquiteturais

Pelo menos cinco decisões justificadas.

---

# 15. Critérios de avaliação

A avaliação desta etapa não será baseada na quantidade de código produzido.

Será avaliada principalmente a capacidade de **pensar e justificar decisões técnicas**.

| Critério | Avaliação |
|---|---|
| Análise da API | Identificou corretamente os principais recursos |
| Definição das Features | As funcionalidades foram agrupadas de forma coerente |
| Organização | Estrutura de pastas possui responsabilidades claras |
| Separação de responsabilidades | Interface, lógica e infraestrutura estão separadas |
| Navegação | Fluxo do aplicativo é coerente |
| Justificativas | Decisões arquiteturais foram explicadas |
| Documentação | `arquitetura.md` está organizado e compreensível |
| Execução | Projeto Expo inicia corretamente |

---

# 16. Regras que deverão ser observadas durante todo o projeto

### Regra 1

> Uma tela não deve realizar diretamente chamadas HTTP.

### Regra 2

> Uma Feature deve concentrar aquilo que pertence àquela funcionalidade.

### Regra 3

> Componentes compartilhados devem realmente ser compartilhados.

### Regra 4

> Não criar abstrações sem uma necessidade real.

### Regra 5

> Toda decisão arquitetural importante deve poder ser explicada.

### Regra 6

> O código deve ser organizado pensando na próxima pessoa que precisará mantê-lo.

### Regra 7

> A estrutura do aplicativo não precisa ser igual à estrutura da API.

---

# 17. Próxima etapa

Na próxima aula, o projeto deverá partir da arquitetura planejada para a implementação da infraestrutura.

A equipe deverá começar a trabalhar em:

```text
Expo
TypeScript
     ↓
Estrutura src
     ↓
Configuração
     ↓
Cliente HTTP
     ↓
Storage
     ↓
Providers
     ↓
Navigation
```

Somente depois dessa fundação começaremos a implementar as Features.

---

# 18. Pergunta final

Antes de encerrar o planejamento da arquitetura:

> **"Se outra equipe receber nosso projeto daqui a seis meses, ela conseguirá entender onde está cada funcionalidade e descobrir rapidamente onde deve fazer uma alteração?"**

Se a resposta for **não**, a arquitetura ainda precisa ser melhorada.

Se a resposta for **sim**, vocês estão começando o projeto da maneira correta.
