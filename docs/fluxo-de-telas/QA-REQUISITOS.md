# QA dos Requisitos v1 (PROPOSTA)

## Sextante — QA de aderência (regulamento + acervo) · 12/11/2026

**Escopo:** `docs/propostas/REQUISITOS-v1.md` comparado com `docs/EVENTO.md`, `docs/ESCOPO-PROJETO.md` e `docs/acervo/` (por grep e leitura dos trechos). Não reli o regulamento nesta etapa; uso a leitura do Gupy feita hoje cedo, já registrada no EVENTO. Não alterei código nem fiz commit.
**Legenda:** OK = confere com a fonte · **ajustar** = existe, mas com seção, critério ou texto a corrigir · **remover** = inventado ou sem fonte.
**Resultado:** 8 ajustar (RF02, RF13, RF17, RF21, RF22, RF26, RF28, RNF04) · 0 remover. Nenhum valor ou prazo inventado. Os problemas são de seção citada, de critério de aceite frágil e de coerência interna.

### Requisitos funcionais
| ID | Veredito | Motivo (fonte verificada) |
|---|---|---|
| RF01 | OK | Regra de produto, sem dado do acervo. |
| RF02 | **ajustar** | 21/03/2027 confere (NG_111 · 3.0.0 · Anexo C, Exemplo 1; também PX_1111-001 · 1.0.0 · Anexo D). Já "7 dias corridos" **não está na 4.6.2**, que diz "ausência de decisão em 7 dias não equivale a aprovação" (sem "corridos"). A regra com "7 dias corridos" é a **NG_111 · 3.0.0 · 4.5.2** (repetida em 8.2.2). Trocar a citação para 4.5.2. |
| RF03 | OK | — |
| RF04 | OK | — |
| RF05 | OK | A pergunta "Uma mesma pessoa pode elaborar, revisar e aprovar?" vem do FAQ do CATÁLOGO (seção 9), que responde "Não consta nas fontes". O grep não acha o tema em nenhum dos 13 documentos. |
| RF06 | OK | NG_111 · 2.0.0 · 2.3 = 30 dias; NG_111 · 3.0.0 · 4.3.1 = 45 dias corridos. |
| RF07 | OK | Atende a 8.2.5 (explicar como a IA funciona). |
| RF08 | OK | R$ 18.250,00 confere (ver RF09). |
| RF09 | OK | CTR_2026-012 · 1.0.0 · CLÁUSULA SÉTIMA: valor global de R$ 18.250,00. Multa de R$ 912,50 = 5% × 18.250 no Apêndice B (Memória de cálculo); repetida no Apêndice E, Exemplo 5. Alçada de diretor na NT_2026-018 · 1.0.0 · Anexo F. Marcos D-45, D-35, D-30, D-20, D-19 e D-3 na PX_1111-001 · 1.0.0 · Anexo B. |
| RF10 | OK | Apêndice B existe e tem o 912,50. |
| RF11 | OK | 13 arquivos = 11 vigentes + 2 substituídos (FM_1111-001 1.0.0 e NG_111 2.0.0). O CATÁLOGO fica fora da contagem. |
| RF12 | OK | — |
| RF13 | **ajustar** | As comparações NG_111 2→3 e FM 1→2 conferem. A RG_1100 1.0.0 de fato não está no acervo, mas a **RG_1100 · 2.0.0 · Anexo K — "O que mudou entre as edições"** traz as diferenças em relação à 1.0.0. Em vez de só tratar o 404, mostrar "versão anterior não está no acervo; diferenças declaradas no Anexo K", com fonte. Isso também reforça a Aderência. |
| RF14 | OK | PX_1111-001 "Vinculado a: NG_111"; NT_2026-018 "Referência: CTR_2026-012", e o CTR cita a NT de volta. A NG_012 é citada e está ausente; a NG_010 é citada (NG_111 · 2.0.0 · 4.1) e está ausente. |
| RF15 | OK | — |
| RF16 | OK | CATÁLOGO, seções 2, 3 e 5 existem. |
| RF17 | **ajustar** | O critério "**exatamente** 3 itens" é frágil. A NG_012 é citada por **5 documentos**: NT_2026-018, CTR_2026-012, NG_1130, PX_1130-001 e NT_2026-021. A NG_010 é citada pela NG_111 2.0.0, que está substituída. A RG_1100 2.0.0 substitui uma 1.0.0 ausente. Uma regra `referencia_ausente` aplicada por documento gera de 5 a 7 itens. Definir: (a) 1 item por **norma ausente**, listando todos os documentos que a citam; (b) se referência vinda de documento substituído entra ou não (NG_010); (c) se RG_1100 1.0.0 vira item `versao_substituida`. Reescrever o aceite como "os itens esperados = lista fechada X, nenhum fora dela". |
| RF18 | OK | — |
| RF19 | OK | NT_2026-018 · 1.0.0 · Anexo F: "A nota técnica cita as alçadas da NG_012." Sugestão: o selo também lista os outros 4 documentos que citam a NG_012 (ver RF17). |
| RF20 | OK | 4.5.1 (45 dias), 4.5.3 (aviso até D-35) e Anexo C (05/05/2027 → 21/03/2027) conferem. N=30 → 05/04/2027 confere. Os 5 documentos da lista de revisão citam o D-45 ou os 45 dias (FM 2.0.0: "exige 45 dias de antecedência"; TB, FL e PX: D-45). Nota: com N=30 também colidem a 4.5.4 / PX 8.5 (assinatura "nunca depois de D-30") e a 4.3.3 (menos de 45 dias exige o diretor). Incluir esses dois conflitos para não parecer resultado incompleto. |
| RF21 | **ajustar** | Valores conferem: NT_2026-018 · 1.0.0 · Anexo F (até R$ 18.000,00 Gerente; de R$ 18.000,01 a R$ 120.000,00 Diretor); a aprovação pela DIRAF está no corpo da NT (seção do valor/alçada) e no Anexo A. Ajustes: (1) citar a DIRAF pela seção certa, porque o Anexo F só diz "Diretor"; (2) aviso obrigatório: "a regra de alçada está na NG_012, que não está no acervo; a simulação usa os valores citados pela NT_2026-018"; (3) a NT foi aprovada em 09/11/2026, então a simulação é hipotética e não reabre a aprovação. |
| RF22 | **ajustar** | Persistência em `data/decisoes.jsonl`. A 8.2.3 indica **PostgreSQL** como banco, e ainda não está confirmado se é obrigatório ou só preferência. Usar PostgreSQL ou registrar a justificativa e a migração no plano de 6 meses; isso afeta o critério Viabilidade (10.3). |
| RF23 | OK | — |
| RF24 | OK | O Bedrock Nova Pro aceita imagem pela API Converse. A conta ainda precisa ser testada (lacuna 2). |
| RF25 | OK | — |
| RF26 | **ajustar** | **Contradição com a demo.** A demo digitaliza uma página impressa da NG_111, mas a NG_111 3.0.0 (e a 2.0.0) já está no acervo, então o RF26 devolve **409** no palco. Opções: (A) subir o acervo inicial **sem um documento** (ex.: FL_1111-001) e digitalizar a página impressa dele, de modo que o catálogo passa de 12 para 13; (B) digitalizar a NG_111 e mostrar "já existe: o texto lido confere com o oficial em X%" como validação, sem publicar. Recomendo a A. Ajustar também o passo 1 do ESCOPO ("13 documentos"). |
| RF27 | OK | Slack gratuito, sem custo (8.2). |
| RF28 | **ajustar** | Depende do RF17: "lista os 3 itens" muda se a regra do radar mudar. Amarrar à mesma lista fechada do RF17. |
| RF29 | OK | — |
| RF30 | OK | Bedrock, sem xAI (8.2). |
| Reajuste 8→10% (Fora) | OK | CTR_2026-012 · 1.0.0 · CLÁUSULA DÉCIMA SEGUNDA: reajuste só pelo IPCA, em prorrogação de mais de 12 meses. |
| Docs fictícios (Fora) | OK | Coerente com o EVENTO (P9) e a decisão do Lead. |

### Requisitos não funcionais
| ID | Veredito | Motivo |
|---|---|---|
| RNF01 | OK | Atende à confiança (10.1) e à 8.2.5. |
| RNF02 | OK | — |
| RNF03 | OK* | A Lei 13.146/2015 (LBI) está certa. *A ligação "critério 10.4 inclui acessibilidade" **não foi confirmada** na minha leitura do Gupy (limite de citação); está marcada como "reconferir" no EVENTO. Manter o requisito, mas não afirmar no pitch que a acessibilidade é critério oficial sem conferir. |
| RNF04 | **ajustar (fonte)** | "Lei 15.263/2025, art. 5" está **fora do acervo e do regulamento**, e eu não verifiquei. Conferir número e artigo na fonte oficial antes de citar no pitch ou na UI; até lá, escrever "boas práticas de linguagem simples". |
| RNF05 | OK | — |
| RNF06 | OK | Metas internas; sem fonte externa. |
| RNF07 | OK | — |
| RNF08 | OK | A fixture tem selo, então não conflita com a 8.5. Na demo oficial, rodar com a API real; fixture só em contingência. |
| RNF09 | OK | Coerente com a 15.4 e o EVENTO (sem credenciais). |
| RNF10 | OK | — |
| RNF11 | OK | 8.5 ("telas estáticas não serão consideradas entregas funcionais"). |
| RNF12 | OK | Slack Free, Bedrock da conta do evento, Tesseract (licença livre). |

### Seções 4–8
- **§4 Limites da imagem** (3,75 MB / 8.000 px): coerente com o limite conhecido da Converse e já marcado "reconferir". OK.
- **§7 Matriz:** o mapeamento para os critérios 10.1–10.5 está coerente.
- **§8 Lacuna 3:** F2–F8 somam ≈ 15–22 h e não cabem junto com o P0. Concordo; isso é o principal risco de viabilidade (abaixo).

### Top 5 riscos
1. **Escopo × tempo:** 27 P0 + F2–F8 (15–22 h) não cabem na janela que sobra até ~07h30 de 13/11 (fim inferido), menos 4–6 h de reserva para integração, QA, demo e submissão. Cortar antes de abrir issues.
2. **409 na demo da digitalização** (RF26): o roteiro atual falha no palco.
3. **Radar "exatamente 3"** (RF17/RF28): a regra por documento gera de 5 a 7 itens. Um teste vermelho ou um número diferente no pitch passa a impressão de "contradição inventada", justamente o risco que o ESCOPO quer evitar.
4. **Stack do 8.2:** persistência em JSONL e nenhum PostgreSQL. Se a lista da 8.2 for obrigatória, isso afeta Aderência e Viabilidade.
5. **Afirmações sem fonte no pitch:** Lei 15.263/2025 (não verificada), acessibilidade como critério 10.4 (não confirmado) e a alçada da NG_012 (norma ausente). Cada uma pode virar pergunta difícil nos 3 min de perguntas e respostas.

### Perguntas à equipe
1. **RF26/demo:** opção A (acervo inicial sem FL_1111-001, digitalizar a página impressa dele) ou B (digitalizar a NG_111 como validação, sem publicar)?
2. **RF17:** o radar agrupa por norma ausente (1 item NG_012 com 5 citantes) ou por documento? Referência vinda de documento substituído (NG_010) entra? RG_1100 1.0.0 vira item?
3. **RF22:** decisões no PostgreSQL agora, ou JSONL com justificativa e migração no plano de 6 meses?
4. Quem confere a Lei 15.263/2025 e o texto integral do critério 10.4 (devo reler o Gupy? exige delegação)?
5. Qual o corte de P0 aceito para caber na janela? Sugestão: F8, RF29, RF14 e RF15 para P1.

## Bussola — QA de produto e UX · 12/11/2026

**Escopo:** `docs/propostas/REQUISITOS-v1.md` comparado com `ESCOPO-PROJETO.md`, `PESQUISA-LEGAL-DESIGN-UX-WRITING.md`, `REQUISITOS-E-FLUXO-DE-TELAS.md` e `docs/acervo/` (grep). Não alterei código nem fiz commit. As decisões 5 e 6 do ESCOPO (upload e digitalização P0) estão preservadas: avalio só o recorte e a testabilidade. Onde concordo com o Sextante, apenas indico, sem repetir.
**Resultado:** 15 ajustar · 0 remover · 4 lacunas (novos itens sugeridos).

### 1. Valor por perfil (6)
| Perfil | Valor no MVP | Passo da demo | Observação |
|---|---|---|---|
| P-EMP Empregado | Claro: data concreta e onde pedir (RF02, RF06) | Nenhum explícito | 1 pergunta de reserva na web basta |
| P-GES Gestor | Claro: prazo de decisão e consequência (NG_111 · 3.0.0 · 4.5.2 + 4.6.2) | Nenhum explícito | Ver RF02 |
| P-DIR Diretoria | Médio: RF08 e RF15 são P0, mas nenhum dos 6 passos os usa | — | Abrir a demo no T1 com o perfil Diretoria, em 5 s |
| P-FIN Financeiro | Claro: R$ 18.250,00, R$ 912,50, alçada com selo NG_012 | 4 | OK |
| P-JUR Jurídico | Claro: radar, lado a lado, o que mudou | 3, 4 | OK |
| P-RH RH | O diferencial mais forte ("E se?" 45→30, "simular antes de publicar") | 5 | OK |

### 2. Por requisito
| ID | Veredito | Motivo (produto/UX) |
|---|---|---|
| RF01 | OK | Aceite testável (`citacoes` iguais nos 6 perfis) |
| RF02 | **ajustar** | (1) Citar a 4.5.2 (Sextante) e também a 4.6.2, que traz a consequência mostrada ao gestor. (2) O aceite cobre 2 de 6 perfis: criar 1 caso "pergunta → 1ª frase esperada" por perfil, a partir dos modelos da PESQUISA. (3) Terminar com a próxima ação (L3) |
| RF03 | **ajustar** | "3 perguntas sugeridas por perfil" sem lista. Fixar as 18 perguntas (fixture) e incluir cada uma no eval, com resposta esperada ou "não consta" |
| RF04 | OK | Ver D1 (formato único de exibição) |
| RF05 | **ajustar** | "Sugestão de quem procurar" não tem regra. O exemplo da PESQUISA (GGC) é de férias e não serve para "elaborar, revisar e aprovar". Definir uma sugestão fixa por assunto ou exibir só a sugestão de pergunta |
| RF06 | OK | — |
| RF07 | OK | — |
| RF08 | **ajustar** | "Próximo prazo" depende de "hoje". Usar a data de referência fixa (L2) e registrar o valor esperado no aceite |
| RF09 | **ajustar** | O aceite só confere valores do Financeiro. Exigir 1 valor conferido por painel: Pessoas 21/03/2027; Jurídico CLÁUSULA DÉCIMA TERCEIRA; Gestão 1 item da RG_1100 ou da NT_2026-021. Sem isso, o painel Gestão pode ficar vazio sem nenhum teste falhar |
| RF10 | OK | Complementa o RF04 (painel × resposta); não é duplicado |
| RF11 | OK | — |
| RF12 | OK | — |
| RF13 | OK | Concordo com o ajuste do Sextante (Anexo K da RG_1100); conta no veredito dele |
| RF14 | **ajustar** | Usar a mesma regra do radar para referências vindas de documento substituído (NG_010 ← NG_111 2.0.0). Se o grafo mostrar e o radar não, a interface se contradiz |
| RF15 | **ajustar** | "Fontes legíveis em papel" é subjetivo. Aceite: cada afirmação impressa com `código · versão · seção` por extenso; até 2 páginas A4; cor nunca é o único sinal |
| RF16 | **ajustar** | "P0 (fora da demo)" é ambíguo na hora de cortar. Rotular como P1 ou "P0 só backend, sem tela" |
| RF17 | **ajustar** | Concordo com o Sextante: lista fechada, agrupada por norma ausente. Acrescento a regra de UX: cada item mostra **quantos e quais** documentos citam a norma ausente ("NG_012 citada por 5 documentos") e termina com uma ação ("Encaminhar à GCO"). O número dito no pitch tem de ser o mesmo da tela |
| RF18 | OK | — |
| RF19 | OK | Selo também no painel Gestão (NG_1130 · 4.9 cita a NG_012) |
| RF20 | **ajustar** | Além dos conflitos que o Sextante listou: (1) regra explícita de conflito (aviso D-35 antes da solicitação ⇔ N < 35) e casos de teste N=30, N=35 e N=40; (2) texto do erro fora da faixa definido segundo a NN/g, por exemplo "Use um número entre 1 e 90 dias.", ao lado do campo e sem "inválido"; (3) datas concretas primeiro, com o D-n entre parênteses (RNF04) |
| RF21 | OK | Concordo com o ajuste do Sextante (aviso de NG_012 ausente); conta no veredito dele |
| RF22 | OK | Valor de produto claro (fecha a jornada "depois da resposta"). A questão do PostgreSQL fica com o Sextante |
| RF23 | OK | — |
| RF24 | **ajustar** | É o item de maior risco no P0 (motor de leitura não testado). Recorte: P0 = 1 página .jpg/.png; PDF escaneado com várias páginas = P1. No pitch, "acervo legado em papel" é **hipótese**: não afirmar que a BBTS tem esse problema sem fonte |
| RF25 | **ajustar** | Rolagem sincronizada imagem × texto vai para P1. P0 = linhas incertas marcadas (ícone + texto), "conferi" e campos obrigatórios. Mantém a revisão humana com menos frontend |
| RF26 | OK | Concordo com o 409 apontado pelo Sextante e com a opção A; conta no veredito dele |
| RF27 | OK | — |
| RF28 | OK | Amarração ao RF17 já pedida pelo Sextante. Sugestão de UX: mostrar "Ver resposta normal" quando o roteamento por palavra-chave levar ao radar |
| RF29 | OK | — |
| RF30 | OK | — |
| RNF01–03 | OK | — |
| RNF04 | **ajustar** | (1) "100% das siglas do glossário" sem glossário: definir a fonte (ex.: NG_111 · Anexo D + CTR_2026-012 · Apêndice I) ou criar `glossario.json`. (2) Critério do teste com 2 pessoas: as duas acham "21/03/2027" em < 60 s, sem ajuda. (3) Conflito interno: a checklist pede datas concretas no lugar de D-n, mas o modelo RH e o T6 usam "D-35". Regra: data primeiro, D-n entre parênteses. (4) Vale a ressalva do Sextante sobre a Lei 15.263: a PESQUISA diz ter lido no planalto.gov.br em 12/11, mas ninguém reconferiu |
| RNF05 | **ajustar** | Faltam o texto de erro do RF20 e um teste para "perto do problema" (mensagem ao lado do campo, não em aviso genérico). O resto cobre a NN/g |
| RNF06–12 | OK | — |

Itens "ajustar" (15): RF02, RF03, RF05, RF08, RF09, RF14, RF15, RF16, RF17, RF20, RF24, RF25, RNF04, RNF05 e D1 (abaixo).

### 3. Duplicados ou ambíguos
- **D1 Formato da citação (ajustar).** Os documentos usam três formatos: REQUISITOS `NG_111 · 3.0.0 · 4.3.1`, PESQUISA "PX_1111-001 v1.0.0, Anexo D" e o id de seção `CLÁUSULA SÉTIMA` em maiúsculas. Definir um formato de exibição (sugestão: `PX_1111-001 · v1.0.0 · Anexo D`, cláusula em caixa normal) e usá-lo em voz e tom, no Slack e no relatório.
- **D2 Nomes de perfil:** P-RH/rh × ggc da v0. Os aliases da 6.1 resolvem; basta documentar o mapa no frontend.
- **D3 RF06 × RNF02 × RF17:** três ângulos do mesmo dado. Não é duplicado; o teste do radar deve reutilizar o do RNF02.
- **D4 Passo 5 do ESCOPO:** roda os dois cenários de "E se?". Se ⚖️2 = não, o roteiro precisa dizer que fica um só.

### 4. Cobertura da pesquisa
| Item | Coberto por | Falta |
|---|---|---|
| Voz e tom (6 situações) | RF05, RF06, RF20, §4 (foto), RNF08/§5 (falha) | Tom para "decisão registrada" (RF22) e para "Consultando o acervo…" (Slack): 1 linha cada |
| Modelos por perfil | RF02 | O aceite testa só 2 de 6 |
| Checklist Lei 15.263 | RNF04 | Critério do teste com o público; glossário; conflito com D-n |
| Erros NN/g | RNF05, RF03, RF20, §4 | "Perto do problema" sem teste; texto do RF20 |
| Stanford (Hagan) | — | **"Próximos passos no fim" e "um destaque por tela" não viraram requisito** (L3) |

### 5. Lacunas (novos itens sugeridos)
- **L1 Eval do PRD sem RNF.** `eval/perguntas.yaml` (≥ 15 perguntas, ≥ 80% com citação certa, 100% de "não consta" corretos) não aparece nos requisitos. Sugestão: RNF13. É a prova de "respostas confiáveis" diante do júri.
- **L2 Data de referência.** RF08, o painel Pessoas e o "E se?" precisam de um "hoje" fixo e configurável (ex.: 12/11/2026), para a demo não depender do relógio.
- **L3 Próxima ação.** Toda resposta, item do radar e simulação termina com 1 ação ("Peça no Portal Raiz até 21/03/2027", "Encaminhar à GGC", "Revisar 5 documentos"). Liga a jornada "depois da resposta" ao RF22; é o diferencial de rotina de trabalho.
- **L4 Ordem de corte pelo que o júri percebe em 60 s.** Proteger RF04/RF06/RF10 e RF17–RF20. Se for preciso cortar: RF25 rolagem sincronizada → PDF escaneado (RF24) → RF29 → RF14 → RF15 → F8 enxuto. Compatível com a pergunta 5 do Sextante. Decisão do Lead e da equipe.

**Decisão pendente:** aprovar L2 (data de referência) e L3 (próxima ação). As duas mudam critérios de aceite, mas não o contrato.
