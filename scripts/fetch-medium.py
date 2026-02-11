"""Atualiza data/medium.json com os artigos mais recentes do Medium."""

import json
import re
import ssl
from pathlib import Path
from html import unescape
from typing import List, Dict
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "medium.json"
FEED_URL = "https://medium.com/feed/@caio.ale.andrade"
MAX_ITEMS = 6


def fetch_feed() -> str:
    ctx = ssl.create_default_context()
    req = Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, context=ctx) as response:
        return response.read().decode("utf-8")


def parse_feed(text: str) -> List[Dict[str, str]]:
    ns = {"content": "http://purl.org/rss/1.0/modules/content/"}
    root = ET.fromstring(text)
    items = []
    for item in root.findall("./channel/item")[:MAX_ITEMS]:
        title = item.findtext("title") or ""
        link = item.findtext("link") or ""
        pub_date = item.findtext("pubDate") or ""
        encoded = item.find(f"{{{ns['content']}}}encoded")
        html_body = (encoded.text or "") if encoded is not None else ""
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)', html_body)
        cover = img_match.group(1) if img_match else ""
        excerpt_match = re.search(r"<p>(.*?)</p>", html_body)
        excerpt = unescape(excerpt_match.group(1)) if excerpt_match else ""
        excerpt = re.sub(r"<[^>]+>", "", excerpt)
        items.append(
            {
                "title": title.strip(),
                "url": link.strip(),
                "coverImage": cover.strip(),
                "excerpt": excerpt.strip(),
                "publishedAt": pub_date.strip(),
            }
        )
    return items


def write_data(items: List[Dict[str, str]]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(items, handle, ensure_ascii=False, indent=2)


def main() -> None:
    print("Buscando feed Medium…")
    feed_text = fetch_feed()
    print("Parseando artigos…")
    articles = parse_feed(feed_text)
    print(f"Escrevendo {len(articles)} artigos em {DATA_FILE}…")
    write_data(articles)
    print("Pronto.")


if __name__ == "__main__":
    main()
