# Contrato da API v0.1 (backend Python ↔ frontend React)

Base: `http://localhost:8000` (frontend usa `VITE_API_URL`). JSON UTF-8. CORS liberado para `http://localhost:5173`.

## GET /api/saude
`{"status":"ok","documentos":13}`

## GET /api/documentos
Lista (vigentes e substituídos):
```json
[{"codigo":"NG_111","titulo":"Férias","tipo":"NG","tipo_nome":"Norma Geral","versao":"3.0.0","fase":"Vigente","vigencia":"…","vinculado_a":null,"referencia":null,"assunto":"ferias","substituido":false}]
```

## GET /api/documentos/{codigo}?versao=3.0.0
Sem `versao` → a vigente. Retorna o item acima + `"secoes":[{"id":"4.3.1","titulo":"…","texto":"…"}]`.
Erros: 404 `{"detail":"Documento ou versão não encontrada"}`.

## POST /api/perguntar
Entrada: `{"pergunta":"…","perfil":"empregado|gestor|ggc|gfi|gco|null"}`
Saída:
```json
{"resposta":"…","consta":true,
 "citacoes":[{"codigo":"PX_1111-001","versao":"1.0.0","secao":"Anexo D","trecho":"…"}],
 "avisos":["NG_111 v2.0.0 foi substituída pela v3.0.0"]}
```
`consta=false` → `citacoes=[]` e `resposta` explica que não consta nas fontes. CATALOGO não entra no índice de perguntas.

## GET /api/codigo/{codigo}
`{"codigo":"PX_1111-001","tipo":"PX","tipo_nome":"Procedimento","vinculado_a":"NG_111","serie":"1","serie_nome":"Gente e Cultura","vigencia_regra":"18 meses a partir da aprovação","existe_no_acervo":true,"observacao":"…"}`
Erros: 404 `{"detail":"Código não encontrado"}`.

Mudança de contrato = bloqueio comentado na issue e decisão do Lead.

## Inteligência (issue backend #4 + Adendo v0.1 A–F)

### GET /api/perspectivas
`[{"id":"juridico","nome":"Jurídico e Contratos"},{"id":"financeiro","nome":"Financeiro"},{"id":"pessoas","nome":"Pessoas (RH)"},{"id":"gestao","nome":"Gestão e Inovação"}]`

### GET /api/perspectivas/{id}
Retorna detalhes da perspectiva. Erro: 404 `{"detail":"Perspectiva não encontrada"}`.
```json
{
  "id": "pessoas",
  "nome": "Pessoas (RH)",
  "destaques": [
    {
      "titulo": "Antecedência mínima para marcação de férias",
      "valor": "45 dias",
      "fonte": {
        "codigo": "NG_111",
        "versao": "3.0.0",
        "secao": "4.3.1",
        "trecho": "A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias…"
      },
      "fonte_anterior": {
        "codigo": "NG_111",
        "versao": "2.0.0",
        "secao": "2.3",
        "trecho": "A antecedência mínima para solicitação de férias é de 30 (trinta) dias…"
      },
      "aviso": "v2 (substituída) dizia 30 dias"
    }
  ],
  "valores": [
    {
      "rotulo": "Multa por inexecução contratual",
      "numero": 912.5,
      "unidade": "BRL",
      "fonte": {
        "codigo": "CTR_2026-012",
        "versao": "1.0.0",
        "secao": "APÊNDICE B",
        "trecho": "Multa de 5% sobre o valor global do contrato (R$ 912,50)…"
      }
    }
  ],
  "prazos": [
    {
      "data": "2027-03-21",
      "evento": "Início do processo de agendamento (D-45)",
      "marco": "D-45",
      "cenario": "Exemplo do PX_1111-001: férias a partir de 05/05/2027",
      "fonte": {
        "codigo": "PX_1111-001",
        "versao": "1.0.0",
        "secao": "Anexo D",
        "trecho": "…"
      }
    }
  ],
  "responsaveis": [
    {
      "papel": "GOC",
      "responsabilidade": "Fiscal técnico; atesta em 5 dias úteis",
      "fonte": {
        "codigo": "CTR_2026-012",
        "versao": "1.0.0",
        "secao": "CLÁUSULA QUINTA",
        "trecho": "…"
      }
    }
  ],
  "riscos": [
    {
      "descricao": "Cancelamento de férias com menos de 20 dias acarreta taxa de cancelamento e remanejamento",
      "fonte": {
        "codigo": "PX_1111-001",
        "versao": "1.0.0",
        "secao": "5.2",
        "trecho": "…"
      }
    }
  ]
}
```

### GET /api/grafo
```json
{
  "nos": [
    {
      "id": "NG_111@3.0.0",
      "codigo": "NG_111",
      "tipo": "NG",
      "versao": "3.0.0",
      "substituido": false,
      "existe_no_acervo": true
    },
    {
      "id": "NG_012",
      "codigo": "NG_012",
      "tipo": "NG",
      "versao": "",
      "substituido": false,
      "existe_no_acervo": false
    }
  ],
  "arestas": [
    {
      "de": "PX_1111-001@1.0.0",
      "para": "NG_111@3.0.0",
      "tipo": "vinculado_a"
    }
  ]
}
```
Tipos de aresta: `vinculado_a`, `referencia`, `substitui`.

### GET /api/comparar?codigo=NG_111&de=2.0.0&para=3.0.0
```json
{
  "codigo": "NG_111",
  "de": "2.0.0",
  "para": "3.0.0",
  "mudancas": [
    {
      "secao": "4.3.1",
      "tipo": "alterado",
      "antes": "A antecedência mínima para solicitação de férias é de 30 (trinta) dias…",
      "depois": "A antecedência mínima para solicitação de férias é de 45 (quarenta e cinco) dias…"
    }
  ],
  "resumo": [
    "Antecedência mínima de agendamento de férias passou de 30 para 45 dias"
  ]
}
```
Tipos de mudança: `alterado`, `incluido`, `removido`. Sem os 2 arquivos no acervo → 404.

### GET /api/relatorio?perspectiva=juridico (ou ?codigo=CTR_2026-012)
```json
{
  "titulo": "Relatório Executivo — Jurídico e Contratos",
  "gerado_em": "2026-11-12T10:00:00Z",
  "secoes": [
    {
      "titulo": "Cláusulas Críticas e Obrigações",
      "itens": [
        {
          "texto": "O contrato prevê vistoria inicial no prazo de 5 dias úteis.",
          "fonte": {
            "codigo": "CTR_2026-012",
            "versao": "1.0.0",
            "secao": "CLÁUSULA QUINTA",
            "trecho": "…"
          }
        }
      ]
    }
  ]
}
```

Todo item extraído carrega `fonte` (`codigo`, `versao`, `secao`, `trecho`).
`secao` em `fonte` é **exatamente** o `secoes[].id` de `GET /api/documentos/{codigo}?versao=`.
Nunca valor ou item sem fonte.
