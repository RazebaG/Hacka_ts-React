# Telas e canais no pitch de 5 min — v2 (PROPOSTA, Ribalta, 12/11/2026)

Fontes: `docs/propostas/FLUXO-DE-TELAS-v2.md` (§3 C0/S1/S2, §4, §5 Uso do MVP, §6 Matriz), `docs/FUNCIONALIDADES-ESPERADAS.md` (8 funcionalidades do slide da organização), acervo em `docs/acervo/`. **Só vale depois de aprovada pela equipe.** Não altera `docs/PITCH.md`. Substitui a v1 deste arquivo (roteiro de 6 passos do FLUXO v1).

> **Divergência:** a v2 mostra o **MVP em uso** — web + Slack + Teams no P0, upload em lote e digitalização. O `docs/PITCH.md` ainda está na Opção A: só web, Slack como P1, sem Teams, e T11 só no fechamento. **O Lead precisa decidir se o `PITCH.md` passa a seguir esta v2.** Se sim, eu o atualizo numa tarefa autorizada.

**Mensagem do pitch (aderência ao slide):** "Das 8 funcionalidades esperadas, 7 estão em uso, e da oitava entregamos a avaliação da resposta. Deixamos para depois só 'análises semelhantes', que precisa de histórico para ter valor." É o "não é preciso fazer tudo: priorize e justifique" do slide (FLUXO v2 §6). Falar isso em cerca de 10 s na viabilidade (3:40), **só se os itens estiverem verdes**.

Legenda de status:
- **✅** já implementado (FE PR #6, `qa:aprovado`): T10 Mapa, T11 Relatório.
- **[CONDICIONAL]** depende dos itens fora do contrato (C13–C21) ou de issues abertas. Entra ao vivo só com SHA verde.

## 1. O que entra no pitch: demo 1:05–3:05 como **uso real**, 6 tarefas de cerca de 20 s

| Tempo | Tarefa (FLUXO v2 §5) | Canal / telas | O que a tela precisa mostrar | Funcionalidade do slide | Fala | Status |
|---|---|---|---|---|---|---|
| 0:35–1:05 | Abertura (proposta) | **T1** Visão geral (perfil Diretoria), cartões por tema | "Férias · 1 ponto no radar" | — | (fala da proposta) | Base v1 |
| 1:05–1:25 | **U2 Importar** | **T12** lote misto **já enviado antes**: tabela com tipo, tema sugerido + motivo; ao vivo, só "Confirmar temas e publicar" → foto revisada no **T13** → Publicar → **T7** agrupado por tema | Tema sugerido editável, com confiança; foto vira fonte citável | 1 | "Um lote, digital e papel, já organizado por tema. Nada vira fonte sem uma pessoa conferir." | [CONDICIONAL — C17/C18 + digitalização] |
| 1:25–1:45 | **U1 Consultar em 2 canais** | **S2 Teams (Agents Playground)** ao vivo: `acervo Até quando peço férias que começam em 05/05/2027?` → cartão "Peça até 21/03/2027 (D-45)" · `NG_111 · v3.0.0 · Anexo C` · camada "NG · Normativo" → **"Útil"**. Ao lado, **S1 Slack** com a mesma pergunta, já enviada | Paridade: mesmo texto, mesma fonte e mesmo link nos dois canais | 2, 7, 8 | "No Teams ou no Slack, a mesma resposta, com a mesma fonte, e dá para avaliar." | [CONDICIONAL — S1/S2 + C13/C14/C15] |
| 1:45–2:05 | **U4a Divergência** | Cartão → "Abrir no painel" → **T4** filtro Férias → **T5** NG_111 v2.0.0 × v3.0.0 (30 × 45) + ⓘ NG_012 ausente, citada por 5 documentos | Mostra as duas fontes e a precedência, **sem escolher lado** | 7 | **"Não citamos o documento: citamos o número, e avisamos se envelheceu."** | Base v1; filtro tema = C16 |
| 2:05–2:25 | **U3 Área por tema e prazo** | **T3** Financeiro, filtro Locação + próximos 30 dias → "vistoria até 25/11/2026" → R$ 18.250,00 → **T8** Cláusula Sétima; (opcional) **T10 Mapa** com nó NG_012 ausente | Prazos, obrigações e valores filtrados, cada um com a fonte | 3, 4, 5 | "A mesma informação por área, tema e prazo. Cada número abre o trecho exato." | T3 base; filtros C16 [CONDICIONAL]; T10 ✅ |
| 2:25–2:45 | **U4b Simular e decidir** | **T6** antecedência N=30 → quebra o aviso D-35 (§4.5.3), faixa "Simulação hipotética" → "Incluir no relatório" → **M1** "Encaminhar à GGC" → registro com data e hora | Simulação marcada como hipotética; decisão registrada | 4 | "O RH testa a regra antes de mudar a norma e encaminha a decisão." | [CONDICIONAL — BE #7/#8, FE #5, C9] |
| 2:45–3:05 | **U5 Resumo executivo** | **T0** "Seleção (3)" → **T11 Relatório da seleção** (45 dias · pedido até 21/03/2027 · simulação hipotética) → reordenar 1 item → Imprimir | Só o que foi escolhido, com as fontes | 6 | "A diretoria leva só o que importa, com fonte em cada linha." | T11 ✅; modo seleção (RF41) [CONDICIONAL] |

**Canais e telas no pitch:** S1 Slack, S2 Teams e as telas web T0, T1, T3, T4, T5, T6, T7, T8, T11, T12, T13 e M1, com T10 opcional.
**Conferido no acervo:**
- 21/03/2027 (D-45) está na NG_111 v3, Anexo C (l. 418+), e no PX_1111-001;
- 30 × 45: NG_111 v2 §2.3 × v3 §4.3.1;
- R$ 18.250,00: Cláusula Sétima do CTR_2026-012, l. 54–55;
- vistoria até 25/11/2026: CTR_2026-012, l. 100, e NT_2026-018, l. 90;
- a NG_012 é citada em 5 documentos e não está no acervo.

**Preparação de palco:**
- 3 janelas fixas: navegador (web), Agents Playground (Teams) e Slack.
- Mandar a pergunta no Slack antes do pitch, para o cartão estar pronto.
- Deixar o lote do T12 enviado e lido antes de entrar.
- Abrir abas com rotas profundas (`/radar?tema=ferias`, `/e-se?regra=antecedencia&valor=30`).

## 2. Fora do pitch de 5 min (ou só em perguntas)

| Item | Situação | Onde aparece |
|---|---|---|
| U6 Análises semelhantes (RF40) | P1 | Fala: "o único item que deixamos para depois" |
| Fluxograma interativo do FL no T8 (RF43) | P1 | Plano de 6 meses |
| T6 alçada 18.000 → 20.000 (⚖️2) | Fora da demo; só em pergunta do júri | Jornada P-FIN |
| T9 O que mudou (inclui RG_1100) | Fora; o T5 cobre 30 × 45 | Plano B da U4b |
| T2 Pergunte ao acervo | Plano B dos canais; resposta à pergunta "e alucinação?" ("o acervo não trata disso") | — |
| T10 Mapa | Opcional na U3 se sobrar tempo; senão, pergunta do júri sobre relações | ✅ implementado |
| Troca de perfil no T0 | Fora como passo; abrir já no perfil certo | — |
| Publicação do Teams no tenant da BBTS, credenciais Azure Bot | Plano de 6 meses (mês 5) | Hoje: Agents Playground local, sem tenant. **Não dizer "roda no Teams da empresa"** |

## 3. Plano B por canal e tela (sem mentir)

| Falha | Frase | O que mostrar |
|---|---|---|
| Teams Playground não responde | "O Teams é só a porta; a mesma resposta está no Slack." | Cartão do S1 (já enviado antes, e ao vivo de novo se der) |
| Slack e Teams fora | "Os canais caíram; a API e o painel seguem." | Mesma pergunta no **T2**, ao vivo (estado "Canal fora" do C0) |
| API fora (canais respondem "Não consegui consultar…") | "O servidor caiu no palco. Vou mostrar com dados fixos, as extrações reais da última execução." | Frontend em **modo mock** com selo visível **"Dados de fixture"**. Não usar canal nesse modo |
| Lote/classificação (T12) não verde | "Os documentos já estão no acervo, organizados por tema." | **T7** com os 13 documentos; não mencionar lote |
| Digitalização falha | — | Subir o FL em .md pelo T12 (RF23) ou pular a foto |
| Filtros tema/prazo (C16) não verdes | — | T3 sem filtro; não dizer "filtro" |
| T6/M1 não verdes | "E não mudou só o número: com 30 dias, o aviso teria de sair antes do pedido." | **T5/T9** com a §4.5 na tela; não chamar de simulação. M1: não clicar |
| Modo "Relatório da seleção" não verde | — | **T11** por perspectiva (✅), já implementado |

Regras:
- Nunca colar uma resposta manual num canal.
- Nunca apresentar o mock como ao vivo.
- Prints da última demo verde vão para `docs/CHECKPOINT.md`, com hora e SHA.

## 4. Ajustes de fala que a v2 implica no `PITCH.md` (aplicar só se o Lead aprovar)
- **Proposta (0:35):** "no painel, no Slack ou no Teams — a mesma resposta, com a mesma fonte".
- **Viabilidade (3:40):**
  - "os canais são só apresentação: um cartão único no backend Python/FastAPI, adaptado para Slack e Teams";
  - "Teams testado no Microsoft 365 Agents Playground, sem tenant";
  - mais a frase das 7 de 8 funcionalidades.
- **Plano de 6 meses:**
  - mês 5 passa a ser "publicação no tenant da BBTS", e não "conector Teams";
  - "análises semelhantes" e o fluxograma do FL entram no mês 2 ou 3.
- Mantidos: frase-âncora, stack, Bedrock [CONDICIONAL] (default "no plano, não nesta demo") e o mock com selo.

## Decisões necessárias (Lead)
1. O `PITCH.md` passa a seguir esta v2 (MVP em uso, 2 canais)? Se sim, autorizar a atualização.
2. Demo com os 2 canais ao vivo, ou Teams ao vivo e Slack em cartão já enviado? Recomendo o segundo: menos trocas de janela e a mesma prova de paridade.
3. U2 (importar) é o passo mais caro e o mais [CONDICIONAL]. Se o T12 não estiver verde no ensaio, ele sai e a U3 ganha +20 s com o T10.
