"""
Genera las 4 portadas del blog (1200 x 630) con el estilo de marca de
Dominant System. Sirven como cabecera de artículo, imagen de tarjeta y og:image.
Salida: assets/blog/<slug>.png  (+ .webp)
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

W, H = 1200, 630
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(HERE, "blog")
os.makedirs(OUTDIR, exist_ok=True)

# ── Paleta marca ──────────────────────────────────────────────
INK    = (15, 23, 42)     # navy #0f172a
BLUE   = (37, 99, 235)    # #2563eb
DARK   = (30, 58, 138)    # #1e3a8a
WHITE  = (255, 255, 255)
SOFT   = (191, 219, 254)  # blue-soft claro para acentos
MUTED  = (148, 163, 184)  # slate-400

def font(bold, size):
    bolds = [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
    regs  = [r"C:\Windows\Fonts\segoeui.ttf",  r"C:\Windows\Fonts\arial.ttf"]
    for p in (bolds if bold else regs):
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except Exception: pass
    return ImageFont.load_default()

def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= max_w:
            cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def base_canvas():
    img = Image.new("RGBA", (W, H), (*INK, 255))
    # degradado diagonal navy -> blue-dark
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for y in range(H):
        t = y / H
        r = int(INK[0] + (DARK[0]-INK[0]) * t * 0.85)
        g = int(INK[1] + (DARK[1]-INK[1]) * t * 0.85)
        b = int(INK[2] + (DARK[2]-INK[2]) * t * 0.85)
        gd.line([(0, y), (W, y)], fill=(r, g, b, 255))
    img.alpha_composite(grad)
    # glow azul esquina superior derecha
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([700, -200, 1400, 480], fill=(*BLUE, 60))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(150)))
    # grid de puntos decorativo (derecha)
    dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dots)
    for row in range(13):
        for col in range(9):
            x, y = 770 + col*46, 60 + row*42
            if x < W-30 and y < H-30:
                dd.ellipse([x, y, x+4, y+4], fill=(*BLUE, 70))
    img.alpha_composite(dots)
    return img

def draw_panel(d, cx, cy, r=150):
    """Panel circular suave que contiene el motivo."""
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*BLUE, 26))
    d.ellipse([cx-r+22, cy-r+22, cx+r-22, cy+r-22], outline=(*SOFT, 90), width=3)

# ── Motivos (iconografía geométrica por tema) ─────────────────
def motif_precio(d, cx, cy):
    draw_panel(d, cx, cy)
    # barras crecientes
    bw, gap = 30, 20
    heights = [60, 95, 130, 165]
    x0 = cx - (len(heights)*(bw+gap)-gap)//2
    base = cy + 90
    for i, h in enumerate(heights):
        x = x0 + i*(bw+gap)
        col = SOFT if i < len(heights)-1 else WHITE
        d.rounded_rectangle([x, base-h, x+bw, base], radius=7, fill=(*col, 255))
    # símbolo euro
    f = font(True, 120)
    d.text((cx, cy-120), "€", font=f, anchor="mm", fill=(*WHITE, 255))

def motif_visibilidad(d, cx, cy):
    draw_panel(d, cx, cy)
    # lupa
    lx, ly, lr = cx-20, cy-25, 78
    d.ellipse([lx-lr, ly-lr, lx+lr, ly+lr], outline=(*WHITE, 255), width=14)
    d.line([lx+lr*0.7, ly+lr*0.7, lx+lr*0.7+60, ly+lr*0.7+60], fill=(*WHITE, 255), width=18)
    d.line([lx+lr*0.7+50, ly+lr*0.7+50, lx+lr*0.7+95, ly+lr*0.7+95], fill=(*SOFT, 255), width=22)
    # flecha de crecimiento dentro de la lupa
    pts = [(lx-40, ly+30), (lx-10, ly-5), (lx+18, ly+12), (lx+50, ly-35)]
    d.line(pts, fill=(*SOFT, 255), width=10, joint="curve")
    d.polygon([(lx+50, ly-35), (lx+30, ly-34), (lx+50, ly-12)], fill=(*SOFT, 255))

def motif_local(d, cx, cy):
    draw_panel(d, cx, cy)
    # montañas
    base = cy + 95
    d.polygon([(cx-120, base), (cx-30, base-110), (cx+60, base)], fill=(*SOFT, 230))
    d.polygon([(cx-10, base), (cx+70, base-150), (cx+150, base)], fill=(*WHITE, 255))
    # nieve cima
    d.polygon([(cx+70, base-150), (cx+48, base-118), (cx+95, base-118)], fill=(*BLUE, 255))
    # pin de ubicación
    px, py, pr = cx-25, cy-95, 34
    d.ellipse([px-pr, py-pr, px+pr, py+pr], fill=(*WHITE, 255))
    d.polygon([(px-pr+6, py+pr-12), (px+pr-6, py+pr-12), (px, py+pr+30)], fill=(*WHITE, 255))
    d.ellipse([px-13, py-13, px+13, py+13], fill=(*BLUE, 255))

def motif_alerta(d, cx, cy):
    draw_panel(d, cx, cy)
    # triángulo de aviso
    s = 150
    top = (cx, cy-95); left = (cx-s*0.92, cy+85); right = (cx+s*0.92, cy+85)
    d.line([top, left, right, top], fill=(*WHITE, 255), width=14, joint="curve")
    # signo de exclamación
    d.rounded_rectangle([cx-9, cy-40, cx+9, cy+32], radius=8, fill=(*WHITE, 255))
    d.ellipse([cx-10, cy+48, cx+10, cy+68], fill=(*WHITE, 255))
    # pequeña flecha arriba (mejora) en esquina
    ax, ay = cx+108, cy-70
    d.line([(ax, ay+34), (ax, ay-26)], fill=(*SOFT, 255), width=10)
    d.polygon([(ax, ay-34), (ax-20, ay-10), (ax+20, ay-10)], fill=(*SOFT, 255))

# ── Definición de las 4 portadas ──────────────────────────────
COVERS = [
    dict(slug="cuanto-cuesta-una-web", cat="PRECIOS",
         title="¿Cuánto cuesta una web profesional?", accent="cuesta",
         motif=motif_precio),
    dict(slug="por-que-tu-negocio-necesita-web", cat="NEGOCIO LOCAL",
         title="¿Por qué tu negocio necesita una web?", accent="necesita",
         motif=motif_visibilidad),
    dict(slug="diseno-web-sierra-de-madrid", cat="SEO LOCAL",
         title="Diseño web en la Sierra de Madrid", accent="Sierra de Madrid",
         motif=motif_local),
    dict(slug="senales-web-pierde-clientes", cat="RENOVAR WEB",
         title="5 señales de que tu web pierde clientes", accent="pierde clientes",
         motif=motif_alerta),
]

for c in COVERS:
    img = base_canvas()
    d = ImageDraw.Draw(img)
    # franja de acento izquierda
    d.rectangle([0, 0, 6, H], fill=(*BLUE, 255))
    # marca arriba izquierda
    bx, by, bs = 80, 70, 56
    d.rounded_rectangle([bx, by, bx+bs, by+bs], radius=14, fill=(*BLUE, 255))
    d.text((bx+bs//2, by+bs//2), "DS", font=font(True, 24), anchor="mm", fill=WHITE)
    d.text((bx+bs+16, by+bs//2), "Dominant System", font=font(False, 22), anchor="lm", fill=MUTED)
    # pill de categoría
    pf = font(True, 22)
    pw = d.textlength(c["cat"], font=pf)
    d.rounded_rectangle([80, 250, 80+pw+44, 298], radius=24, outline=(*SOFT, 200), width=2, fill=(*BLUE, 40))
    d.text((80+22, 274), c["cat"], font=pf, anchor="lm", fill=(*SOFT, 255))
    # título (con palabra de acento resaltada)
    tf = font(True, 58)
    lines = wrap(d, c["title"], tf, 600)
    y = 330
    accent = c["accent"]
    for ln in lines:
        x = 80
        # resaltar palabra(s) de acento
        if accent and accent in ln:
            before, after = ln.split(accent, 1)
            if before:
                d.text((x, y), before, font=tf, fill=WHITE); x += d.textlength(before, font=tf)
            d.text((x, y), accent, font=tf, fill=(*SOFT, 255)); x += d.textlength(accent, font=tf)
            if after:
                d.text((x, y), after, font=tf, fill=WHITE)
        else:
            d.text((x, y), ln, font=tf, fill=WHITE)
        y += 70
    # url abajo
    d.text((80, H-58), "dominant.es/blog", font=font(False, 22), anchor="lm", fill=MUTED)
    # motivo a la derecha
    c["motif"](d, 935, 315)

    out_png = os.path.join(OUTDIR, c["slug"] + ".png")
    img.convert("RGB").save(out_png, "PNG", optimize=True)
    img.convert("RGB").save(os.path.join(OUTDIR, c["slug"] + ".webp"), "WEBP", quality=82, method=6)
    kb = os.path.getsize(out_png)/1024
    print(f"OK {c['slug']}.png ({kb:.0f}KB) + .webp")
print("DONE ->", OUTDIR)
