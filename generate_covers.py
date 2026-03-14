from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

TITLE = "CLARITY LOOP"
SUBTITLE = "A Technical Novel of GIS Modernization, AI Automation, and IT Governance"
AUTHOR = "Paul A.K. Iyogun"

FRONT_OUTPUT = Path("clarity_loop_front_cover.png")
WRAP_OUTPUT = Path("clarity_loop_kdp_wrap.png")

DPI = 300
TRIM_W_IN = 6.0
TRIM_H_IN = 9.0
PAGE_COUNT = 350
SPINE_PER_PAGE_IN = 0.002252  # KDP white paper estimate
BLEED_IN = 0.125


def try_font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in [name, "DejaVuSans-Bold.ttf", "DejaVuSans.ttf", "Arial.ttf"]:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def vertical_gradient(width: int, height: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGB", (width, height), top)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / max(1, height - 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * ratio) for i in range(3))
        draw.line((0, y, width, y), fill=color)
    return img


def draw_cinematic_front(img: Image.Image) -> None:
    draw = ImageDraw.Draw(img)
    w, h = img.size

    for i in range(12):
        x = int(w * (i + 1) / 13)
        draw.line((x, int(h * 0.18), x, int(h * 0.92)), fill=(30, 160, 205), width=2)

    for i in range(6):
        y = int(h * (0.25 + i * 0.1))
        draw.line((int(w * 0.08), y, int(w * 0.92), y), fill=(40, 95, 180), width=1)

    draw.polygon(
        [
            (int(w * 0.25), int(h * 0.78)),
            (int(w * 0.5), int(h * 0.45)),
            (int(w * 0.75), int(h * 0.78)),
        ],
        outline=(90, 225, 255),
        width=6,
    )

    title_font = try_font("DejaVuSans-Bold.ttf", 145)
    subtitle_font = try_font("DejaVuSans.ttf", 42)
    author_font = try_font("DejaVuSans.ttf", 54)

    draw.text((int(w * 0.08), int(h * 0.08)), TITLE, fill=(230, 248, 255), font=title_font)
    draw.text((int(w * 0.08), int(h * 0.2)), "TECHNICAL NOVEL", fill=(130, 222, 255), font=subtitle_font)

    wrapped = [
        "GIS Modernization · AI Automation",
        "IT Governance for High-Stakes Systems",
    ]
    y = int(h * 0.68)
    for line in wrapped:
        draw.text((int(w * 0.08), y), line, fill=(218, 238, 255), font=subtitle_font)
        y += 52

    draw.text((int(w * 0.08), int(h * 0.9)), AUTHOR, fill=(214, 242, 255), font=author_font)


def make_front_cover() -> Image.Image:
    w = int(TRIM_W_IN * DPI)
    h = int(TRIM_H_IN * DPI)
    img = vertical_gradient(w, h, (6, 18, 46), (12, 48, 98))
    draw_cinematic_front(img)
    return img


def make_kdp_wrap(front: Image.Image) -> Image.Image:
    trim_w_px = int(TRIM_W_IN * DPI)
    trim_h_px = int(TRIM_H_IN * DPI)
    bleed_px = int(BLEED_IN * DPI)
    spine_px = int(round(PAGE_COUNT * SPINE_PER_PAGE_IN * DPI))

    wrap_w = trim_w_px * 2 + spine_px + 2 * bleed_px
    wrap_h = trim_h_px + 2 * bleed_px

    wrap = vertical_gradient(wrap_w, wrap_h, (5, 14, 34), (10, 30, 66))
    draw = ImageDraw.Draw(wrap)

    back_x0 = bleed_px
    spine_x0 = bleed_px + trim_w_px
    front_x0 = spine_x0 + spine_px
    y0 = bleed_px

    # Back cover panel
    draw.rectangle((back_x0, y0, back_x0 + trim_w_px, y0 + trim_h_px), outline=(72, 128, 214), width=4)
    body_font = try_font("DejaVuSans.ttf", 36)
    head_font = try_font("DejaVuSans-Bold.ttf", 52)
    draw.text((back_x0 + 90, y0 + 120), "From chaos to control.", fill=(216, 236, 255), font=head_font)
    blurb = [
        "North River County's platform is failing under",
        "manual workflows, unstable automations, and",
        "governance blind spots. This technical novel follows",
        "the team that rebuilds operations using the",
        "Observe-Structure-Automate-Measure-Refine",
        "institutional loop.",
    ]
    by = y0 + 240
    for line in blurb:
        draw.text((back_x0 + 90, by), line, fill=(206, 226, 246), font=body_font)
        by += 52

    # Spine
    draw.rectangle((spine_x0, y0, spine_x0 + spine_px, y0 + trim_h_px), fill=(10, 28, 58), outline=(130, 200, 255), width=2)
    spine_font = try_font("DejaVuSans-Bold.ttf", 34)
    spine_text = "CLARITY LOOP"
    tw = draw.textlength(spine_text, font=spine_font)
    sx = spine_x0 + (spine_px - tw) / 2
    draw.text((sx, y0 + 40), spine_text, fill=(214, 238, 255), font=spine_font)

    # Front cover panel
    resized_front = front.resize((trim_w_px, trim_h_px))
    wrap.paste(resized_front, (front_x0, y0))
    draw.rectangle((front_x0, y0, front_x0 + trim_w_px, y0 + trim_h_px), outline=(72, 128, 214), width=4)

    return wrap


def main() -> None:
    front = make_front_cover()
    front.save(FRONT_OUTPUT)

    wrap = make_kdp_wrap(front)
    wrap.save(WRAP_OUTPUT)

    print(f"Generated {FRONT_OUTPUT}")
    print(f"Generated {WRAP_OUTPUT}")


if __name__ == "__main__":
    main()
