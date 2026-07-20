"""Generate a branded 1200x630 Open Graph preview image for Megaverse Live."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
top = (44, 21, 15)     # espresso / brand-900
bot = (168, 73, 47)    # terracotta / brand-600

img = Image.new("RGB", (W, H), top)
px = img.load()
for y in range(H):
    t = y / H
    r = int(top[0] + (bot[0] - top[0]) * t)
    g = int(top[1] + (bot[1] - top[1]) * t)
    b = int(top[2] + (bot[2] - top[2]) * t)
    for x in range(W):
        px[x, y] = (r, g, b)

d = ImageDraw.Draw(img)


def font(sz, bold=True):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return ImageFont.load_default()


d.text((80, 70), "Megaverse Live", font=font(54), fill=(246, 218, 206))
d.text((80, 200), "Book 1:1 Sessions", font=font(92), fill=(255, 255, 255))
d.text((80, 300), "with Real Mentors", font=font(92), fill=(255, 255, 255))
d.text((80, 430), "Backend Interview Prep  |  English Coaching",
       font=font(38, bold=False), fill=(235, 181, 159))
d.rounded_rectangle([80, 510, 470, 575], radius=32, fill=(62, 129, 89))
d.text((110, 524), "Live - Real feedback", font=font(32), fill=(255, 255, 255))
d.text((820, 545), "megaverselive.com", font=font(30, bold=False),
       fill=(246, 218, 206))

img.save("public/assets/og-image.png", "PNG")
print("saved public/assets/og-image.png", img.size)
