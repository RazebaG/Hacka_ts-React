# ACME - Assistente do Arquivo Central de Normas (Frontend React)

Frontend da **Plataforma de Inteligência Empresarial** desenvolvido para o **HACKA/TS 2026 (Desafio 2)**.

O sistema transforma o acervo normativo da ACME em inteligência com respostas confiáveis, auditáveis e rastreáveis até os trechos exatos dos documentos vigentes.

## Tecnologias
- **Vite 5** + **React 18** + **TypeScript**
- **Vitest** + **Testing Library (React & DOM)**
- CSS simples, sem bibliotecas pesadas de terceiros, acessível e responsivo

## Telas Principais
1. **Perguntar**: Consulta em linguagem natural com citação estruturada (`código·versão·seção`), seletor de perfil (opcional), avisos em destaque para normas substituídas e abstenção confiável quando a informação não consta nas fontes.
2. **Catálogo**: Visão organizada por assunto (*Férias*, *Inovação*, *Locação*) com selos claros de **Vigente** e **Substituído**, filtros de busca e status.
3. **Leitor de Documentos**: Visualização completa de metadados, seções e suporte a âncora/destaque automático para a seção citada na resposta.

## Como Executar

### 1. Modo Mock (Demonstração Offline — Padrão)
Não requer o backend rodando. Utiliza o acervo sintético completo em `src/mocks/` conforme o `docs/CONTRATO-API.md`:
```bash
npm install
npm run dev
```
Acesse em `http://localhost:5173`.

### 2. Conectado à API Real (Backend Python)
Com o backend rodando em `http://localhost:8000`:
```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

#### Variáveis de ambiente
Copie `.env.example` para `.env.local` (ignorado pelo git) e preencha:

- `VITE_API_URL`: endereço do backend. Vazia, o app roda no modo de exemplo, sem rede.
- `VITE_API_KEY`: enviada como cabeçalho `X-API-Key` em toda chamada a `/api/...` (deve ser igual à `API_KEY` do backend). Vazia, nenhum cabeçalho é enviado. Se a API recusar a chave (401/403), a tela mostra "A chave de acesso não foi aceita. Confira a configuração."

> **Limite importante:** variáveis `VITE_*` entram no código que o navegador baixa, então **a chave fica visível para quem abrir o site**. Ela serve de trava básica contra uso casual e para proteger a cota do Bedrock no MVP; **não é segredo de verdade**. A solução definitiva (pós-MVP) é um proxy no servidor ou autenticação por usuário. A chave real é entregue por canal privado e nunca vai para o repositório, issue, PR ou captura de tela.

### 3. Execução dos Testes e Build
```bash
# Rodar suíte de testes unitários e de integração
npm test -- --run

# Validar compilação TypeScript e bundle de produção
npm run build

# Validação idêntica ao CI
npm ci && npm run build && npm test -- --run
```
