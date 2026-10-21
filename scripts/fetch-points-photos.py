"""Fetch distinct, attributed Commons photographs for the sourced food catalogue.

Wikipedia is used only to locate illustrations, never as the nutrition source.
Only Commons public-domain / Creative Commons files are accepted. The original
author, file page and licence are kept with every local thumbnail.
"""
from concurrent.futures import ThreadPoolExecutor
import html
import hashlib
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/points-foods"
OUT.mkdir(exist_ok=True)
TARGET = ROOT / "lib/points-photos.json"
AGENT = "DIETEAR-food-catalog/1.0 (https://dietear.app; attributed illustrations)"
CACHE = ROOT.parent / "points-research/photo-cache"
CACHE.mkdir(parents=True, exist_ok=True)


def get(url):
    cached = CACHE / hashlib.sha256(url.encode()).hexdigest()
    if cached.exists():
        return cached.read_bytes()
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": AGENT})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
                cached.write_bytes(data)
                return data
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def api(domain, **args):
    return json.loads(get(f"https://{domain}/w/api.php?" + urllib.parse.urlencode({"format": "json", "maxlag": 5, **args})))


def text(value):
    return html.unescape(re.sub("<[^>]+>", "", value or "")).strip()


def acceptable(page):
    info = page.get("imageinfo", [{}])[0]
    meta = info.get("extmetadata", {})
    licence = text(meta.get("LicenseShortName", {}).get("value"))
    if "-NC" in licence or "-ND" in licence or not (licence.startswith("CC BY") or licence.startswith("CC0") or "public domain" in licence.lower()):
        return None
    url = info.get("thumburl") or info.get("url", "")
    if not re.search(r"\.(jpe?g|png|webp)(?:$|\?)", url, re.I):
        return None
    return dict(remote=url, original=info.get("url"), page=info.get("descriptionurl"),
                author=text(meta.get("Artist", {}).get("value")) or "Autor en la ficha de Wikimedia Commons",
                license=licence, licenseUrl=meta.get("LicenseUrl", {}).get("value") or "https://commons.wikimedia.org/wiki/Commons:Licensing",
                title=page["title"].removeprefix("File:"), description=text(meta.get("ImageDescription", {}).get("value")))


def main():
    foods = json.loads((ROOT / "lib/points-foods.json").read_text())["foods"]
    photos = json.loads(TARGET.read_text()) if TARGET.exists() else {}
    illustrations = json.loads((ROOT / "lib/points-illustrations.json").read_text())
    used = {entry["original"] for entry in photos.values()}
    wiki_files = {}
    for offset in range(0, len(foods), 35):
        batch = foods[offset:offset + 35]
        result = api("en.wikipedia.org", action="query", titles="|".join(f["photoTopic"] for f in batch), redirects=1,
                     prop="pageimages", piprop="name", pilicense="free")
        query = result.get("query", {})
        redirects = {x["from"]: x["to"] for group in ("normalized", "redirects") for x in query.get(group, [])}
        pages = {page.get("title"): page for page in query.get("pages", {}).values()}
        for food in batch:
            topic = food["photoTopic"]
            for _ in range(5):
                if topic not in redirects:
                    break
                topic = redirects[topic]
            image = pages.get(topic, {}).get("pageimage")
            if image:
                wiki_files[food["id"]] = "File:" + image
        print(f"Located illustration topics {offset + len(batch)}/{len(foods)}", flush=True)
    info_by_title = {}
    files = list(set(wiki_files.values()))
    for offset in range(0, len(files), 35):
        result = api("commons.wikimedia.org", action="query", titles="|".join(files[offset:offset + 35]),
                     prop="imageinfo", iiprop="url|extmetadata", iiurlwidth=400)
        for page in result.get("query", {}).get("pages", {}).values():
            image = acceptable(page)
            if image:
                info_by_title[page["title"].replace("_", " ")] = image
        print(f"Checked Commons licences {min(offset + 35, len(files))}/{len(files)}", flush=True)
    pending = []
    for food in foods:
        if food["id"] in photos or food["id"] in illustrations:
            continue
        image = info_by_title.get(wiki_files.get(food["id"], "").replace("_", " "))
        if not image or image["original"] in used:
            terms = food["photoTopic"].replace("as food", "food").replace("(fruit)", "fruit")
            result = api("commons.wikimedia.org", action="query", generator="search", gsrnamespace=6,
                         gsrsearch=terms + " filetype:bitmap", gsrlimit=8,
                         prop="imageinfo", iiprop="url|extmetadata", iiurlwidth=400)
            candidates = sorted(result.get("query", {}).get("pages", {}).values(), key=lambda page: page.get("index", 100))
            image = next((entry for page in candidates if (entry := acceptable(page)) and entry["original"] not in used), None)
        if not image:
            print("NEEDS PHOTO:", food["id"], food["photoTopic"], flush=True)
            continue
        used.add(image["original"])
        pending.append((food["id"], image))
        if len(pending) % 15 == 0:
            print(f"Selected distinct photos {len(pending)}/{len(foods)}", flush=True)
    def download(item):
        food_id, image = item
        ext = re.search(r"\.(jpe?g|png|webp)(?:$|\?)", image["remote"], re.I)[1].lower()
        file = OUT / (food_id + "." + ext)
        file.write_bytes(get(image["remote"]))
        return food_id, {**image, "src": "/points-foods/" + file.name}
    with ThreadPoolExecutor(max_workers=4) as pool:
        for food_id, image in pool.map(download, pending):
            photos[food_id] = image
            TARGET.write_text(json.dumps(photos, ensure_ascii=False, indent=2) + "\n")
            print(f"Saved {len(photos)}/{len(foods)}: {food_id}", flush=True)
    missing = [food["id"] for food in foods if food["id"] not in photos and food["id"] not in illustrations]
    print("Missing:", missing, flush=True)


if __name__ == "__main__":
    main()
