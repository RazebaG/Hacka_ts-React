# Assistente do Arquivo Central de Normas (Frontend React)

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

### 3. Execução dos Testes e Build
```bash
# Rodar suíte de testes unitários e de integração
npm test -- --run

# Validar compilação TypeScript e bundle de produção
npm run build

# Validação idêntica ao CI
npm ci && npm run build && npm test -- --run
```
