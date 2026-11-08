import base64
import io
import json
import pathlib
import urllib.request

from PIL import Image, ImageOps

API = "https://script.google.com/macros/s/AKfycbxUkATP8k3pFilHGCCsqRspuAwKN_lH0t2bJkhBGhqufyYD6cCocR0aj67V3Cq-KZT-/exec"
OUT = pathlib.Path(__file__).resolve().parents[2] / "lutins" / "photos"
MAX_PX = 1000


def get(query):
    with urllib.request.urlopen(f"{API}?{query}", timeout=120) as r:
        return json.loads(r.read())


def main():
    ids = [p["id"] for p in get("action=photos")]
    OUT.mkdir(parents=True, exist_ok=True)
    for file_id in ids:
        target = OUT / f"{file_id}.webp"
        if target.exists():
            continue
        data = base64.b64decode(get(f"action=photo&id={file_id}")["data"])
        try:
            img = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
        except OSError as e:
            print("::warning::illisible, à convertir en JPEG :", file_id, e)
            continue
        img.thumbnail((MAX_PX, MAX_PX))
        img.convert("RGB").save(target, "WEBP", quality=82)
        print("ajoutée", file_id)
    for old in OUT.glob("*.webp"):
        if old.stem not in ids:
            old.unlink()
            print("retirée", old.stem)


if __name__ == "__main__":
    main()
