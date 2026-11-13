# Fluxo de telas · Ficha do Documento e Fontes em evidência (PROPOSTA v1 · 12/11/2026)

> **Para:** equipe de frontend. **Base:** `FLUXO-DE-TELAS-v2.md` (T0–T13 já existem) e `REQUISITOS-FICHA-DO-DOCUMENTO-v1.md` (RF44–RF70).
> **Regra:** reaproveitar os componentes existentes (`fg-card`, `fg-pilula`, `BadgeStatus`, `CitacaoCard`, `Icon`, rotas por History API). Nada de dependência nova de roteamento.
> **Dados:** `CONTRATO-API-ADENDO-v0.4.md` e o exemplo `mock-ficha-CTR_2026-012.json`. Enquanto o backend não entrega, usar o mock em `src/mocks/ficha.ts` (mesmo padrão dos mocks v2).

---

## 1. Visão geral: onde as telas novas entram

```
Início (T1) ─┬─▶ Fila de atenção (T17, P1) ──▶ Ficha (T14)
             ├─▶ Catálogo (T7) ──────────────▶ Ficha (T14) ─▶ Documento (T8, seção destacada)
             └─▶ Pergunte (T2) ── chip de fonte ▶ Ficha (T14)        ▲
                     │                                                │
                     └─ Painel de Fontes (novo) ── "abrir documento" ─┘
Ficha (T14) ─▶ Modo apresentação (T16, P1) ─▶ Exportar / Slack / Teams
Ficha (T14) ─▶ "Perguntar sobre este documento" ─▶ T2 com escopo fixado
```

**Mudança de hierarquia:** hoje o T8 (Documento) é uma lista de seções. A **Ficha (T14) passa a ser a porta de entrada** de um documento; o T8 vira "Ler o texto completo" dentro da ficha (aba ou link). Quem chega por citação continua indo direto ao T8 na seção destacada.

### Rotas novas (somar a `src/app/rotas.ts`)

| Tela | Rota | Observação |
|---|---|---|
| T14 Ficha | `/documento/:codigo/ficha` (query opcional `?perfil=`, `?v=` versão) | Antes do padrão `/documento/:codigo` (ordem importa no `ROTAS`) |
| T16 Apresentação | `/documento/:codigo/apresentar` | Tela cheia; `?cartao=3` abre no cartão |
| T17 Fila de atenção | `/atencao` (query `?tema=&tipo=&situacao=&ordenar=`) | P1 |
| Painel de Fontes | sem rota: componente dentro de T2 (e blocos "Baseado em") | |

---

## 2. T14 · Ficha do Documento (tela principal da funcionalidade)

> Os números do wireframe (43 seções, ~10 páginas) são os do CTR_2026-012 real do acervo. Para o pitch, o mesmo layout deve ser mostrado com o documento sintético de ~100 páginas (issue F-08), onde o ganho de tempo é de ~50 min para ~4 min.

**Objetivo:** em 10 segundos a pessoa sabe do que se trata e se deve se preocupar; em 2 minutos sabe o que fazer; em 5 minutos consegue explicar o documento a outra pessoa.
**Perfis:** todos (RF59 muda a ênfase). **Dados:** `GET /api/documentos/{codigo}/ficha` (C22).

### 2.1 Layout (desktop ≥ 1100 px)

```
┌ Voltar ───────────────────────────────────────────────────────────────────────────────────────┐
│ CTR_2026-012 · [Vigente]  [Contrato · Instrumento]  [Interna]  Perfil: [Gestor ▾]  v1.0.0 ▾   │
│ Contrato de Locação de Espaço                                                                  │
│ ┌ NÍVEL 1 · RELANCE ────────────────────────────────────────────────────────────────────────┐ │
│ │ ● Em vigor até 29/04/2027 (faltam 168 dias)            Leitura ~12 min · Ficha 3 min │ │
│ │ "Locação de 8 estações e uma sala de reunião por 150 dias, R$ 18.250,00 no total;         │ │
│ │  vistoria até 25/11/2026 e pedido de prorrogação até 30/03/2027."   [Resumo da IA · fonte ▸]│ │
│ │ ┌ R$ 18.250,00 ┐ ┌ 25/11/2026 ┐ ┌ R$ 912,50 ┐                                              │ │
│ │ │ valor global │ │ vistoria   │ │ multa por inexecução (5%)                                │ │
│ │ └ Cláusula 7ª ─┘ └ Apêndice C ┘ └ Apêndice B ┘                                              │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ GOVERNANÇA (lida do documento) ──────────────────────────────────────────────────────────┐ │
│ │ Elaborado por: GCO · Aprovado por: DIRAF · Assinada em: não consta · Classificação: interna │ │
│ │ Vinculado a: — · Referências: NT_2026-018, NG_012 (ausente no acervo ⚠)                     │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ MAPA DO DOCUMENTO (43 seções · ~10 págs) ─ [Tudo][Prazo][Valor][Obrigação][Risco] ───────┐ │
│ │ ▓▓░░▓▓▓░░░░▓░░░▓▓░░░░░░▓░░▓▓▓▓░░░░░░░░░▓░░░░░░░░░░░░░░░░▓░░░░░                          │ │
│ │  ↑ clique numa célula: abre a seção · passe o mouse: título + sinais                       │ │
│ └───────────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┬──────────────────────────────────────┤
│ NÍVEL 2 · O QUE ISSO EXIGE DE MIM                      │ Alertas (2)                          │
│  ▸ Fazer a vistoria · GOC · até 25/11/2026 [Literal]   │  ⚠ NG_012 citada e ausente no acervo │
│     Sem vistoria não há termo de entrega. Cl. 6ª ▸      │  ⚠ Alçada: valor acima de gerente   │
│  ▸ Pedir prorrogação · GCO · até 30/03/2027            │ Perguntas sugeridas                  │
│  ▸ Atestar a nota em 5 dias úteis · GOC                │  › Posso rescindir sem multa?        │
│ Pontos-chave  [Obrigações][Prazos][Valores][Riscos]…   │  › Quem paga o IPTU?                 │
│  (cartões com selo de origem, fonte e "Incluir no      │ [Perguntar sobre este documento]     │
│   relatório")                                          │ [Apresentar em 5 min] [Exportar]     │
│ Cobertura: 43/43 seções · 31 itens verificados ·       │ Ler o texto completo (T8)            │
│ 0 descartados · modo: IA (Nova Pro)                    │                                      │
└────────────────────────────────────────────────────────┴──────────────────────────────────────┘
```

### 2.2 Blocos e comportamento

| Bloco | Conteúdo | Interação | Estados |
|---|---|---|---|
| **Cabeçalho** | código, `BadgeStatus`, tipo/camada, classificação, seletor de perfil (RF59), seletor de versão | Trocar perfil refaz a ordem dos blocos (sem recarregar) | substituída: faixa âmbar "Esta é a v1; a vigente é a v2" + botão |
| **Relance** | semáforo, contagem de dias, tempo de leitura × ficha, BLUF, 3 números | Clicar no número abre a fonte no T8 | `gerando`: esqueleto + "Estou lendo as seções (12/47)" |
| **Governança** | selos: elaborado, aprovado, aprovado em, assinada em, classificação, vínculo, referências | Selo vazio = "não consta no documento" (cinza, nunca preenchido) | |
| **Mapa de calor** | faixa de células, uma por seção, largura proporcional ao texto, cor por sinal; filtro por sinal | Hover: tooltip (título, sinais); clique: T8 na seção; teclado: setas entre células | Alternativa acessível: lista "Seções com mais sinais" |
| **O que isso exige de mim** | ações: verbo + quem + prazo + consequência + fonte + selo de origem | Expandir mostra o trecho literal; "Incluir no relatório" | vazio: "Este documento não cria ações para você" |
| **Pontos-chave** | abas por tema; cartões com valor, fonte, selo | Igual aos cartões do T3 (reaproveitar) | |
| **Alertas** | itens do Radar sobre este documento; conflitos | Clique abre T4 filtrado (`?codigo=`) | |
| **Cobertura** | "43/43 seções · 31 verificados · 0 descartados · modo IA/extrativo" | Descartados > 0: link "ver por que" (lista, sem texto do documento) | modo extrativo: aviso "IA indisponível; mostrando só o que se extrai por regra" |
| **Ações laterais** | Perguntar sobre este documento (fixa escopo), Apresentar, Exportar, Ler texto completo | | |

### 2.3 Selo de origem (componente novo `SeloOrigem`)

| Valor | Texto | Aparência | Significado |
|---|---|---|---|
| `literal` | Trecho literal | pílula neutra com aspas | Texto copiado da seção |
| `resumo` | Resumo da IA | pílula com ícone de brilho | Paráfrase ancorada em trecho verificado |
| `calculado` | Calculado | pílula com ícone de calculadora | Conta feita sobre valores do documento (ex.: 5% × 18.250 = 912,50) |

Regra de microcopy: nunca "a IA garante". Usar "com fonte" / "resumo da IA, confira o trecho".

### 2.4 Estados da tela inteira

| Estado | O que aparece |
|---|---|
| `gerando` | Relance e governança já visíveis (extrativo); demais blocos em esqueleto com progresso por etapa: "Lendo seções 12/43", "Procurando prazos e valores", "Escrevendo o resumo", "Conferindo as fontes" |
| `parcial` | Tudo menos BLUF/ações; aviso "Resumo da IA ainda a caminho"; atualiza sozinho (poll a cada 3 s, máx. 2 min) |
| `pronta` | Completo |
| `erro` | Relance extrativo + "Não consegui gerar o resumo agora" + [Tentar de novo] (`POST .../regenerar`) |
| `nao_encontrado` | "Não encontramos {codigo}" + ir ao Catálogo (padrão do T8) |

### 2.5 Mobile (375 px)

Ordem vertical: cabeçalho compacto → relance → 3 números (rolagem horizontal) → ações → mapa (faixa em 2 linhas) → governança (acordeão) → pontos-chave (abas roláveis) → alertas → cobertura. Botões de ação fixos no rodapé ("Perguntar", "Apresentar").

### 2.6 Acessibilidade

Cor nunca é o único sinal (semáforo tem ícone e texto); mapa de calor com alternativa em lista; foco visível; `aria-live="polite"` no progresso de geração; contraste AA; atalhos: `P` apresentar, `?` perguntar.

### 2.7 Microcopy (tom do guia de voz já existente)

- Título do bloco 2: **"O que isso exige de você"** (Empregado: "O que muda para você").
- Governança vazia: **"Não consta no documento"**.
- Descartados: **"Deixei de fora 1 item porque não achei o trecho que o sustente."**
- Substituída: **"Você está lendo a versão 1. A que vale hoje é a 2."**

---

## 3. T16 · Modo apresentação (pitch do documento) · P1

**Objetivo:** a pessoa apresenta o documento em 5 minutos, em reunião ou no comitê. Os cartões são **derivados da ficha**: não há nova chamada de IA.

| # | Cartão | Conteúdo | Tempo sugerido |
|---|---|---|---|
| 1 | Capa | Título, código, vigência, selos de governança, semáforo | 15 s |
| 2 | Em uma frase | BLUF grande + fonte | 30 s |
| 3 | O que decidir | até 3 ações com quem e prazo | 60 s |
| 4 | Números que importam | até 4 números com fonte | 45 s |
| 5 | Linha do tempo | prazos em ordem, com "hoje" marcado | 45 s |
| 6 | Riscos e alertas | multas, divergências, referências ausentes | 45 s |
| 7 | Quem faz o quê | responsáveis e obrigações | 45 s |
| 8 | De onde vem | fontes, cobertura, modo IA/extrativo | 15 s |

- Tela cheia, navegação por setas/clique/toque, indicador "3 de 8", cronômetro opcional de 5:00 que muda de cor nos últimos 60 s.
- Cada número e frase tem a fonte clicável (abre painel lateral sem sair da apresentação).
- Rodapé: [Exportar PDF] [Enviar para o Slack/Teams] [Sair].
- Dados: `GET /api/documentos/{codigo}/apresentacao` (C24) ou montar no cliente a partir da ficha (decisão do FE; o contrato existe para os canais).

---

## 4. T17 · Fila de atenção (triagem de 1.000 documentos) · P1

**Objetivo:** ninguém abre 1.000 fichas; abre as que importam hoje.

```
Fila de atenção · 1.000 documentos · 38 pedem ação esta semana
[Tema ▾] [Tipo ▾] [Situação: Todas ▾] [Perfil: Gestor ▾]   Ordenar: [Urgência ▾]   🔎 prazo ≤ 30 dias · com multa · com divergência
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ● CTR_2026-012 · Locação de espaço   Vistoria em 13 dias · 2 alertas   leitura 50 → 4 min  [Abrir ficha] │
│   "Locação de 8 estações por 150 dias, R$ 18.250,00 no total..."                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ▲ NG_111 · Férias (v2 substituída em uso por 3 documentos)  …                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Cartão compacto: semáforo, código, título, **uma linha do BLUF**, próximo prazo, nº de alertas, tempo economizado, ação "Abrir ficha".
- Ordenação padrão por **urgência** (prazo mais próximo, divergência, vigência acabando). Outras: vigência, tema, tipo.
- Filtros por sinal (RF70) como chips; paginação (50 por página) ou rolagem infinita.
- Estado vazio: "Nada pede sua atenção agora." Estado de carga: esqueleto de 6 cartões.
- Dados: `GET /api/ficha/triagem` (C25). Usa só o relance (cache), nunca gera ficha na hora.

---

## 5. Fontes em evidência (funcionalidade 2) · mudanças em T2 e nos blocos "Baseado em"

### 5.1 T2 · Pergunte ao acervo

```
┌ Escopo: [Todo o acervo ▾]  ou  Fixados: [CTR_2026-012 ✕] [+ fixar documento]               ┐
│ Pergunta: "Posso rescindir sem multa?"                                           [Perguntar] │
├──────────────────────────────────────────────────────┬──────────────────────────────────────┤
│ Respondido com 2 documentos · CTR_2026-012 v1.0.0 ·  │ FONTES CONSULTADAS (3)               │
│ NG_012 (ausente)                                     │ ┌ CTR_2026-012 · v1.0.0 · [Vigente] ┐│
│ ─ Resposta em camadas (curta → detalhe)              │ │ Contrato · Instrumento · DIRAF    ││
│ "Sim, a partir do 91º dia de vigência, com aviso de  │ │ ● Citado                           ││
│  30 dias." [Cláusula 13ª ▸]                          │ │  "Se a rescisão ocorrer até o 90º…"││
│ ⚠ Antes do 90º dia há multa de um aluguel (R$ 3.650) │ │  Cláusula Décima Terceira  [Abrir] ││
│ Avaliar [👍][👎]  Incluir no relatório               │ └────────────────────────────────────┘│
│                                                      │ ┌ NT_2026-018 · v1.0.0 · [Vigente] ┐ │
│                                                      │ │ ○ Consultado, não usado            │ │
│                                                      │ └────────────────────────────────────┘│
│                                                      │ [Perguntar só nestes documentos]      │
└──────────────────────────────────────────────────────┴──────────────────────────────────────┘
```

| Elemento | Comportamento |
|---|---|
| **Cabeçalho "Respondido com n documentos"** | Sempre visível acima da resposta; cada chip `código · versão · selo`; abre o painel |
| **Painel de Fontes** | Um cartão por documento: código, título, versão, `BadgeStatus`, camada, aprovador, vigência; trechos usados (seção + trecho); botão **Abrir** (T8 com `?secao=`) e **Ficha** (T14) |
| **Citado × consultado** | Citado: marcador cheio e trechos; consultado e não usado: marcador vazio e recolhido por padrão (expansível) |
| **Fonte substituída** | Cartão âmbar + "Esta fonte foi substituída pela v{n}. [Abrir a vigente]"; a resposta já avisa (campo `avisos`), o painel reforça |
| **Escopo** | Seletor "Todo o acervo / Documentos fixados"; chips removíveis; vindo da Ficha ou do T8, entra já com o documento fixado (`?doc=CTR_2026-012`) |
| **Sem fonte** | Resposta de abstenção ("Não consta nas fontes"): painel mostra "Procurei em n documentos e não achei" com a lista do que foi consultado (transparência) |
| **Mobile** | Painel vira gaveta inferior (botão "Fontes (3)"), cabeçalho "Respondido com n documentos" permanece fixo |

### 5.2 Blocos "Baseado em" (P1)

Em T3 (perspectiva), T4 (radar), T6 (E se?) e T11 (relatório): faixa no topo "Baseado em: NG_111 v3.0.0 · PX_1111-001 v1.0.0 …" com os mesmos chips. Reaproveitar o componente `FontesBase` criado para o T2.

### 5.3 Cartões Slack e Teams (C0, P1)

Linha final "Fontes consultadas: NG_111 v3.0.0 (vigente) · PX_1111-001 v1.0.0" + botão "Abrir ficha". O backend monta no cartão comum (`canais/cartao.py`); o frontend só precisa do mesmo destino de link (`/documento/:codigo/ficha`).

---

## 6. Alterações nas telas existentes

| Tela | Mudança | RF |
|---|---|---|
| T0 Topo | Nenhuma obrigatória. Opcional: atalho "Fila de atenção" (P1) | RF69 |
| T1 Visão geral | Cartão "Precisa de atenção" com os 3 documentos mais urgentes e link para T17; metadados do acervo mostram "n fichas prontas" | RF69 |
| T2 Pergunte | Escopo, cabeçalho "Respondido com", Painel de Fontes (seção 5) | RF63–RF68 |
| T7 Catálogo | Linha de cada documento ganha o semáforo e a ação "Ficha"; clicar no código abre T14 | RF44 |
| T8 Documento | Vira "Texto completo": botão "Voltar à ficha" no topo; mantém destaque de seção; botão "Perguntar só neste documento" | RF44, RF63 |
| T12/T13 Lote e revisão | Ao publicar, mostrar "Ficha em geração (n de m)" por arquivo e link para a ficha pronta | RF57 |
| Citação (`CitacaoCard`) | O chip do código passa a ter menu: "Abrir seção" e "Ver ficha" | RF44 |

---

## 7. Componentes novos (inventário para o FE)

`FichaView`, `RelanceCard`, `SelosGovernanca`, `MapaCalor` (+ `MapaCalorLista` acessível), `AcoesExigidas`, `PontosChave`, `SeloOrigem`, `CoberturaBarra`, `ApresentacaoView`, `FilaAtencao` (+ `CartaoTriagem`), `PainelFontes`, `FontesBase`, `EscopoChips`, `SemaforoSituacao`.
Mocks: `src/mocks/ficha.ts` (usar `mock-ficha-CTR_2026-012.json` como base; criar mais 2: `NG_111`, `PX_1111-001`), tipos em `src/api/types.ts` (espelhar o contrato C22–C25).

## 8. Ordem sugerida de entrega do frontend

1. **Fatia 1 (P0, base):** rota + `FichaView` com Relance, Governança, Cobertura e estados, lendo o mock; link no Catálogo e nas citações.
2. **Fatia 2 (P0):** Mapa de calor, "O que isso exige de você", Pontos-chave, Selo de origem.
3. **Fatia 3 (P0):** Painel de Fontes e escopo no T2.
4. **Fatia 4 (P1):** Modo apresentação.
5. **Fatia 5 (P1):** Fila de atenção, perfil, linguagem simples, exportar.

Trocar o mock pela API real quando o backend entregar `GET /api/documentos/{codigo}/ficha` (issue F-07 do PRD).

## 9. Checklist de aceite das telas (resumo)

- [ ] Relance legível sem rolar a 1280×720 e a 375×812.
- [ ] Todo número e frase tem fonte clicável que abre o T8 na seção.
- [ ] Governança vazia mostra "Não consta no documento".
- [ ] Modo extrativo declara o aviso e continua utilizável.
- [ ] Mapa de calor tem alternativa em lista e funciona por teclado.
- [ ] Painel de Fontes distingue citado de consultado e destaca fonte substituída.
- [ ] "Perguntar sobre este documento" fixa o escopo no T2.
- [ ] Nenhuma cor é o único indicador de estado.
