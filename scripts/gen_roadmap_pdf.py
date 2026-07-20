"""Generate the Megaverse Live lead-magnet PDF:
'The 6-Month Backend Engineering Roadmap' (SDE-2 / SDE-3).

Content distilled from Harshit Goyal's roadmap video (youtu.be/7YGE_xeb5ZQ).
Output: public/assets/backend-roadmap.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, FrameBreak, NextPageTemplate, PageBreak,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
OUT = os.path.join(HERE, "..", "public", "assets", "backend-roadmap.pdf")

# ---- Brand palette (matched to harshitgoyal.com) ----
TERRA = HexColor("#BB5A3A")
RUST = HexColor("#7D3C27")
ESPRESSO = HexColor("#3E1E13")
BLUSH = HexColor("#FCDED9")
CREAM = HexColor("#FDF8F4")
PAPER = HexColor("#FFFFFF")
MUTED = HexColor("#6B615B")
INK = HexColor("#241612")
SAGE = HexColor("#3E8159")

# ---- Fonts ----
def reg(name, filename):
    try:
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, filename)))
        return name
    except Exception:
        return None

DISPLAY = reg("Playfair", "Playfair.ttf") or "Times-Bold"
BODY = reg("SourceSerif", "SourceSerif.ttf") or "Times-Roman"
SCRIPT = reg("Dancing", "Dancing.ttf") or "Times-Italic"

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

# ---- Styles ----
def style(name, **kw):
    return ParagraphStyle(name, **kw)

s_kicker = style("kicker", fontName=BODY, fontSize=10, textColor=TERRA,
                 leading=14, spaceAfter=2, alignment=TA_LEFT)
s_h1 = style("h1", fontName=DISPLAY, fontSize=30, textColor=ESPRESSO, leading=34, spaceAfter=6)
s_h2 = style("h2", fontName=DISPLAY, fontSize=17, textColor=RUST, leading=21, spaceBefore=4, spaceAfter=4)
s_body = style("body", fontName=BODY, fontSize=10.5, textColor=INK, leading=15, spaceAfter=6)
s_muted = style("muted", fontName=BODY, fontSize=9.5, textColor=MUTED, leading=13)
s_bullet = style("bullet", fontName=BODY, fontSize=10, textColor=INK, leading=14, leftIndent=10, spaceAfter=2)
s_chip = style("chip", fontName=BODY, fontSize=8.5, textColor=PAPER, leading=10, alignment=TA_CENTER)
s_num = style("num", fontName=DISPLAY, fontSize=20, textColor=PAPER, leading=22, alignment=TA_CENTER)
s_topic = style("topic", fontName=DISPLAY, fontSize=14, textColor=ESPRESSO, leading=17)
s_time = style("time", fontName=BODY, fontSize=9, textColor=TERRA, leading=11)

# ---- Data: 9 topics ----
TOPICS = [
    ("01", "Data Structures &amp; Algorithms (DSA)", "4\u20135 months \u00b7 runs throughout",
     "Your constant companion for the whole prep. Solve <b>2 questions a day</b> on weekdays, "
     "<b>3\u20134</b> on weekends \u2014 adjust to your bandwidth. Keep it running in parallel with every "
     "other topic below."),
    ("02", "High-Level System Design (HLD)", "2\u20133 months",
     "Asked in 2\u20133 rounds at top companies. Practice designing Instagram, WhatsApp, a booking "
     "system: services, user flows, REST vs. queue-based communication, and which database fits where."),
    ("03", "Low-Level System Design (LLD)", "1\u20132 months",
     "Interfaces, classes, DB schemas and design patterns. Know how a request flows through the "
     "layers \u2014 data \u2192 business \u2192 presentation \u2014 and how to keep it modular."),
    ("04", "Machine Coding", "Optional \u00b7 LLD + coding",
     "A mix of low-level design and clean coding under time. E.g. \u201cwrite a user service\u201d or "
     "\u201ca booking service.\u201d They watch your design patterns, class design, and modularity. "
     "Easy if your fundamentals are solid."),
    ("05", "Databases", "~1 month",
     "Shows up in HLD, LLD and machine coding. Master <b>SQL vs. NoSQL</b> and when to pick each; "
     "NoSQL types (key-value, columnar, time-series, document); the CAP theorem; and SQL depth \u2014 "
     "indexes, keys and joins."),
    ("06", "Programming Language", "~1 month",
     "Pick one language and know it end to end \u2014 e.g. Java: core (constructors, methods), advanced "
     "(exception handling), and frameworks (Spring Boot, Hibernate)."),
    ("07", "Projects", "~1 month",
     "Have something real to defend. College project: on GitHub, working, with a README. Work project: "
     "know its high-level design, your exact contribution, and its key constraints."),
    ("08", "Tools", "~1 month",
     "Git and a build tool (Maven), IDEs, and how you use AI models &amp; prompts (pros/cons). "
     "Monitoring (Prometheus, Grafana) and logging (ELK \u2014 Elasticsearch, Kibana)."),
    ("09", "Cloud Systems", "~1 month",
     "Basic services of any one cloud (AWS / Azure / GCP) \u2014 compute/VM, managed databases, cache, "
     "storage, roles. Roughly 8\u20139 core services. Directly powers your HLD answers."),
]


def chip(text, color=TERRA):
    t = Table([[Paragraph(text, s_chip)]], colWidths=[42 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("ROUNDEDCORNERS", [5, 5, 5, 5]),
    ]))
    return t


def topic_block(num, title, timeline, desc):
    badge = Table([[Paragraph(num, s_num)]], colWidths=[13 * mm], rowHeights=[13 * mm])
    badge.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TERRA),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    right = [
        Paragraph(title, s_topic),
        Spacer(1, 2),
        Paragraph("\u2022 " + timeline, s_time),
        Spacer(1, 4),
        Paragraph(desc, s_body),
    ]
    row = Table([[badge, right]], colWidths=[16 * mm, PAGE_W - 2 * MARGIN - 16 * mm])
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (0, 0), "TOP"),
        ("VALIGN", (1, 0), (1, 0), "TOP"),
        ("LEFTPADDING", (1, 0), (1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return KeepTogether([row, Spacer(1, 10)])


# ---- Canvas painters (backgrounds + footer) ----
def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(BODY, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 10 * mm, "Megaverse Live  \u00b7  1:1 live mentorship")
    canvas.drawRightString(PAGE_W - MARGIN, 10 * mm, "megaverselive.com")
    canvas.setStrokeColor(BLUSH)
    canvas.setLineWidth(0.8)
    canvas.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
    canvas.restoreState()


def cover_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(ESPRESSO)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # terracotta band
    canvas.setFillColor(TERRA)
    canvas.rect(0, PAGE_H - 6 * mm, PAGE_W, 6 * mm, fill=1, stroke=0)
    canvas.rect(0, 0, PAGE_W, 6 * mm, fill=1, stroke=0)
    canvas.restoreState()


def content_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.restoreState()
    _footer(canvas, doc)


# ---- Build ----
def build():
    doc = BaseDocTemplate(OUT, pagesize=A4,
                          leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=MARGIN, bottomMargin=18 * mm,
                          title="The 6-Month Backend Engineering Roadmap",
                          author="Megaverse Live")
    frame = Frame(MARGIN, 18 * mm, PAGE_W - 2 * MARGIN, PAGE_H - MARGIN - 18 * mm, id="main")
    cover_frame = Frame(MARGIN, 30 * mm, PAGE_W - 2 * MARGIN, PAGE_H - 70 * mm, id="cover")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame], onPage=cover_bg),
        PageTemplate(id="content", frames=[frame], onPage=content_bg),
    ])

    story = []

    # ---------- COVER ----------
    cov_kicker = style("ck", fontName=SCRIPT, fontSize=30, textColor=BLUSH, leading=32, alignment=TA_LEFT)
    cov_title = style("ct", fontName=DISPLAY, fontSize=38, textColor=PAPER, leading=42, spaceBefore=10)
    cov_sub = style("cs", fontName=BODY, fontSize=13, textColor=BLUSH, leading=19, spaceBefore=12)
    cov_meta = style("cm", fontName=BODY, fontSize=10.5, textColor=HexColor("#E8C0B3"), leading=16, spaceBefore=22)

    story += [
        Spacer(1, 20),
        Paragraph("Megaverse Live", cov_kicker),
        Paragraph("The 6-Month Backend<br/>Engineering Roadmap", cov_title),
        Paragraph("A focused plan to crack <b>SDE-2 / SDE-3</b> interviews at top product-based "
                  "companies and strong startups.", cov_sub),
        Paragraph("9 core topics &nbsp;\u2022&nbsp; month-by-month timeline &nbsp;\u2022&nbsp; "
                  "the major / minor study system", cov_meta),
        Spacer(1, 30),
        Paragraph("Follow it diligently for six months and there won\u2019t be a backend interview that "
                  "goes beyond what\u2019s inside.", style("cq", fontName=SCRIPT, fontSize=17,
                  textColor=PAPER, leading=22)),
    ]
    story += [NextPageTemplate("content"), PageBreak()]

    # ---------- INTRO ----------
    story += [
        Paragraph("How to use this roadmap", s_h1),
        Spacer(1, 2),
        Paragraph("This is a <b>high-level, 6-month plan</b>: four months of focused preparation, one "
                  "month of giving interviews, and one month to fix the gaps those interviews expose. "
                  "The nine topics below cover everything a backend software-engineering interview will "
                  "throw at you.", s_body),
        Spacer(1, 8),
    ]

    for t in TOPICS:
        story.append(topic_block(*t))

    # ---------- FRAMEWORK ----------
    story += [PageBreak(), Paragraph("The Major / Minor System", s_h1),
              Paragraph("Don\u2019t study one topic at a time. Each week, pick <b>one major topic</b> "
                        "(~80% of your effort) and <b>one or two minor topics</b> alongside it \u2014 with "
                        "DSA always running in the background.", s_body),
              Spacer(1, 6)]

    ex = Table([
        [Paragraph("<b>Week</b>", s_muted), Paragraph("<b>Major (~80%)</b>", s_muted), Paragraph("<b>Minor</b>", s_muted)],
        [Paragraph("Example A", s_body), Paragraph("Recursion (DSA block)", s_body), Paragraph("2\u20133 LLD topics", s_body)],
        [Paragraph("Example B", s_body), Paragraph("3\u20134 HLD questions", s_body), Paragraph("1\u20132 array / string sets", s_body)],
    ], colWidths=[30 * mm, (PAGE_W - 2 * MARGIN - 30 * mm) / 2, (PAGE_W - 2 * MARGIN - 30 * mm) / 2])
    ex.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BLUSH),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, HexColor("#E8C0B3")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [ex, Spacer(1, 16)]

    story += [Paragraph("How the 6 months break down", s_h2), Spacer(1, 4)]
    tl = Table([
        [Paragraph("<b>Months 1\u20134</b>", s_body), Paragraph("Preparation \u2014 work the 9 topics with the major/minor system. DSA every day.", s_body)],
        [Paragraph("<b>Month 5</b>", s_body), Paragraph("Give interviews. Real rounds surface your true gaps \u2014 communication, weak topics, blind spots.", s_body)],
        [Paragraph("<b>Month 6</b>", s_body), Paragraph("Fix what broke. Write down what went wrong, act on feedback, and go again \u2014 stronger.", s_body)],
    ], colWidths=[32 * mm, PAGE_W - 2 * MARGIN - 32 * mm])
    tl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, HexColor("#E8C0B3")),
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#FBEEE7")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [tl, Spacer(1, 10),
              Paragraph("Break the roadmap into months, then months into weeks. Keep the DSA baseline "
                        "of two questions a day and let the majors rotate. That\u2019s the whole system.",
                        s_muted)]

    # ---------- CTA ----------
    story += [PageBreak(),
              Paragraph("Want a mentor in your corner?", s_h1),
              Paragraph("Knowing the roadmap is one thing \u2014 executing it for six months is another. "
                        "That\u2019s where 1:1 mentorship helps: a personalised plan, live doubt-solving, "
                        "mock interviews, and honest feedback that keeps you on track.", s_body),
              Spacer(1, 8)]

    offers = Table([
        [Paragraph("<b>Single session</b>", s_body), Paragraph("Unblock one specific goal, decision, or interview \u2014 fast.", s_muted)],
        [Paragraph("<b>Plus \u00b7 6 months</b>", s_body), Paragraph("12 sessions with a roadmap, biweekly syncs, and curated resources.", s_muted)],
        [Paragraph("<b>Premium \u00b7 6 months</b>", s_body), Paragraph("24 sessions + mock interviews, resume/LinkedIn review, and referrals.", s_muted)],
    ], colWidths=[42 * mm, PAGE_W - 2 * MARGIN - 42 * mm])
    offers.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, HexColor("#E8C0B3")),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [offers, Spacer(1, 16)]

    link = style("lk", fontName=DISPLAY, fontSize=15, textColor=TERRA, leading=20)
    story += [
        Paragraph("Book a free 15-minute intro call at megaverselive.com", link),
        Spacer(1, 4),
        Paragraph("Based on Harshit Goyal\u2019s backend roadmap. Watch the full video: youtu.be/7YGE_xeb5ZQ", s_muted),
    ]

    doc.build(story)
    print("saved", os.path.relpath(OUT))


if __name__ == "__main__":
    build()
