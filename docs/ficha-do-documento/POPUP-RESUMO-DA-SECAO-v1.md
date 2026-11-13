# Pop-up de resumo explicado da seção, aberto pelo mapa de calor (PROPOSTA v3 · 13/11/2026)

> **Substitui** o antigo "Modo apresentação" (`MODO-APRESENTACAO-v1.md`) e a versão intermediária "pop-up do documento inteiro". **Para:** frontend. **Base:** `FLUXO-DE-TELAS-FICHA-v1.md` (Mesa, seção 0) e `GUIA-IMPLEMENTACAO-FRONTEND-v1.md` (design system e mapa de calor).
> **Prioridade:** P0 para a abertura pelo mapa e para a versão sem IA; P1 para a explicação por IA (depende do endpoint C28 do backend).

---

## 0. O que é, e o que NÃO é

**É:** quando a pessoa **seleciona uma seção no mapa de calor**, abre um **pop-up com o resumo explicado daquela seção**: o que ela diz em palavras simples, os pontos principais dela, por que está em destaque no mapa, a que outras partes ela se liga e o texto original com os termos marcados.

**Não é:** uma apresentação (pitch), um resumo do documento inteiro, um slide em tela cheia, nem uma tela com cronômetro, notas de apresentador ou cartões por tempo. A palavra "pitch" apareceu só como **exemplo de modelo de resposta** (um texto que traz os pontos principais de uma base de informação); não é uma funcionalidade. **Foi removido de vez:** modo apresentação, cronômetro, roteiro falado, rota própria `/apresentar`, endpoint `/apresentacao` e o botão "Apresentar em 5 min".

O mapa de calor passa a ser a **porta de entrada**: cor e intensidade dizem *onde olhar*; o pop-up diz *o que aquela seção significa*.

## 1. Como abre e fecha

| Ação | Resultado |
|---|---|
| Clicar (ou `Enter`/`Espaço` com foco) numa **célula do mapa**, na Mesa (T1) ou na Ficha (T14) | Abre o pop-up daquela seção. A célula fica contornada no mapa |
| Clicar numa célula **sem sinal** | Abre igual; "Por que está em destaque" diz "Sem prazo, valor, obrigação ou risco: texto de apoio" |
| Clicar num bloco da Mesa (ex.: "Quanto custa") | **Não** abre o pop-up; só acende as seções do bloco no mapa (comportamento atual). O pop-up é por seção |
| Chip "Ligada a" dentro do pop-up | Troca o pop-up para a seção ligada (mantém o histórico para o botão "voltar") |
| `×`, tecla `Esc` ou clique no **fundo desfocado** | Fecha; o foco volta para a célula que abriu; a Mesa continua no mesmo bloco |
| URL | Ganha `?secao=<id>` (compartilhável); abrir a URL já abre o pop-up |

## 2. Visual

### 2.1 Fundo desfocado (obrigatório)

- Atrás do pop-up, a tela atual continua visível, **desfocada** e escurecida: `backdrop-filter: blur(6px a 8px)` + véu `--color-text` a 38% de opacidade.
- **Alternativa para navegador sem suporte** a `backdrop-filter`: só o véu escuro a 55%.
- O fundo fica **inerte** (`inert`/`aria-hidden`) e a rolagem da página é travada enquanto o pop-up está aberto.
- `prefers-reduced-motion`: sem animação de entrada; o desfoque aparece direto.

### 2.2 Casca

| Item | Desktop (≥ 768 px) | Celular (< 560 px) |
|---|---|---|
| Forma | Pop-up centralizado, largura até 660 px (máx. 100% menos 28 px), altura até 540 px ou 90% da janela, o que for menor, raio 18 px, sombra `--shadow-lg` | **Gaveta que sobe de baixo**, 92% da altura, cantos arredondados só em cima, largura total |
| Cabeçalho fixo | Código · "seção n de 43" · página estimada, **nome da seção** e o tema, botão `×` de 32 px | Igual, o nome pode quebrar linha |
| Corpo | Uma coluna com rolagem própria; a rolagem **não vaza** para a página (`overscroll-behavior: contain`) | Igual |
| Rodapé fixo | `← Anterior` `Próxima →` à esquerda; `Perguntar sobre esta seção` e **`Abrir no texto completo`** (botão principal azul) à direita | Botões **empilhados** em largura total, altura mínima de 36 px |
| Intermediário (560 a 768 px) | Largura da janela com margem de 14 px; rodapé quebra em duas linhas se faltar espaço | |

### 2.3 Responsividade (regras de implementação)

- **Mapa de calor atrás:** nunca rola na horizontal; abaixo de 560 px as células quebram em linhas (~22 por linha).
- Selos dos pontos ficam **ao lado** do texto no desktop e **em cima** do texto no celular.
- Alvos de toque de pelo menos 32 px (fechar) e 36 px (botões).
- Teclado virtual aberto (campo de pergunta): o rodapé não cobre o campo (`env(keyboard-inset-height)` quando existir; rolagem do corpo no resto).
- Orientação horizontal no celular: o pop-up usa 92% da altura com o corpo rolável.
- **Aceite exige capturas em 375×812, 768×1024 e 1280×720** (seção 8).

### 2.4 Tokens

Só os tokens do projeto (`--color-*`, `--fg-*`, `--space-*`, `--shadow-lg`); o protótipo mostrado à equipe usa cores aproximadas e **não é fonte de estilo**. Selos: `warning` para prazo, `success` para valor, `danger` para risco, `--fg-azul-suave` para o resto. Título em `--font-titulo`; corpo em `--font-sans`; o **texto original** em fonte com serifa **somente se** o projeto já tiver um token para ela (senão `--font-sans`). Reusar `fg-card`, `fg-pilula`, `FonteLink`, `btn`. Estilos em `src/ui/mesa.css` (`fg-secao-popup-*`).

## 3. Conteúdo, em ordem

| # | Seção do pop-up | O que mostra | Origem do dado |
|---|---|---|---|
| 1 | **Em palavras simples** (P1, IA) | 2 a 4 frases que explicam a seção como a um colega: o que ela diz e o que significa na prática, com os números e prazos em negrito. Selo "Resumo da IA · confira o trecho" e a cláusula | `explicacao` (C28) |
| 2 | **O que ela diz, em pontos** | Até 5 itens com **selo grande** (`30 dias`, `1 aluguel`, `Sem multa`) e uma linha; a cor segue o sinal | `pontos[]` (C28): extração por regra (F-03), com fonte verificada |
| 3 | **Por que está em destaque no mapa** | Selo com as contagens (`Prazo 3 · Risco 4`) e uma frase do motivo; aviso fixo "Sinais por palavra-chave: mostram onde olhar, não o que é mais importante" | `destaque` (C28) = a célula do `mapa_calor` (F-02) |
| 4 | **Ligada a** | Até 4 chips com seções (e documentos) relacionados; clicar troca o pop-up | `relacionadas[]` (C28) |
| 5 | **Texto original** | O trecho da seção, **com os termos de prazo, valor e risco marcados** (cores dos sinais) | `texto_original` (C28) |

**Sem IA (modo extrativo) ou enquanto a explicação não chega:** a seção 1 é substituída por **"Principais trechos"** (as 2 ou 3 frases mais relevantes da seção, literais, por regra) com o selo "Sem IA: trechos do próprio documento". O pop-up continua completo nas demais seções.

**Regras de honestidade:** todo ponto tem fonte à vista; o selo de origem aparece (`Trecho literal`, `Resumo da IA`, `Calculado`); a explicação por IA só é exibida se **todas** as suas afirmações passaram na verificação de fonte (senão, cai no modo sem IA e o pop-up avisa).

## 4. Navegação dentro do pop-up

- `← Anterior` e `Próxima →` vão para a **seção anterior/seguinte com sinal** (as neutras são puladas); os botões ficam esmaecidos nos extremos.
- `Esc` fecha; `←` e `→` (setas) navegam quando o foco está no pop-up.
- Chips de "Ligada a" empilham a navegação; `×` fecha tudo.
- `Perguntar sobre esta seção` fixa o escopo da pergunta (T2) naquela seção e fecha o pop-up.
- `Abrir no texto completo` abre o T8 (documento) rolado até a seção, com o destaque já existente.

## 5. Estados

| Estado | Comportamento |
|---|---|
| Carregando (P1, IA) | O cabeçalho, "Por que está em destaque", "Texto original" e "Principais trechos" aparecem na hora (vêm do mapa e da extração); só a seção "Em palavras simples" mostra esqueleto com "Escrevendo a explicação…" |
| IA indisponível ou verificação falhou | "Principais trechos" no lugar da explicação, com o aviso "Sem IA: trechos do próprio documento" |
| Erro ao carregar | "Não consegui abrir esta seção agora" + `Tentar de novo`; o botão `Abrir no texto completo` continua funcionando |
| Seção muito longa (> 400 palavras) | O texto original fica **recolhido** com "Ver texto completo da seção" |

## 6. Acessibilidade

`role="dialog"`, `aria-modal="true"`, `aria-labelledby` no nome da seção; **foco contido** no pop-up e devolvido à célula que abriu; `Esc` fecha; leitor de tela anuncia "Seção n de 43: nome"; contraste AA; a cor dos selos nunca é o único sinal (o selo traz o texto do sinal); alvos de toque adequados; `prefers-reduced-motion` respeitado.

## 7. Dados e contrato

- **MVP (frontend, sem esperar o backend):** `montarResumoSecao(ficha, secaoId)` monta a versão **sem IA** a partir do que já existe: a célula do `mapa_calor` da seção, os itens da ficha cujas `fontes[].secao` apontam para a seção (`pontos`/`blocos`), e o texto da seção (`DocumentoDetalhe.secoes`). Exemplo de resposta completa: `mock-resumo-secao-CTR_2026-012.json`.
- **Endpoint proposto (backend, C28, P1):** `GET /api/documentos/{codigo}/secoes/{secao_id}/resumo`, descrito em `CONTRATO-API-ADENDO-v0.4.md`. Devolve a explicação por IA já verificada, os pontos, o destaque, as relacionadas e o texto com trechos marcados. Enquanto não existir, o frontend usa a montagem local e o selo "Sem IA".
- O mapa de calor vem de `mapa_calor` (F-02, já na main) e os dados reais de teste estão em `mapa-calor-CTR_2026-012.json` e `mapa-calor-NG_111.json`.

## 8. Aceite

1. Clicar numa célula **colorida** do mapa abre o pop-up daquela seção; clicar numa **neutra** abre com "Sem sinais".
2. O pop-up mostra as seções 2 a 5 da tabela do item 3 com dados reais (sem IA); a seção 1 aparece como "Principais trechos" com o selo "Sem IA".
3. Todo ponto tem fonte clicável; os termos do texto original estão marcados com as cores dos sinais.
4. **Fundo desfocado** atrás (com o véu escuro como alternativa), página travada, `Esc`, `×` e clique no fundo fecham, e o foco volta à célula.
5. **Responsivo:** em 375×812 vira gaveta de 92% da altura com botões empilhados e sem rolagem horizontal; em 768×1024 e 1280×720 mantém o formato centralizado. **Capturas dos três tamanhos anexadas à PR.**
6. `← Anterior` e `Próxima →` pulam as seções neutras; `Ligada a` troca a seção.
7. URL com `?secao=` abre o pop-up direto.
8. Nenhuma cor hexadecimal nem `--mk-*` nos arquivos do pop-up; `npm run build` e `npm test` verdes.

## 9. Entrega sugerida (frontend)

| Passo | O que | Tempo |
|---|---|---|
| 1 | `montarResumoSecao(ficha, secaoId)` + testes com os mocks do contrato e da norma | 30 min |
| 2 | Pop-up com casca, cabeçalho e rodapé fixos, desfoque e fechamento (sem conteúdo rico) | 40 min |
| 3 | As seções 2 a 5 e os termos marcados no texto original | 60 min |
| 4 | Abertura pelo mapa (clique e teclado), `?secao=` e navegação anterior/próxima | 40 min |
| 5 | Responsividade (gaveta no celular), foco, acessibilidade e capturas | 40 min |
| 6 (P1) | Seção "Em palavras simples" ligada ao C28 quando o endpoint existir | 30 min |

Estimativa: **de 3 a 4 h** para os passos 1 a 5, sem depender do backend.

## 10. Fora do pop-up

Resumo do documento inteiro, apresentação por cartões, cronômetro e exportação em PDF foram **retirados do escopo**. A Mesa e a Ficha continuam sendo a visão do documento inteiro.
