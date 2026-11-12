# Assistente do Arquivo Central de Normas (Frontend React)

Frontend da **Plataforma de Inteligência Empresarial** desenvolvido para o **HACKA/TS 2026 (Desafio 2)**.
Repositório: `RazebaG/Hacka_ts-React`.

O sistema transforma o acervo normativo da ACME em inteligência com respostas confiáveis, auditáveis e rastreáveis até os trechos exatos dos documentos vigentes, com suporte a modo mock offline e integração completa via API HTTP com o backend Python (`RazebaG/Hack_ts---Python`).

---

## Tecnologias
- **Vite 5** + **React 18** + **TypeScript**
- **Vitest** + **Testing Library (React & DOM)**
- CSS modular sem bibliotecas pesadas de terceiros, acessível e responsivo
- Cliente HTTP resiliente com suporte a fallback de contingência e detecção de rotas ausentes

---

## Telas Principais

1. **Perspectivas**: Painéis executivos com visão de Pessoas (RH), Financeiro, Jurídico e Gestão, exibindo prazos (D-45 até D-3), alçadas, matriz de responsabilidades e selos de alerta (ex.: `NG_012` ausente).
2. **Radar de Contradições**: Detecção visual de divergências entre normas vigentes e versões substituídas (ex.: antecedência de férias 30 vs 45 dias) e referências a documentos ausentes do acervo.
3. **E se? (Simulação Hipotética)**: Simulação determinística de impacto em cascata de alterações de regras regulamentares (ex.: férias 45 → 30 dias) com destaque em linha do tempo e conflitos internos.
4. **Mapa do Acervo**: Grafo interativo e tabela acessível de nós e arestas documentais (`vinculado_a`, `referencia`, `substitui`).
5. **O Que Mudou**: Comparativo semântico lado a lado e resumo executivo das alterações entre versões vigentes e substituídas (ex.: NG_111 v2 → v3).
6. **Relatório Executivo**: Síntese estruturada por perspectiva ou documento com fontes clicáveis e suporte a impressão/PDF (`window.print`).
7. **Perguntar**: Consulta em linguagem natural (`POST /api/perguntar`) com citação estruturada (`código · versão · seção · camada`), seletor de perfil (`empregado`, `gestor`, etc.), avisos de versões substituídas e abstenção confiável quando a informação não consta nas fontes.
8. **Decodificar Código**: Tela de taxonomia oficial (`GET /api/codigo/{codigo}`) para decodificação de metadados, sigla, subordinação hierárquica, série temática e vigência regulamentar (CATÁLOGO §2, §3 e §5).
9. **Catálogo**: Visão completa do acervo agrupado por assunto com filtros e acesso direto à leitura e decodificação.
10. **Leitor de Documentos**: Visualização com metadados, seções e destaque automático para a seção citada.

---

## Como Executar

### 1. Modo Mock (Demonstração Offline — Padrão)
Não requer o backend rodando. Utiliza o acervo sintético completo em `src/mocks/` conforme o `docs/CONTRATO-API.md`:
```bash
npm install
npm run dev
```
Acesse em `http://localhost:5173`.

### 2. Conectado à API Real (Backend Python)

#### Passo A: Subir o Backend Python
No repositório `RazebaG/Hack_ts---Python`:
```bash
# Instalar dependências do backend
pip install -r requirements.txt

# Iniciar o servidor FastAPI na porta 8000
uvicorn app.main:app --port 8000 --reload
```
A API ficará disponível em `http://localhost:8000` (documentação Swagger em `/docs`).

#### Passo B: Iniciar o Frontend Conectado
No repositório `RazebaG/Hacka_ts-React`:
```bash
VITE_API_URL=http://localhost:8000 npm run dev
```
O cabeçalho exibirá o indicador visual `● API Conectada (http://localhost:8000)`.

---

## Decodificador de Código (`/api/codigo/{codigo}`) e Resiliência

A tela **Decodificar Código** consulta `GET /api/codigo/{codigo}`:
- **Quando o backend possui a rota implementada (BE #3):** exibe os dados retornados pela API com o selo `API Real Conectada`.
- **Se a issue BE #3 ainda não estiver mergeada no backend:**
  - A aplicação detecta o status `404 Not Found` da rota e exibe um **alerta explicativo destacado** (`alerta-endpoint-ausente`):
    > *"Endpoint GET /api/codigo/{codigo} ausente no backend — aguardando aprovação da issue BE #3. O restante da aplicação continua operando normalmente."*
  - Exibe a decodificação calculada localmente com base nas regras do CATÁLOGO v1.0 e marca o selo `Mock de Contingência`.
  - **Nenhuma outra tela ou requisição é afetada**.

### Casos de Teste Homologados no Decodificador:
1. `PX_1111-001`: Procedimento operacional subordinado a `NG_111`, série 1 (Gente e Cultura), vigência 18 meses, presente no acervo.
2. `NG_111`: Norma Geral raiz de Férias, série 1, vigência 18 meses, presente no acervo.
3. `PX_1130-001`: Procedimento operacional subordinado a `NG_1130`, série 1, vigência 18 meses.
4. `RG_1100`: Regulamento do Programa Ideias em Campo, série 11 (Programas Institucionais).
5. `CTR_2026-012`: Contrato de locação corporativa de coworking, vigência 12 meses.
6. `NT_2026-021`: Nota Técnica sobre diretrizes do programa de inovação.
7. `CT_Dirtec — 2026/003`: Carta de comunicação transitória (vigência CT ≤ 150 dias).
8. `NG_012`: Norma Geral citada na `NT_2026-018`, porém não arquivada no acervo (selo `Citada, Não Arquivada`).

---

## Roteiro das 5 Cenas do Pitch (Execução Ponta a Ponta)

Os botões da barra superior (`Cenas do Pitch (2 min)`) realizam a transição instantânea:

1. **Cena 1 (Pessoas · Armadilha da Versão):**
   - Acesse o botão `1. Pessoas (45d ⚠)` ou a aba **Perspectivas** > Pessoas.
   - Constata o destaque: antecedência de 45 dias na versão vigente `NG_111 v3.0.0` com aviso da versão anterior `2.0.0` (30 dias).
   - Linha do tempo de marcos D-45 até D-3.

2. **Cena 2 (Financeiro · Multa do Contrato):**
   - Acesse o botão `2. Financeiro (Multa CTR)` ou a aba **Perspectivas** > Financeiro.
   - Constata o valor global do contrato `CTR_2026-012` (R$ 18.250,00) e a multa compensatória de R$ 912,50 (5%) no Apêndice B.
   - Exibe o selo de atenção para `NG_012` ("citada, não está no acervo").

3. **Cena 3 (O Que Mudou · NG_111 v2.0.0 → v3.0.0):**
   - Acesse o botão `3. Mudanças (NG_111)` ou a aba **O Que Mudou**.
   - Resumo executivo da alteração de antecedência mínima de 30 para 45 dias corridos.
   - Comparativo textual lado a lado da Seção 4.3.1.

4. **Cena 4 (Perguntar · Abstenção e Citações):**
   - Acesse o botão `4. Abstenção Segura` ou a aba **Perguntar**.
   - Pergunta: *"Uma mesma pessoa pode elaborar, revisar e aprovar um documento?"*.
   - Resposta: abstenção segura (*"Não consta nas fontes do acervo..."*), com `consta: false` e `citacoes: []`.
   - Pergunta: *"Qual a antecedência mínima para solicitar férias?"*: resposta com citações da `NG_111 v3.0.0` e aviso de substituição da v2.0.0.

5. **Cena 5 (Relatório Executivo · Jurídico e Contratos):**
   - Acesse o botão `5. Relatório Jurídico` ou a aba **Relatório Executivo**.
   - Relatório estruturado com todas as fontes normativas identificadas.
   - Botão para exportação e impressão limpa (`window.print()`).

---

## Validação e Testes Automatizados

```bash
# Execução da suíte completa de testes (14 arquivos, 64 testes)
npm test -- --run

# Verificação de tipos TypeScript e build de produção Vite
npm run build

# Validação completa de integração contínua (CI)
npm ci && npm run build && npm test -- --run
```
