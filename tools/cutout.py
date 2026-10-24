"""Frame -> transparent RGBA (1600x900). Spec pipeline adapted to a grey vignetted studio background."""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
import onnxruntime as ort

W, H = 1600, 900
sess = ort.InferenceSession(os.path.expanduser('~/.u2net/u2net_human_seg.onnx'), providers=['CPUExecutionProvider'])
iname = sess.get_inputs()[0].name

def person_mask(img):
    im = img.convert('RGB').resize((320, 320), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    a = a / max(a.max(), 1e-6)
    a = (a - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
    x = a.transpose(2, 0, 1)[None].astype(np.float32)
    p = sess.run(None, {iname: x})[0][0, 0]
    p = (p - p.min()) / max(p.max() - p.min(), 1e-6)
    return np.asarray(Image.fromarray((p * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32) / 255

_yy, _xx = np.mgrid[0:H, 0:W]
_u, _v = _xx / W - 0.5, _yy / H - 0.5
_B = np.stack([np.ones_like(_u), _u, _v, _u * _u, _u * _v, _v * _v, _u**3, _v**3], -1).reshape(-1, 8)

def bg_model(rgb, exclude):
    """Smooth polynomial background (vignette) fitted on pixels far from the subject."""
    f = rgb.reshape(-1, 3)
    ok = ~exclude.reshape(-1)
    sub = np.arange(0, ok.size, 7)
    sel = sub[ok[sub]]
    border = np.zeros((H, W), bool); border[:24] = border[-24:] = True; border[:, :24] = border[:, -24:] = True
    for _ in range(3):
        coef, *_ = np.linalg.lstsq(_B[sel], f[sel], rcond=None)
        res = np.abs(_B[sel] @ coef - f[sel]).max(1)
        keep = res < 7
        if keep.sum() < 2000: break
        sel = sel[keep]
    return (_B @ coef).reshape(H, W, 3)

def cutout(path):
    img = Image.open(path).convert('RGB').resize((W, H), Image.LANCZOS)
    rgb = np.asarray(img).astype(np.float32)
    pm = person_mask(img)
    excl = ndi.binary_dilation(pm > 0.05, iterations=14)
    bg = bg_model(rgb, excl)
    d = np.abs(rgb - bg).max(2)
    soft = np.clip((d - 14) / 26, 0, 1)
    b = ndi.binary_opening(soft > 0.5, structure=np.ones((3, 3)))
    # low-contrast surfaces (table top, chair) sit close to the backdrop: close gaps, fill holes
    opened = b
    closed = ndi.binary_closing(b, structure=np.ones((3, 3)), iterations=7, border_value=0)
    # closing may only bridge low-contrast prop surfaces, never the true backdrop between arm and torso
    dsm = ndi.gaussian_filter(d, 2.0)
    b = opened | (closed & ~opened & (dsm >= 5.5))
    holes = ndi.binary_fill_holes(b) & ~b
    # backdrop pockets enclosed by the suit (arm akimbo, arm/torso gap): border is almost all dark navy -> not a prop
    gapmask = np.zeros((H, W), np.float32)
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    suit = (lum < 95) & (rgb[..., 2] > rgb[..., 0] + 8)
    gl, gn = ndi.label(holes)
    for k in range(1, gn + 1):
        m = gl == k
        if m.sum() < 80: continue
        ring = ndi.binary_dilation(m, iterations=3) & ~m
        if suit[ring].mean() > 0.5:
            gapmask[ndi.binary_dilation(m, iterations=1)] = 1.0
    holes &= gapmask < 0.5
    holes[: int(H * 0.62)] = False  # props (table/chair) live in the lower part only
    hl, hn = ndi.label(holes)
    if hn:
        hs = ndi.sum(holes, hl, range(1, hn + 1))
        b = b | np.isin(hl, [i + 1 for i, v in enumerate(hs) if v < 12000])
    b = ndi.binary_opening(b, structure=np.ones((3, 3)), iterations=2)
    lab, n = ndi.label(b)
    if n:
        sizes = ndi.sum(b, lab, range(1, n + 1))
        b = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 4000])
    core = ndi.gaussian_filter(ndi.binary_erosion(b, iterations=2).astype(np.float32), 1.0)
    b = ndi.binary_dilation(b, iterations=4)
    props = np.maximum(soft * b, core)
    a = np.maximum(pm, props)
    a = a * (1 - gapmask)
    a = ndi.gaussian_filter(a, 0.8)
    m = a > 0.05
    out = rgb.copy()
    out[m] = (rgb[m] - (1 - a[m, None]) * bg[m]) / a[m, None]
    out = np.clip(out, 0, 255)
    a = 0.35 * a + 0.65 * ndi.minimum_filter(a, 3)
    a = np.clip((a - 0.14) / 0.86, 0, 1) ** 1.4
    # edge cleanup: edge pixels that still look like background lose opacity
    dd = np.abs(out - bg).max(2)
    edge = a < 0.95
    a = np.where(edge, a * np.clip(dd / 28, 0.25, 1), a)
    rgba = np.dstack([out, a * 255]).clip(0, 255).astype(np.uint8)
    return rgba, pm

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for i in map(int, sys.argv[2:]):
        rgba, pm = cutout(f'/home/claude/work/full/f{i:03d}.png')
        Image.fromarray(rgba).save(f'{out}/f{i:03d}.png')
        np.save(f'{out}/pm{i:03d}.npy', (pm * 255).astype(np.uint8))
        print('ok', i, flush=True)
