# Ficha do Documento + Fontes em evidência

Pacote de escopo (PROPOSTA de 12/11/2026) das duas funcionalidades que os mentores do desafio mais cobraram:

1. **Ficha do Documento:** transformar um documento de até 100 páginas em algo que se entende em 5 minutos, para até 1.000 documentos, com fonte verificada em cada afirmação.
2. **Fontes em evidência:** mostrar, em toda resposta, quais documentos foram consultados e usados.

| Arquivo | Para quem | O que tem |
|---|---|---|
| `REQUISITOS-FICHA-DO-DOCUMENTO-v1.md` | Todos | Insight do mentor, diferenciais, RF44–RF76, RNF19–RNF26, critérios de aceite, riscos, corte |
| `FLUXO-DE-TELAS-FICHA-v1.md` | Frontend | **Mesa de decisão na T1 (seção 0)**, T14 (Ficha completa), T16 (Pop-up de resumo da seção), T17 (Fila de atenção), Painel de Fontes, mudanças em T2/T7/T8, estados, mobile, microcopy, ordem de entrega |
| `CONTRATO-API-ADENDO-v0.4.md` | Frontend e backend | C22–C28: ficha, regenerar, perguntar com escopo e fontes consultadas, resumo explicado de seção (C28), triagem |
| `GUIA-IMPLEMENTACAO-FRONTEND-v1.md` | Frontend | **Leia primeiro para construir a tela inicial:** regras do design system (um só conjunto de tokens), componentes, mapa de calor v2, ordem de construção com aceite visual e instrução para o agente |
| `mapa-calor-CTR_2026-012.json` / `mapa-calor-NG_111.json` | Frontend | Dados **reais** do mapa de calor (43 e 112 seções), gerados pelo backend (`mapa_do_documento`); substituem o mapa de 5 células do exemplo |
| `POPUP-RESUMO-DA-SECAO-v1.md` | Frontend | **Pop-up de resumo explicado da seção, aberto pelo mapa de calor**: fundo desfocado, responsivo (gaveta no celular), conteúdo, estados, aceite e entrega. Substitui o antigo modo apresentação (removido) |
| `mock-resumo-secao-CTR_2026-012.json` | Frontend | Exemplo de resposta do pop-up para a "Cláusula Décima Terceira" (explicação, pontos, destaque, relacionadas, texto com trechos marcados) |
| `mock-ficha-CTR_2026-012.json` | Frontend | Exemplo completo de resposta, com trechos do `CTR_2026-012` do acervo |
| `PRD-FICHA-DO-DOCUMENTO.md` | Backend (no repositório do backend) | Arquitetura, pipeline, modelo, avaliação, backlog F-01…F-18 com dependências, corte e divisão entre desktops |

**Revisão 13/11:** a experiência principal passou a ser a **tela inicial** (lista de documentos que pedem atenção + Mesa de decisão), com **blocos por família de documento**. Leia a seção 0 do fluxo de telas e do requisito.

**Estado:** proposta. Nada foi implementado. A equipe aprova o escopo e o corte (seção 2.1 dos requisitos e seção 10 do PRD); depois o frontend monta as telas com o mock e o backend abre as issues do PRD.
