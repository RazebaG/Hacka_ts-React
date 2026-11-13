"""Gera src/mocks/secoes-reais.json a partir do acervo real do backend (Hack_ts---Python).

Uso (a partir da raiz do frontend):
    <backend>/.venv/bin/python -I scripts/gerar-secoes-reais.py <caminho-do-backend> CODIGO@VERSAO [...]

Usa o próprio parser do backend (app/parser.py), então o texto de cada seção é o mesmo que a API devolve.
Ids repetidos (ex.: itens "1." a "5." dentro de um anexo) recebem o anexo/apêndice em que estão como
prefixo ("Anexo A · 1"): o mapa de calor e o pop-up precisam de um id único por seção.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ANEXO = re.compile(r"^(Anexo|Apêndice)\s+\S+$")


def ids_unicos(secoes):
    repetidos = {k for k, n in Counter(s.id for s in secoes).items() if n > 1}
    vistos = set()
    anexo = None
    saida = []
    for s in secoes:
        if ANEXO.match(s.id):
            anexo = s.id
        novo = f"{anexo} · {s.id}" if s.id in repetidos and anexo else s.id
        base, n = novo, 2
        while novo in vistos:
            novo = f"{base} ({n})"
            n += 1
        vistos.add(novo)
        saida.append({"id": novo, "titulo": s.titulo, "texto": s.texto})
    return saida


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    backend = Path(sys.argv[1]).resolve()
    sys.path.insert(0, str(backend))
    from app.parser import parse_document_file  # noqa: E402

    pedidos = [a.split("@") for a in sys.argv[2:]]
    arquivos = {}
    for p in sorted((backend / "data" / "acervo").rglob("*__v*.md")):
        d = parse_document_file(p)
        arquivos[(d.codigo, d.versao)] = d

    saida = {}
    for codigo, versao in pedidos:
        d = arquivos.get((codigo, versao))
        if d is None:
            sys.exit(f"{codigo} v{versao} não está no acervo")
        saida[codigo] = {"versao": versao, "secoes": ids_unicos(d.secoes)}

    destino = Path(__file__).resolve().parent.parent / "src" / "mocks" / "secoes-reais.json"
    destino.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    for codigo, v in saida.items():
        print(f"{codigo} v{v['versao']}: {len(v['secoes'])} seções")


if __name__ == "__main__":
    main()
