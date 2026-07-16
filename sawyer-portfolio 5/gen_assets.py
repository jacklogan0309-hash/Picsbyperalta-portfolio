"""
Generates placeholder duotone SVG art standing in for Sawyer's real action
photography. These exist only so the layout/color/grid can be evaluated
before real shots are dropped in -- swap files in /assets with actual
photo exports (same filenames) and nothing else needs to change.
"""
import random, math

UMBER = "#A63D0E"
UMBER_DARK = "#7A2E0A"
UMBER_DEEPER = "#5C220A"
CREAM = "#F7F1E6"
INK = "#180D08"

random.seed(7)

def motion_streaks(n, w, h, color, opacity=0.35, seed=0):
    r = random.Random(seed)
    lines = []
    for i in range(n):
        y = r.uniform(0, h)
        x1 = r.uniform(-w*0.2, w*0.3)
        length = r.uniform(w*0.3, w*0.9)
        sw = r.uniform(1.5, 6)
        lines.append(
            f'<line x1="{x1:.1f}" y1="{y:.1f}" x2="{x1+length:.1f}" y2="{y - r.uniform(-30,30):.1f}" '
            f'stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round" opacity="{opacity}"/>'
        )
    return "\n".join(lines)

def sprinter_silhouette(cx, cy, scale, color):
    # crude but dynamic "leaning sprinter" built from primitives
    return f'''
    <g transform="translate({cx},{cy}) scale({scale})" fill="{color}">
        <ellipse cx="0" cy="-92" rx="16" ry="18"/>
        <path d="M -6,-76 C 10,-70 18,-40 8,-8 C 4,10 -10,20 -26,26 L -34,14
                 C -20,6 -10,-6 -8,-24 C -22,-18 -40,-6 -50,10 L -62,2
                 C -46,-20 -22,-40 -2,-52 C -10,-62 -12,-70 -6,-76 Z"/>
        <path d="M 6,-40 C 24,-34 40,-18 46,4 L 34,10 C 28,-6 16,-20 2,-26 Z"/>
        <path d="M -2,-6 C 14,2 26,18 24,40 L 10,42 C 12,24 2,10 -10,4 Z"/>
        <path d="M -10,4 C -26,10 -40,26 -44,46 L -58,42 C -52,20 -34,2 -14,-6 Z"/>
    </g>'''

def jumper_silhouette(cx, cy, scale, color):
    return f'''
    <g transform="translate({cx},{cy}) scale({scale})" fill="{color}">
        <ellipse cx="4" cy="-104" rx="15" ry="17"/>
        <path d="M -4,-88 C 14,-84 22,-64 18,-44 C 30,-52 44,-64 52,-80 L 64,-70
                 C 54,-50 36,-32 16,-20 C 10,-4 2,10 -6,22 L -20,16
                 C -10,4 -4,-10 -4,-24 C -18,-16 -34,-6 -44,10 L -56,0
                 C -42,-20 -22,-36 0,-46 C -8,-60 -10,-76 -4,-88 Z"/>
        <path d="M -6,22 C -4,40 -8,58 -18,72 L -32,66 C -24,54 -20,40 -22,26 Z"/>
    </g>'''

def swing_silhouette(cx, cy, scale, color):
    return f'''
    <g transform="translate({cx},{cy}) scale({scale})" fill="{color}">
        <ellipse cx="-2" cy="-90" rx="15" ry="17"/>
        <path d="M -4,-74 C 8,-70 14,-52 10,-34 C 6,-16 -6,-2 -20,8 L -30,-2
                 C -18,-10 -10,-22 -8,-36 C -20,-30 -34,-22 -44,-10 L -54,-20
                 C -40,-36 -20,-48 2,-54 C -6,-62 -8,-68 -4,-74 Z"/>
        <path d="M 8,-56 L 66,-92 L 70,-82 L 16,-40 Z"/>
        <path d="M -8,-36 C -6,-18 -14,-2 -28,10 L -40,2 C -28,-8 -22,-22 -22,-34 Z"/>
        <path d="M -20,8 C -22,26 -30,42 -44,52 L -56,44 C -44,34 -38,20 -36,4 Z"/>
    </g>'''

SPORTS = [
    ("Football",   sprinter_silhouette, UMBER_DARK),
    ("Basketball", jumper_silhouette,   UMBER_DARK),
    ("Track",      sprinter_silhouette, UMBER_DARK),
    ("Soccer",     jumper_silhouette,   UMBER_DARK),
    ("Tennis",     swing_silhouette,    UMBER_DARK),
    ("Swimming",   sprinter_silhouette, UMBER_DARK),
]

def wrap(w, h, bg, inner):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
<rect width="{w}" height="{h}" fill="{bg}"/>
{inner}
</svg>'''

# --- Hero (large, full-bleed) ---
hero_inner = motion_streaks(24, 1600, 900, CREAM, 0.16, seed=1)
hero_inner += jumper_silhouette(1080, 900, 4.2, CREAM)
hero_inner += motion_streaks(10, 1600, 900, INK, 0.10, seed=2)
open("assets/hero-large.svg", "w").write(wrap(1600, 900, UMBER, hero_inner))

# --- Secondary hero teaser (about/home strip) ---
hero2_inner = motion_streaks(14, 1200, 700, CREAM, 0.12, seed=3)
hero2_inner += sprinter_silhouette(560, 560, 2.1, CREAM)
open("assets/hero-secondary.svg", "w").write(wrap(1200, 700, UMBER_DARK, hero2_inner))

# --- Gallery thumbnails ---
for i, (name, fn, fg) in enumerate(SPORTS):
    w, h = 900, 1100
    bg = UMBER if i % 2 == 0 else UMBER_DARK
    inner = motion_streaks(8, w, h, CREAM, 0.10, seed=10+i)
    inner += fn(w*0.55, h*0.62, 2.0, CREAM)
    label = f'<text x="40" y="{h-50}" font-family="Helvetica, Arial, sans-serif" font-size="34" letter-spacing="2" fill="{CREAM}" opacity="0.85">{name.upper()}</text>'
    open(f"assets/thumb-{name.lower()}.svg", "w").write(wrap(w, h, bg, inner + label))

# --- About portrait placeholder ---
about_inner = f'<rect width="800" height="1000" fill="{UMBER_DEEPER}"/>'
about_inner += swing_silhouette(400, 620, 2.4, CREAM)
open("assets/about-portrait.svg", "w").write(wrap(800, 1000, UMBER_DEEPER, swing_silhouette(400,620,2.4,CREAM)))

# --- Favicon-ish mark (monogram) ---
mark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<rect width="64" height="64" fill="{UMBER}"/>
<text x="32" y="42" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="{CREAM}">SP</text>
</svg>'''
open("assets/mark.svg", "w").write(mark)

print("assets written")
