# caio-de-andrade-dev

Landing page pessoal com visual moderno, animação Three.js e destaque para artigos do Medium.

## Estrutura
- `index.html`: layout do site com seções de hero, projetos, artigos e contato.
- `style.css`: gradientes, sombras e grid responsivo que seguem a paleta escura atual.
- `script.js`: orb animado, copiar e-mail e hydratização dos cards de Medium a partir de `data/medium.json`.
- `data/medium.json`: snapshot manual do feed RSS (`https://medium.com/feed/@caio.ale.andrade`).

## Atualizar artigos do Medium
1. Instale dependências do Python se necessário.
2. Rode o script abaixo na raiz do repo para reextrair o RSS e sobrescrever `data/medium.json`:

```bash
python3 ./scripts/fetch-medium.py
```

3. Verifique localmente antes de deployar para garantir as capas e trechos estão corretos.
