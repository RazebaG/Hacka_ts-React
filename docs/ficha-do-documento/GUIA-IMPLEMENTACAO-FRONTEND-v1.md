# Guia de implementação da tela inicial (Mesa de decisão e mapa de calor) · frontend · v1 · 13/11/2026

> **Para:** quem for implementar (pessoas ou agentes). **Complementa** `FLUXO-DE-TELAS-FICHA-v1.md` (o que a tela é) com **como construir sem sair do design system**, na ordem certa e com critério de aceite visual por passo.
> **Origem:** revisão da PR #24 (`feat/ficha-do-documento`, 40 arquivos, +6.694 linhas), rodando a tela de verdade em 13/11 às 02h.

---

## 1. Diagnóstico: o que a PR #24 tem de certo e de errado

**Certo (manter):** a estrutura da tela inicial está como planejado: título, 4 atalhos, "Documentos que pedem sua atenção" com chips, Mesa compacta (faixa "Precisa de você", frase-resumo, blocos com selo de relevância, detalhe), resto da T1 abaixo. A Ficha (`/documento/:codigo/ficha`) funciona e usa o visual do app. A tela de Apresentação (`/documento/:codigo/apresentar`) existe, mas **não é o que foi decidido** (linha 7 abaixo).

**Errado (corrigir antes de qualquer coisa nova):**

| # | Problema encontrado | Efeito | Correção (seção) |
|---|---|---|---|
| 1 | **Três sistemas de token convivendo:** `--color-*` e `--space-*` (`src/index.css`, ~1.300 usos), `--fg-*` (`figma.css`, 148 usos) e **`--mk-*` (93 usos)**, copiado do protótipo que mostrei no chat | O protótipo foi desenhado com a paleta do Claude (`#fcfcfb`, `#cde2fb`, `#caeac7`), **não** com a do projeto (azul `#1d5fe0`, fundo `#f6f8fc`, Plus Jakarta Sans). Parte da Mesa fica com cara de outro produto | 2 |
| 2 | **Classes sem prefixo do sistema:** `MesaDocumento.tsx` usa 45 classes próprias (`mesa-*`, `inicio-*`) contra 5 `fg-*` | Não reaproveita `fg-card`, `fg-pilula`, `fg-rotulo`; qualquer ajuste do Figma não chega na Mesa | 2.3 |
| 3 | **`figma.css` com 4.492 linhas** (+1.611 só nesta PR) | Arquivo único impossível de revisar; conflito certo a cada merge | 2.4 |
| 4 | **Mapa de calor sem calor:** a faixa aparece como caixinhas cinza; só acende uma cor ao escolher um bloco. Na Ficha aparece "mostrando 11" de 43 seções | O que os mentores elogiaram (mapa de calor) não aparece na tela | 3 |
| 5 | **Dados do mapa vêm do meu exemplo**, que tem só 5 células. **Falha minha:** o exemplo tinha 5 células para um documento de 43 seções | A tela mostra um mapa incompleto por culpa do dado, não do código | 3.4 |
| 6 | **Ficha completa = card dentro de card** com cabeçalho repetido (título do documento duas vezes) | Visual pesado e confuso | 5, passo 6 |
| 7 | A **tela de Apresentação** atual (tela cheia, cronômetro, notas, cartões por tempo) **não é o que foi decidido e deve ser removida**: o que existe no escopo é o pop-up de resumo da seção (aberto pelo mapa de calor) | Remover `ApresentacaoView`, `src/ficha/cartoes.ts`, `notasApresentador.ts`, a rota `/apresentar` e o botão "Apresentar"; implementar o passo 8 |
| 8 | `MesaDocumento.tsx` com **476 linhas** e duas variantes no mesmo componente (`compacta` e `completa`) | Cada ajuste mexe na outra variante | 4 |

## 2. Design system: as regras (valem para qualquer agente)

### 2.1 Uma única fonte de verdade

1. **Só existem estes tokens:** os de `src/index.css` (`--color-*`, `--space-*`, `--shadow-*`) e os de `figma.css` (`--fg-*`). **Proibido** criar ou usar `--mk-*` ou qualquer token novo copiado de um protótipo.
2. **Proibido** cor em hexadecimal, `rgb()` ou `hsl()` fora dos arquivos de token. Verificação obrigatória no fim de cada passo:
   `grep -nE '#[0-9a-fA-F]{3,8}\b|rgb\(' src/ui/mesa.css src/components/Mesa*.tsx src/components/*Mapa*.tsx` → **sem resultado**.
3. O protótipo mostrado no chat serve **para a estrutura e o comportamento**, nunca para cor, raio ou fonte.

### 2.2 Tradução do protótipo para os tokens reais

| No protótipo (`--mk-*`) | Usar no projeto |
|---|---|
| `--mk-surface-2` (fundo de card) | `var(--color-surface)` |
| `--mk-surface-1` (fundo de área) | `var(--color-bg)` |
| `--mk-border` / `--mk-border-strong` | `var(--color-border)` / `var(--color-border-strong)` |
| `--mk-border-accent` (seleção) | `var(--color-primary-border)` |
| `--mk-text` | `var(--color-text)` |
| `--mk-text-2` (texto de apoio) | `var(--fg-cinza)` |
| `--mk-text-accent` / `--mk-bg-accent` | `var(--color-primary)` / `var(--fg-azul-suave)` |
| `--mk-bg-success` / `--mk-text-success` | `var(--color-success-bg)` / `var(--color-success-text)` |
| `--mk-bg-warning` / `--mk-text-warning` | `var(--color-warning-bg)` / `var(--color-warning-text)` |
| `--mk-bg-danger` / `--mk-text-danger` | `var(--color-danger-bg)` / `var(--color-danger-text)` |
| `--mk-radius` (8px), cartões de 12px | `var(--fg-card-radius)` (14px) para cartões; `8px` só em chips |
| `--mk-font`, `--mk-serif` | `var(--font-sans)`; o trecho citado usa `var(--font-sans)` em itálico (sem serifa) |

Se faltar um token que o desenho exige, **peça no PR**; não invente.

### 2.3 Componentes e classes que já existem (reuso obrigatório)

`fg-card` (cartão), `fg-pilula` e `neutra` (selo), `fg-rotulo`, `fg-sub`, `fg-valor`, `fg-faixa-alerta` e `fg-faixa-info` (faixas), `fg-grid-2`/`fg-grid-4`, `fg-atalhos`, `fg-lista` e `fg-lista-item`, `btn btn-primary|btn-outline btn-sm`, `CabecalhoTela`, `FonteLink`, `BadgeStatus`, `Icon`. A Mesa **monta** a tela com essas peças; só o que não existe vira classe nova.

### 2.4 Onde ficam os estilos novos

- Estilos novos em **`src/ui/mesa.css`** (importado uma vez), com classes `fg-mesa-*`, `fg-bloco-*` e `fg-mapa-*`. **Não** acrescentar mais nada em `figma.css`.
- Mover o que já foi acrescentado em `figma.css` por esta PR para `mesa.css` (os blocos `mesa-*`, `inicio-*`, `ficha-*`).
- Estados de interação (hover, foco, selecionado) com os tokens de foco já usados nos botões (`--color-focus-ring`); nunca remover o foco visível.

## 3. O mapa de calor (o que os mentores gostaram) · especificação v2

### 3.1 O que a pessoa vê

Uma faixa horizontal com **uma célula por seção** do documento, **colorida por padrão** (calor visível de cara), logo acima dos blocos.

| Elemento | Regra |
|---|---|
| **Cor da célula** | Sinal dominante da seção: prazo = `--color-warning-*`, valor = `--color-success-*`, obrigação = `--color-primary`, risco = `--color-danger-*`. Seção sem sinal = `--color-border` (neutra) |
| **Intensidade** | `intensidade` (0 a 1) do dado → opacidade de 0,25 a 1; abaixo de 0,15 vira neutra |
| **Largura** | Proporcional ao `peso`, com mínimo de 4 px (documentos com mais de 60 seções ficam com rolagem horizontal suave ou 2 linhas) |
| **Filtro** | Chips acima: `Tudo`, `Prazos`, `Valores`, `Obrigações`, `Riscos`. Em `Tudo` mostra o sinal dominante; nos demais, só aquele sinal (outras células neutras) |
| **Passar o mouse / foco** | Dica com título da seção, página estimada e as contagens (`Prazos 3 · Valores 1 · Riscos 2`) |
| **Clique** | Abre o texto completo (T8) na seção, em nova aba na Mesa e na mesma aba na Ficha |
| **Escolher um bloco** | Bloco com borda `--color-primary-border`; as seções dele ganham contorno forte e as demais ficam com 40% de opacidade; o título da faixa mostra "n seções deste bloco" |
| **Legenda** | Quatro quadradinhos com o nome do sinal, mais "cor mais forte = mais sinais" |
| **Honestidade** | Subtítulo fixo "Sinais por palavra-chave: onde há prazo, valor, obrigação e risco" e dica "Mostra onde olhar, não o que é mais importante. A importância está na ordem dos blocos" |
| **Acessibilidade** | Cada célula é um botão com `aria-label` ("Cláusula Sétima, página 7, valor 3, prazo 1"); alternativa em lista ("Ver o mapa em lista") com as 10 seções de maior intensidade; a cor nunca é o único sinal (a lista traz o nome do sinal) |

### 3.2 Como funciona nos dados (já existe no backend)

O campo `mapa_calor` do contrato C22 vem de `app/ficha/sinais.py` (função `mapa_do_documento`), **já na main**: determinístico, por regra, sem IA. Em medida do backend, o prazo marca ~15% das seções e o recall de obrigação e risco é ~71% no gabarito disponível. Por isso a legenda diz "palavra-chave".

### 3.3 Mapa na Mesa compacta e na Ficha completa

| | Mesa (T1) | Ficha (T14) |
|---|---|---|
| Altura da faixa | 28 px | 40 px |
| Todas as seções | **Sim** (se passar de 80, agrupar de 2 em 2 mantendo o sinal mais forte) | Sim |
| Filtro por sinal | Sim | Sim |
| Lista alternativa | Link "Ver em lista" | Aberta por padrão em telas pequenas |

### 3.4 Dados reais para trabalhar (substituem o mapa de 5 células do exemplo)

Dois arquivos gerados **pelo código do backend que já está na main**, com as células de **todas** as seções:

- `mapa-calor-CTR_2026-012.json`: 43 seções, 26 com algum sinal, soma dos pesos = 1.
- `mapa-calor-NG_111.json`: **112 seções** (serve para testar o mapa com um documento maior e a rolagem).

Cada arquivo tem `{ codigo, versao, secoes, mapa_calor: [CelulaMapa] }`. Copiar para `src/mocks/` e fazer `src/mocks/ficha.ts` usá-los no lugar do `mapa_calor` de 5 células. Quando o endpoint `GET /api/documentos/{codigo}/ficha` entrar (issue #48 do backend), a Mesa passa a ler o mesmo campo da API sem mudar o componente.

## 4. Estrutura de componentes (cada arquivo com até ~150 linhas)

```
VisaoGeralView                      (existe; só compõe)
 ├─ CabecalhoTela                   (existe)
 ├─ nav.fg-atalhos                  (existe)
 ├─ ListaAtencao                    NOVO  chips + estado vazio + carregamento
 ├─ MesaDocumento                   NOVO  só orquestra; recebe `variante`
 │    ├─ MesaCabecalho              tipo · vigência · governança · "leitura 12 min → ficha 3 min"
 │    ├─ FaixaPrecisaDeVoce         ação · quem · até quando · consequência
 │    ├─ FraseResumo                frase + FonteLink + SeloOrigem
 │    ├─ MapaCalor                  seção 3 (+ MapaCalorLista)
 │    ├─ GradeBlocos                lista de BlocoDecisao (mesmo componente para qualquer família)
 │    │    └─ BlocoDecisao          titulo · destaque · apoio · selo de relevância · sinal
 │    ├─ DetalheBloco               trecho exato · cláusula · SeloOrigem · "Abrir no texto completo"
 │    └─ PerguntaEscopada
 ├─ PopupResumoSecao                NOVO  abre ao clicar numa célula do MapaCalor (POPUP-RESUMO-DA-SECAO-v1.md)
 └─ (resto da T1 existente, abaixo)
```

Regras: **estado da seleção** (`blocoAtivoId`, `secaoFocoId`, `sinalFiltro`) fica no `MesaDocumento` e desce por props; nenhum componente filho lê o mock direto; `BlocoDecisao` não conhece a família (ela só muda o dado). A Ficha completa **reusa** `MesaDocumento` com `variante="completa"` **sem envolver em outro `fg-card`** e sem repetir o cabeçalho que a página já tem.

## 5. Ordem de construção, com critério de aceite visual

Cada passo termina com: `npm run build` sem erro, `npm test` verde, o `grep` de cor da seção 2.1 sem resultado e **uma captura de tela em 1280×720 e outra em 375×812** anexada à PR.

| Passo | O que fazer | Aceite visual (o que precisa estar na captura) |
|---|---|---|
| 0 | **Limpeza:** mover os estilos novos para `mesa.css`; trocar todo `--mk-*` pelos tokens da seção 2.2; trocar classes `mesa-*`/`inicio-*` por `fg-mesa-*` e peças existentes | A tela inicial **não muda de estrutura** e passa a ter a **mesma** paleta, fonte e raio das demais telas (comparar lado a lado com "Documentos" e "Radar"); `grep -c 'mk-' src` = 0 |
| 1 | `ListaAtencao` + `MesaDocumento` compacta **sem mapa**: cabeçalho, faixa, frase, blocos, detalhe | Os chips aparecem abaixo dos 4 atalhos; escolher outro chip troca o conteúdo sem recarregar; os 6 blocos do `CTR_2026-012` com selo de relevância; nenhuma barra de rolagem horizontal a 1280 px |
| 2 | **`MapaCalor` v2** (seção 3) com os dados reais do `CTR_2026-012` | Faixa **colorida ao abrir a tela**; filtro por sinal funciona; passar o mouse mostra a dica; escolher "Quanto custa" contorna as seções dele; legenda e subtítulo presentes |
| 3 | Mesmo mapa com o `NG_111` (112 seções) e a variante de lista | Sem estouro de largura; rolagem ou agrupamento; a lista alternativa lista 10 seções com o nome do sinal |
| 4 | Família `norma`: chip do `NG_111` troca os blocos ("O que muda para você", "Prazos que valem", "Quem faz o quê", "Limites e valores", "Documentos ligados") | O mesmo `BlocoDecisao` renderiza os dois documentos, sem código específico por documento |
| 5 | Pergunta escopada (campo com o documento fixado) | O campo mostra o documento fixado; "Perguntar sobre este documento" abre o T2 já com o escopo |
| 6 | **Ficha completa** sem card dentro de card | Título do documento aparece **uma vez**; governança completa, cobertura e alertas; mapa com **todas** as seções (sem "mostrando n") |
| 7 | Painel de Fontes no T2 | Conforme `FLUXO-DE-TELAS-FICHA-v1.md`, seção 5 |
| 8 | **Pop-up de resumo explicado da seção**, aberto pelo mapa de calor (substitui a tela de Apresentação): fundo desfocado, gaveta no celular, conteúdo da seção, navegação anterior e próxima | `POPUP-RESUMO-DA-SECAO-v1.md`, seção 8: capturas em **375×812, 768×1024 e 1280×720**; clique numa célula do mapa abre o pop-up; `Esc`, `×` e clique no fundo fecham e devolvem o foco à célula; sem `--mk-*` nem cor hexadecimal |

**Quando uma captura não bate com o aceite, o passo não está pronto**, mesmo que os testes passem.

## 6. Verificação automática mínima (para o agente se autocorrigir)

Criar `src/test/design-system.test.ts` que falha se, nos arquivos da Mesa, do Mapa e da Ficha:
1. houver `--mk-` ou cor hexadecimal;
2. `var(--x)` usar um token que não esteja definido em `index.css` ou `figma.css`;
3. houver comparação com código de documento (`=== 'CTR_2026-012'` etc.) fora de `src/mocks`.

## 7. Instrução curta para colar no agente que implementa

> Leia `docs/ficha-do-documento/GUIA-IMPLEMENTACAO-FRONTEND-v1.md` inteiro antes de escrever código. Regras: use só os tokens de `index.css` e `figma.css` (nada de `--mk-*` nem hexadecimal); reuse `fg-card`, `fg-pilula`, `fg-faixa-alerta` e `btn`; estilos novos só em `src/ui/mesa.css`; componentes de até ~150 linhas; o mapa de calor usa os dados de `src/mocks/mapa-calor-*.json` e abre o pop-up de resumo da seção (`POPUP-RESUMO-DA-SECAO-v1.md`); **não construa modo apresentação**. Faça **um passo por vez** (seção 5), rode `npm run build`, `npm test` e o `grep` de cor, e anexe as capturas 1280×720 e 375×812. Se a captura não bate com o critério do passo, corrija antes de seguir.

## 8. O que o backend entrega e quando

| Item | Estado |
|---|---|
| `mapa_calor` por seção (F-02) | **Na main** (função `mapa_do_documento`); falta expor no endpoint |
| Blocos por família e relevância (F-17, PR #52) | Aprovada no QA; aguarda merge |
| Endpoint `GET /api/documentos/{codigo}/ficha` (F-07, issue #48) | Próximo; depende da F-17. Enquanto isso, a tela usa os mocks |
| Fontes em evidência em `/api/perguntar` (F-09, issue #43) | Com o desktop B |
