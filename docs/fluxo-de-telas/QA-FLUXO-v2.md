# QA do FLUXO-DE-TELAS-v2 + REQUISITOS-v3 (PROPOSTA)

## Bussola: produto e UX · 12/11/2026

**Escopo:** `docs/propostas/FLUXO-DE-TELAS-v2.md` e `docs/propostas/REQUISITOS-v3.md` comparados com `docs/FUNCIONALIDADES-ESPERADAS.md`, `docs/EVENTO.md` e `docs/acervo/` (grep). Não alterei código nem fiz commit. As decisões humanas de 12/11 (Slack + Teams, upload e digitalização no MVP) estão preservadas: avalio só o recorte, a testabilidade e o esforço.
**Legenda:** OK · **ajustar** (manter, corrigindo) · **remover** (tirar do P0 ou do documento).
**Resultado:** 12 ajustar · 2 remover. Os críticos (C) trazem o texto exato a mudar.

### 1. Conferido no acervo (sem ajuste)
- RF09: o Apêndice C do CTR_2026-012 traz 25/11/2026 (vistoria) e 30/11/2026 (início). 30/03/2027 fica fora de "próximos 30 dias" a partir de 12/11/2026 ✓.
- Componente de divergência: PX_1111-001 · 2.2 diz "Em qualquer divergência, prevalece a NG_111" ✓.
- RF17: NG_111 v3 tem vigência até 03/02/2028, PX_1111-001 até 10/02/2028, CTR_2026-012 até 29/04/2027 e NG_1130 até 06/01/2028. Logo, `vigencia_ate=2026-12-31` → vazio ✓.
- RF42: os grupos (NG/PX Normativo, PP Operacional, GU/FM/TB/FL Apoio, RG Programa, CT Temporário, CTR/NT Instrumento, DV Residual) conferem com o CATÁLOGO ✓.
- RF43: as etapas D-45/D-35/D-30/D-3 do FL_1111-001 batem com PX_1111-001 · 8.2/8.4/8.5/8.6 ✓.
- RF33: 21/03/2027 em NG_111 · v3.0.0 · Anexo C ✓.

### 2. Por item
| Item | Veredito | Motivo |
|---|---|---|
| **Teams / S2 (RF33)** | **ajustar** | Valor real para a Viabilidade na BBTS (a IDEIA diz "no lugar do Teams"), e a paridade pela C0 é boa arquitetura. Mas o SDK e o Playground não foram testados (L-e), a estimativa é de 2–4 h e o Playground não é o Teams real. Falta (1) **timebox + plano B** e (2) destino exato do "Abrir no painel" ("T2/T8" é ambíguo). Ver C3 |
| C0 / RF34 paridade | OK | Teste unitário com as 18 perguntas nos 2 adaptadores é objetivo e barato. É o que torna o Teams viável |
| RNF17 | OK | Reaproveita o teste do RF34 |
| RF27/RF28 | OK | — |
| RF29 (Slack + Teams, P1) | OK | — |
| **Lote + tema (RF35)** | OK | Aceite com 4 arquivos e erro por arquivo é ótimo e testável. Valor de uso real (funcionalidade 1) |
| **RF36 classificação** | **ajustar** | As regras 1 e 2 (código/`Vinculado a`/`Referência`) são determinísticas e conferem com os cabeçalhos (FM, TB e PX "Vinculado a: NG_111"; NT "Referência: CTR_2026-012"). A **regra 3 ("semelhança, confiança baixa")** não tem limiar nem caso esperado, então não é testável, e aumenta o esforço. Para o MVP: sem código → "Sem tema: escolha um." Regra 3 → P1 |
| RF23/RF24 dentro do lote | OK | — |
| RNF18 | OK | — |
| **Filtros (RF37), parte do T3/T7/T10** | **ajustar** | O tema nos 4 e o prazo no T3 têm valor claro (funcionalidade 5). Fazer **só no FE** (sugestão do próprio Planner): corta parâmetros novos da API (C16) |
| **Filtro de prazo no T4 (RF37/RF17)** | **remover** | Os itens do radar não são prazos. "Fim de vigência do documento envolvido", com regra para tipos sem data e opção "sem prazo" que não aparece em nenhum componente, é ambíguo e pouco útil. A funcionalidade 5 já fica coberta pelo prazo no T3 e pelo tema no T4/T7/T10. Ver C2 |
| **RF17** | **ajustar** | (1) Tirar o `vigencia_ate` (acima). (2) O componente "Divergência entre fontes" não tem **caso real entre documentos vigentes** no ACME: os itens são versão substituída (resolvida pela vigência) e norma ausente. Definir na interface a diferença: "substituída → vale a vigente" × "divergência → mostramos as duas, sem escolher". E dizer qual caso o júri vê (ver Matriz, item 7) |
| **Avaliar resposta (RF39)** | **ajustar** | (1) "Uma 2ª avaliação da mesma resposta substitui a anterior": num canal do Slack/Teams, várias pessoas avaliam a mesma `resposta_id` e, sem ID de usuário (RNF16), a última apaga as outras. Usar "cada clique gera 1 registro; contar por resposta". (2) Nada consome a avaliação no P0 (o RF40 é P1). Fechar o ciclo com 1 linha visível: "Respostas avaliadas: n · úteis: n" no T1 ou em `/api/saude`. Sem isso, o júri vê só um botão comum |
| RF40 análises semelhantes (P1) | **ajustar** | Ficar em P1 é correto. "Nunca mostra pergunta de outro perfil com dado pessoal" não é testável (o MVP não detecta dado pessoal). Trocar por "mostra só perguntas do mesmo perfil; o histórico não guarda nome, e-mail nem ID (RNF16)" |
| **Seleção → T11 (RF41)** | **ajustar** | Grande valor de uso (funcionalidade 6) e custo baixo sobre a PR #6. Problema: o aceite "item cuja fonte mudou recebe aviso" depende de revalidação, que só existe no `POST /api/relatorio` **opcional**. Ou o aviso sai do aceite P0, ou o FE revalida com `GET /api/documentos/{codigo}` (já existe) comparando a versão. Ver C4 |
| **Camada na citação (RF42/RF04/RNF14)** | **ajustar** | Erro factual: **FL_1111-001 diz "Vinculado a: PX_1111-001"**, e não a NG_111. A subordinação precisa seguir a cadeia (FL → PX → NG). Ver C1. O formato ficou longo para o chip: no Slack/Teams, mostrar só "PX · Normativo" e deixar o texto completo no T8 |
| **T10/T11 fora da ordem de corte (RF14/RF15)** | **ajustar** | Proteger o que está **implementado** (PR #6) é correto. Mas os **Δ novos** (filtro por tema e legenda por camada no T10; modo seleção no T11) **não** estão implementados e devem entrar na ordem de corte como itens próprios. Hoje ficam protegidos de carona |
| RF11 tema no T7 | **ajustar** | O aceite "NG_1130 aparece na série da sua faixa" não tem valor esperado. A tabela do CATÁLOGO §5 só tem faixas de 3 dígitos, e o próprio v3 abre a L-f. Fixar o valor (ex.: Série 11, se confirmado no CATÁLOGO) ou tirar o NG_1130 do aceite |
| RF38 (reservado) | **remover** | Linha vazia: só gera ruído na contagem e na matriz. Apagar a linha e manter a nota "RF38 não usado" no topo |
| RF43 fluxograma FL (P1) | OK | É P1 com justificativa razoável. Observação: é o exemplo mais literal da funcionalidade 4 ("fluxograma… cada elemento remete à fonte") e o FL já é texto de fluxograma. Se sobrar 1–2 h, é o P1 que mais rende em 60 s |
| RNF09, RNF14, RNF16, RNF06 | OK | RNF16 é bom. Coerente com a privacidade |
| **Matriz: 8 funcionalidades** | **ajustar** | Cobertura 1–6 e 8 OK. **Item 7 ("sinaliza divergência entre fontes em vez de escolher")**: no ACME não há divergência entre documentos vigentes (busca rápida); a matriz dá P0 sem dizer qual caso o júri vê. Propor: (a) declarar que no ACME as divergências são versão e norma ausente; ou (b) se a ⚖️3/L-g autorizar dados sintéticos, um documento de teste no **lote** com prazo diferente da NG_111 gera divergência real no radar e mostra as funcionalidades 1 e 7 juntas [hipótese; depende da organização] |
| **§9 ordem de corte × esforço (v3 §2 e §6)** | **ajustar (C5)** | F2–F8 (≈ 15–22 h) + F10–F17 (≈ 15–22,5 h) somam **≈ 30–44 h**. A janela vai até ~07h30 de 13/11 (EVENTO, inferido), menos a reserva. A lista de corte só tira itens pequenos (≈ 5–8 h, estimativa minha) e **protege quase todo o novo** (RF33–RF37, RF39, RF41, RF42). A conta não fecha. Ver C5 |

### 3. Ajustes críticos: texto exato a mudar
**C1 · REQUISITOS-v3, RF42, coluna "Regra"**
- De: `Subordinação por \`vinculado_a\` ("a NG manda; os demais tipos a detalham", CATÁLOGO item 1)`
- Para: `Subordinação pelo \`Vinculado a\` do cabeçalho, seguindo a cadeia até a NG (ex.: FL_1111-001 → PX_1111-001 → NG_111). O chip mostra o pai direto.`
- E no aceite, acrescentar: `FL_1111-001 → "FL Fluxograma · Apoio · subordinado à PX_1111-001"`.

**C2 · REQUISITOS-v3, RF17 e RF37; FLUXO-v2 T4 e C16**
- RF17, coluna "Alteração". De: `Filtros de tema e prazo (= **fim de vigência** dos documentos vigentes envolvidos)`. Para: `Filtro de tema`.
- RF17, aceite: retirar `` `vigencia_ate=2026-12-31` → "Nenhum item neste filtro…" (nenhum documento vigente envolvido vence antes); ``.
- RF37, "Regra": retirar a frase de `Prazo no T4 = \`vigencia_ate\`…` até `…com a opção "sem prazo" desmarcada.`. Trocar "T3, T4, T7 e T10" por `Tema em T3, T4, T7 e T10; prazo só no T3`.
- FLUXO-v2 T4: retirar `Prazo [Vigência até 03/02/2028 ×]` do esboço e `&vigencia_ate=` / `itens[].vigencia_ate` dos dados; rota `/radar?tema=`.

**C3 · REQUISITOS-v3, RF33, colunas "Regra" e aceite**
- Acrescentar à regra: `Timebox: 1 h para rodar o "eco" no Agents Playground. Se não rodar, o Teams vira P1 e o pitch mostra o mesmo cartão (Adaptive Card gerado pela C0) como prova de paridade, com o Slack ao vivo.`
- Aceite. De: `"Abrir no painel" que abre o T2/T8`. Para: `"Abrir no painel" abre o T2 com a pergunta; cada citação abre o T8 na seção`.

**C4 · REQUISITOS-v3, RF41, aceite e regra**
- De: `item cuja fonte mudou recebe aviso`
- Para: `ao abrir o T11, o FE confere cada fonte com GET /api/documentos/{codigo}; se a versão vigente for outra, o item recebe "Esta fonte mudou desde que foi selecionada."`

**C5 · REQUISITOS-v3 §2, linha "§9 corte"**
- Trocar "Protegidos (acréscimo): RF33, RF34, RF35, RF36, RF37, RF39, RF41, RF42" por:
  `Protegidos: RF34, RF35 (regras 1–2 do RF36), RF39 (sem o RF40), RF41, RF42. Rebaixáveis, nesta ordem, depois dos já listados: RF36 regra 3 → RF37 parâmetros na API (fica só no FE) → Δ do T10 (tema/legenda) → RF33 se a timebox de 1 h falhar (C3) → filtro de prazo no T4 (já removido, C2).`
- Acrescentar: `Antes de abrir issues, somar as fatias aprovadas; o total P0 deve caber na janela menos 4–6 h de reserva.`

### 4. Valor do MVP em uso (não roteiro)
| Tarefa | Valor real | Observação |
|---|---|---|
| U1 consultar (web/Slack/Teams) | Alto | Mesmo cartão nos canais: o argumento de "dentro do fluxo de trabalho" |
| U2 importar em lote | Médio-alto | O tema sugerido com motivo ("código se liga à NG_111") é explicável. Sem a regra 3, continua útil |
| U3 área por tema + prazo | Alto (Financeiro/Jurídico) | O prazo só faz sentido no T3 |
| U4 divergência | Médio | Sem divergência real entre vigentes no ACME (Matriz item 7) |
| U5 seleção → relatório | Alto (Diretoria) | É o "depois da resposta"; custo baixo sobre a PR #6 |
| U6 reaproveitar (P1) | Baixo no MVP | Precisa de histórico com volume. P1 correto |
| U7 relações | Médio | Já implementado |

### 5. Top 5 riscos
1. **Esforço × janela:** ≈ 30–44 h de fatias para menos de ~24 h restantes. A ordem de corte atual não fecha a conta (C5).
2. **Teams não testado** (SDK/Playground, RAM de 7,7 GB): pode consumir 2–4 h sem demo. Precisa de timebox e plano B (C3).
3. **Funcionalidade 7 sem caso real** de divergência entre vigentes: o júri pode perguntar "mostre uma divergência" e só há versão/norma ausente (Matriz).
4. **Dados errados na camada** (FL → PX) e regras ambíguas (prazo no T4, NG_1130 no RF11, semelhança no RF36): testes vermelhos ou interface incoerente (C1, C2).
5. **Avaliação sem consumidor e sobrescrita em canal compartilhado** (RF39): a funcionalidade 8 parece "botão decorativo" e perde dados no Slack/Teams.

**Decisões pendentes (Lead/equipe):** aprovar C1–C5; definir o caso do júri para a funcionalidade 7 (opção a ou b, que depende da ⚖️3).
