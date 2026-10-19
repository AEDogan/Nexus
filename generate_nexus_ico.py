import math
from PIL import Image, ImageDraw, ImageFilter

def create_nexus_prism_icon():
    size = 512
    # Create master image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Subtle squircle / rounded card background (like modern macOS / Windows Fluent)
    card_margin = 32
    card_radius = 100
    # Outer soft glow
    glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.rounded_rectangle(
        [card_margin - 8, card_margin - 8, size - card_margin + 8, size - card_margin + 8],
        radius=card_radius + 4,
        fill=(20, 184, 166, 60)
    )
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(16))
    img.alpha_composite(glow_img)

    # Base dark glass tile
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    tile_draw = ImageDraw.Draw(tile)
    tile_draw.rounded_rectangle(
        [card_margin, card_margin, size - card_margin, size - card_margin],
        radius=card_radius,
        fill=(11, 16, 26, 235),
        outline=(45, 212, 191, 140),
        width=3
    )
    img.alpha_composite(tile)

    # 2. Hexagonal Prism Coordinates
    cx, cy = size // 2, size // 2
    r_outer = 160
    
    # 6 vertices of the hexagon
    angles = [-90, -30, 30, 90, 150, 210]
    pts = [
        (int(cx + r_outer * math.cos(math.radians(a))), int(cy + r_outer * math.sin(math.radians(a))))
        for a in angles
    ]
    # pts: 0=top, 1=top-right, 2=bottom-right, 3=bottom, 4=bottom-left, 5=top-left
    c_pt = (cx, cy)

    # Facet layer
    facets_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(facets_img)

    # Facet 0: Top-Left to Center (pts[5], pts[0], c_pt)
    f_draw.polygon([pts[5], pts[0], c_pt], fill=(20, 184, 166, 170))
    
    # Facet 1: Top-Right to Center (pts[0], pts[1], c_pt) -> Specular reflection
    f_draw.polygon([pts[0], pts[1], c_pt], fill=(255, 255, 255, 190))

    # Facet 2: Right to Center (pts[1], pts[2], c_pt)
    f_draw.polygon([pts[1], pts[2], c_pt], fill=(2, 132, 199, 180))

    # Facet 3: Bottom-Right to Center (pts[2], pts[3], c_pt)
    f_draw.polygon([pts[2], pts[3], c_pt], fill=(6, 182, 212, 140))

    # Facet 4: Bottom-Left to Center (pts[3], pts[4], c_pt)
    f_draw.polygon([pts[3], pts[4], c_pt], fill=(13, 148, 136, 160))

    # Facet 5: Left to Center (pts[4], pts[5], c_pt)
    f_draw.polygon([pts[4], pts[5], c_pt], fill=(5, 150, 105, 150))

    # Internal facet lines
    for p in pts:
        f_draw.line([c_pt, p], fill=(255, 255, 255, 200), width=3)
    
    # Outer hexagon boundary
    for i in range(len(pts)):
        p1 = pts[i]
        p2 = pts[(i + 1) % len(pts)]
        f_draw.line([p1, p2], fill=(45, 212, 191, 240), width=4)

    # Center glowing jewel
    core_glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(core_glow)
    cg_draw.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(45, 212, 191, 180))
    core_glow = core_glow.filter(ImageFilter.GaussianBlur(8))
    facets_img.alpha_composite(core_glow)

    f_draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(255, 255, 255, 255))
    f_draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(220, 252, 245, 255))

    img.alpha_composite(facets_img)

    # Save PNG (512x512)
    png_path = r"C:\Projeler\nexus\public\nexus_icon.png"
    img.save(png_path, "PNG")

    # Save Multi-Resolution ICO
    ico_path = r"C:\Projeler\nexus\public\nexus_icon.ico"
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    img.save(ico_path, format="ICO", sizes=icon_sizes)

    print(f"SUCCESS: Saved {png_path} and {ico_path}")

if __name__ == "__main__":
    create_nexus_prism_icon()
