# PRD — Plataforma de Inteligência Empresarial (HACKA/TS 2026 · Desafio 2)

Acervo: dados sintéticos da ACME (catálogo + 13 documentos de Férias, Inovação/Ideias em Campo e Locação de coworking) em `RazebaG/Hack_ts---Python/data/acervo/`. Regulamento e critérios: `docs/EVENTO.md` do planejamento.

## Problema (texto do desafio)
Documentos extensos e dispersos; consultar exige especialista; consolidar para relatórios executivos custa tempo. Pedem: organizar, sintetizar e destacar o relevante **sob diferentes perspectivas**, com **visuais, gráficos e interação**, **respostas confiáveis** e **acesso rápido** para **decidir**.

## Proposta
Uma plataforma que transforma o acervo em **inteligência por perspectiva**, sempre rastreável até a fonte:
1. **Painéis por perspectiva** — Jurídico/Contratos, Financeiro, Pessoas (RH), Gestão/Inovação. Cada painel mostra o que importa para aquela área: prazos e marcos (linha do tempo), valores, multas e alçadas (gráficos), responsáveis (matriz), riscos e próximas datas críticas.
2. **Mapa do acervo** — grafo interativo NG → PX/FM/TB/FL, CTR ↔ NT, versões vigentes × substituídas.
3. **O que mudou** — comparação entre versões (NG_111 v2 → v3, FM_1111-001 v1 → v2; RG_1100 via histórico interno = P1).
4. **Pergunte ao acervo** — resposta confiável **com citação** (documento·versão·seção), só da versão vigente, e "não consta nas fontes" quando não houver evidência. O CATALOGO não entra no índice de perguntas.
5. **Relatório executivo** — síntese de uma perspectiva ou documento pronta para apresentar (exportar/imprimir), com fontes.

Diferencial (prioridade no pitch): **alerta de versão substituída no nível do número** — cada número/prazo abre a passagem exata e avisa se a fonte envelheceu. Frase ≤12 palavras: *Não citamos o documento: citamos o número, e avisamos se envelheceu.* Rastreabilidade por número = mecanismo; relatório com fontes = diferencial de rotina (fecho).

## Cena da demo (≤ 2 min dentro do pitch)
1. **Armadilha da versão (hook):** painel **Pessoas** — card "Antecedência mínima: 45 dias" (selo vigente NG_111 v3) + badge ⚠ "v2 (substituída) dizia 30 dias" → lado a lado v2 §2.3 × v3 §4.3.1. Opcional: mesma pergunta só com base na v2, selo vermelho.
2. Painel **Financeiro**: valor global do coworking R$ 18.250,00, alçada de diretor (NG_012 via NT_2026-018), multa de inexecução R$ 912,50 — clique leva ao Apêndice B do CTR_2026-012 (`fonte.secao` = `secoes[].id`).
3. **O que mudou** NG_111 v2 → v3 (reforço do contraste 30→45 e itens novos).
4. Pergunta "Uma mesma pessoa pode elaborar, revisar e aprovar?" → "não consta nas fontes".
5. Gera o **relatório executivo** da perspectiva Jurídico/Contratos (fontes clicáveis).

## P0 (sem isso não há demo)
- Ingestão estruturada + catálogo (backend #1); **extração de inteligência: prazos, valores, responsáveis, relações e diferenças entre versões (#4)**; perguntas com citação e abstenção (#2); decodificador de código (#3, fora das 5 cenas; opcional no pitch).
- Frontend: base com mock (#1); **painéis por perspectiva + mapa + o que mudou + relatório (#3)**; integração real (#2).
- Ordem de merge (Esquadro/Lead 12/11): BE #1 → #4 → #2 → #3; FE #1 → #3 (mock) → #2. Contrato adendo v0.1 obrigatório antes de #4 e mocks de #3.
## P1
PostgreSQL (stack BBTS); upload .md/.pdf com ingestão genérica (hedge documentos-surpresa); LLM opcional (sem chave tudo funciona); acessibilidade AA; RG_1100 v1→v2 via curadoria.
## P2
Deploy AWS; perfis de acesso; CORS `:4173` + formato de erro unificado.

## Avaliação interna
`eval/perguntas.yaml` (≥ 15 perguntas das FAQs do acervo, **exceto** FAQs só do CATALOGO sem código citável): ≥ 80% corretas com citação certa; 100% das "não consta" abstidas. Valores-chave do painel conferidos contra o texto.
