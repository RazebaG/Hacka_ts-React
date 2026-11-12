# Telas no pitch de 5 min — Clankers · Desafio 2 (PROPOSTA, Ribalta, 12/11/2026)

Fontes: `docs/propostas/FLUXO-DE-TELAS.md` §3 e §5, `docs/ESCOPO-PROJETO.md` (Demo, 6 passos), acervo em `docs/acervo/`. **Só vale depois de aprovada pela equipe.** Não altera `docs/PITCH.md`.

> **Divergência:** o ESCOPO e o FLUXO têm 6 passos (digitalizar → Slack → radar → perspectivas → E se? → decisão), enquanto o `docs/PITCH.md` está na Opção A, com 5 cenas só na web, Slack como P1, simulador e selo [CONDICIONAL] e relatório no fim. **O Lead precisa escolher qual demo vale antes do ensaio.**

## 1. Telas que entram no pitch (demo 1:05–3:05, cerca de 20 s por passo)

| Tempo | Passo | Telas | O que a tela precisa mostrar | Fala-âncora | Plano B (sem mentir) |
|---|---|---|---|---|---|
| 0:35–1:05 | Proposta (abertura) | **T1** Visão geral, perfil Diretoria | Destaque "3 pontos pedem atenção" | — (fala da proposta) | Slide/título |
| 1:05–1:25 | 1 · Digitalizar | **T7** (12 docs) → **T12** (foto do FL_1111-001) → **T13** (1 linha ⚠ incerta → "Conferi" → Publicar) → **T7** (13) | Contador 12 → 13; texto lido ao lado da imagem | "Nada vira fonte sem uma pessoa conferir." | Leitura falhou: subir o FL em .md pelo T12 (RF23). Se o T12 não estiver verde: começar no T7 com 13 documentos e não falar de digitalização |
| 1:25–1:40 | 2 · Slack | **S1** `/acervo quais regras mudaram e estão em conflito?` | 3 pontos com fonte + "Abrir no painel" | "No Slack, onde o time já trabalha." | Slack fora ou bot não verde: **T2** com a mesma pergunta → T4. Nunca colar resposta manual |
| 1:40–2:00 | 3 · Radar | S1 "Abrir no painel" → **T4** → **T5** (NG_111 2.0.0 × 3.0.0) | 30 × 45 lado a lado; ⓘ NG_012 ausente, citada por 5 documentos | **"Não citamos o documento: citamos o número, e avisamos se envelheceu."** | Web direto em `/radar` |
| 2:00–2:25 | 4 · Perspectivas | **T3** Jurídico ↔ Financeiro → R$ 18.250,00 → **T8** Cláusula Sétima; multa R$ 912,50 → **T8** Apêndice B | O mesmo número com fontes nas duas perspectivas | "Cada número abre o trecho exato." | Backend fora: mock com selo "Dados de fixture" |
| 2:25–2:50 | 5 · E se? | **T6** antecedência N=30 → conflito D-35 + 5 documentos a revisar; faixa "Simulação: nada muda nos documentos…" | Recalcula ao vivo; marcado como hipotético | "O RH testa a regra antes de mudar a norma." | T6 não verde: T9/T5 com a comparação v2→v3 e fala sobre a §4.5, sem chamar de simulação. Alçada 20.000 só se ⚖️2 = sim (ver §2) |
| 2:50–3:05 | 6 · Decisão | T6 → **M1** "Encaminhar à GGC" → sucesso com data e hora | Registro com responsável e data | "Da leitura à decisão registrada." | ⚖️4 = não: apontar o botão como P1. Não clicar num botão que não grava |

**Total:** 9 telas web + modal M1 (T1, T7, T12, T13, T4, T5, T3, T8, T6, M1) + S1. Navegação por rota profunda (`/radar?item=`, `/e-se?regra=&valor=`) já aberta em abas, para encurtar cliques.

## 2. Ficam fora do pitch de 5 min ou só no Plano B

| Tela | Situação | Motivo |
|---|---|---|
| **T2** Pergunte ao acervo | Só Plano B do passo 2 e pergunta do júri (abstenção "não consta") | Não está nos 6 passos; ótima resposta para a pergunta sobre IA/alucinação |
| **T9** O que mudou | Plano B do passo 5 | O T5 já mostra o contraste 30 × 45 |
| **T10** Mapa do acervo | Fora (P1 no corte) | Sem tempo; usar só em pergunta do júri se estiver verde |
| **T11** Relatório executivo | Fora (P1 no corte) | Na Opção A era o fechamento. Se for P1, citar no plano de 6 meses |
| **T0** Topo / troca de perfil | Fora como passo; aparece em segundo plano | Trocar de perfil custa tempo; abrir já em Diretoria |
| T6 alçada 18.000 → 20.000 | Só se ⚖️2 = sim e sobrar tempo no passo 5 | O ESCOPO diz P0 (decisão 2) e o Lead disse P1 / não central |
| Jornadas P-EMP, P-GES, P-JUR (T9 RG_1100) | Fora | RG_1100 está fora da demo |

## 3. Riscos de tempo e de verdade
1. **Passo 1 é o mais caro:** a digitalização real "em < 1 min" não cabe em 20 s. Recomendo uma das saídas abaixo. Se nenhuma couber, o passo sai.
   - **(a)** foto já enviada e texto já lido antes; ao vivo, só "Conferi → Publicar". Dizer: "a leitura levou X s antes de entrarmos".
   - **(b)** tirar 15 s do Diferencial.
2. A troca **Slack ↔ web** (passos 2→3) precisa estar ensaiada. Se o bot falhar uma vez no ensaio, a demo começa direto no T2.
3. **Conferido no acervo:**
   - R$ 18.250,00 está na Cláusula Sétima do CTR_2026-012 (l. 54–55), e a multa de R$ 912,50 no Apêndice B;
   - a NG_012 aparece em 5 documentos (CTR_2026-012, NT_2026-018, NT_2026-021, NG_1130, PX_1130-001) e não está no acervo;
   - 30 × 45 está na NG_111 v2 §2.3 × v3 §4.3.1.
4. Os passos 1, 2, 5 e 6 dependem de issues que ainda não estão verdes (BE #7/#8, FE #5, Slack, digitalização C8, decisões C9). Cada um fica [CONDICIONAL] até ter SHA verde, e só então entra como ao vivo.

## Decisão necessária (Lead)
- Qual demo vale: **ESCOPO, 6 passos** ou **PITCH Opção A, 5 cenas**? Depois da escolha, eu atualizo o `docs/PITCH.md` numa tarefa autorizada.
- Passo 1: saída (a), saída (b) ou cortar?
- T11 relatório: fecho da demo (como na Opção A) ou P1?
