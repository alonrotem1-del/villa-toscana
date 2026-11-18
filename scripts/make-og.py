"""Social preview images (1200x630) for each model page: the product photo on the stone background.
Usage: node -e "<prints slugs>" | python3 scripts/make-og.py   (see CLAUDE.md)"""
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
items = json.load(sys.stdin)
out = os.path.join(ROOT, 'assets', 'og', 'models')
os.makedirs(out, exist_ok=True)
for it in items:
    src = Image.open(os.path.join(ROOT, 'assets', 'img', it['img'])).convert('RGB')
    w, h = src.size
    canvas = Image.new('RGB', (1200, 630), (236, 235, 229))
    if it.get('photo') and w >= 500:
        s = max(1200 / w, 630 / h)
        src = src.resize((round(w * s), round(h * s)), Image.LANCZOS)
        x, y = (src.width - 1200) // 2, (src.height - 630) // 2
        canvas = src.crop((x, y, x + 1200, y + 630))
    else:
        card = Image.new('RGB', (560, 560), (255, 255, 255))
        k = min(520 / w, 520 / h, 3.0)
        img = src.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        card.paste(img, ((560 - img.width) // 2, (560 - img.height) // 2))
        canvas.paste(card, (320, 35))
    canvas.save(os.path.join(out, it['slug'] + '.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
print(f'{len(items)} social images in assets/og/models/')
