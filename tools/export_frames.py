"""RGBA frames -> per-shot cropped WebP (lg + sm) + manifest.json. Usage: export_frames.py <rgba_dir> <out_dir>"""
import sys, os, json, numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
N = 240
# The video is one continuous take (no hard cuts): 4 logical shots at pose boundaries.
SHOTS = [(0, 59), (60, 109), (110, 159), (160, 239)]
for d in ('lg', 'sm'): os.makedirs(f'{out}/{d}', exist_ok=True)
man = {'w': 1600, 'h': 900, 'count': N, 'shots': []}
for a0, a1 in SHOTS:
    A = {i: np.asarray(Image.open(f'{src}/f{i:03d}.png'))[:, :, 3] for i in range(a0, a1 + 1)}
    u = np.maximum.reduce(list(A.values())) > 6
    ys, xs = np.where(u)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    w, h = x1 - x0, y1 - y0
    # person centre: alpha-weighted mean x of the top 45% rows, person mask only (ignores table/laptop)
    cxs = []
    for i, a in A.items():
        pm = np.load(f'{src}/pm{i:03d}.npy').astype(np.float32) / 255
        wgt = (a.astype(np.float32) / 255) * (pm > 0.35)
        top = wgt[y0:y0 + int(h * 0.45), :]
        xs_ = np.arange(1600)[None, :]
        if top.sum() > 0: cxs.append(float((top * xs_).sum() / top.sum()))
    cx = float(np.mean(cxs)) / 1600
    for i in range(a0, a1 + 1):
        im = Image.fromarray(np.asarray(Image.open(f'{src}/f{i:03d}.png'))).crop((x0, y0, x1, y1))
        im.save(f'{out}/lg/f{i:03d}.webp', 'WEBP', quality=80, alpha_quality=90, method=4)
        im.resize((max(1, w // 2), max(1, h // 2)), Image.LANCZOS).save(f'{out}/sm/f{i:03d}.webp', 'WEBP', quality=78, alpha_quality=90, method=4)
    man['shots'].append({'from': a0, 'to': a1, 'box': [x0, y0, w, h], 'cx': round(cx, 4)})
    print('shot', a0, a1, [x0, y0, w, h], round(cx, 3), flush=True)
json.dump(man, open(f'{out}/manifest.json', 'w'))
