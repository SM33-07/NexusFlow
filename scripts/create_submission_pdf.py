from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "NexusFlow_Final_Submission.pdf"
ARCH = ROOT / "docs" / "nexus-architecture.png"

LIVE_URL = "https://nexus-flow-atomberg.vercel.app/"
REPO_URL = "https://github.com/SM33-07/NexusFlow"


def styles():
    base = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle(
            "Eyebrow",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#059669"),
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=36,
            leading=40,
            textColor=colors.HexColor("#0F172A"),
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "summary": ParagraphStyle(
            "Summary",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12.5,
            leading=18,
            textColor=colors.HexColor("#334155"),
            alignment=TA_CENTER,
            spaceAfter=18,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=colors.HexColor("#064E3B"),
            spaceBefore=16,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#334155"),
            spaceAfter=6,
        ),
        "link": ParagraphStyle(
            "Link",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#2563EB"),
            spaceAfter=8,
        ),
    }


def metric_strip(s):
    data = [
        [Paragraph("<b>3</b><br/><font size='7'>ROLE JOURNEYS</font>", s["summary"]),
         Paragraph("<b>100%</b><br/><font size='7'>WEIGHTAGE GUARD</font>", s["summary"]),
         Paragraph("<b>LIVE</b><br/><font size='7'>HOSTED DEMO</font>", s["summary"]),
         Paragraph("<b>CSV</b><br/><font size='7'>ADMIN EXPORT</font>", s["summary"])],
    ]
    table = Table(data, colWidths=[1.55 * inch] * 4)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#A7F3D0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#A7F3D0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


def build():
    s = styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.62 * inch,
        title="NexusFlow Final Submission",
        author="NexusFlow Team",
    )

    story = [
        Paragraph("ATOMQUEST HACKATHON SUBMISSION", s["eyebrow"]),
        Paragraph("NexusFlow", s["title"]),
        Paragraph(
            "Interactive enterprise goal canvas with role-based dashboards, approvals, quarterly tracking, audit logs, analytics, and database-backed persistence.",
            s["summary"],
        ),
        metric_strip(s),
        Spacer(1, 0.08 * inch),
        Paragraph("1. Live / Hosted Demo URL", s["h2"]),
        Paragraph(f"<a href='{LIVE_URL}' color='#2563EB'>{LIVE_URL}</a>", s["link"]),
        Paragraph("2. Source Code Repository", s["h2"]),
        Paragraph(f"<a href='{REPO_URL}' color='#2563EB'>{REPO_URL}</a>", s["link"]),
        Paragraph("3. Login Credentials", s["h2"]),
    ]

    creds = Table(
        [
            ["Role", "Email", "Password"],
            ["Employee", "employee@nexus.demo", "NexusEmp@2026"],
            ["Manager", "manager@nexus.demo", "NexusMgr@2026"],
            ["Admin / HR", "admin@nexus.demo", "NexusAdmin@2026"],
        ],
        colWidths=[1.3 * inch, 2.45 * inch, 2.05 * inch],
    )
    creds.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#064E3B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
        ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#0F172A")),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story += [
        creds,
        Paragraph("4. Suggested Demo Script", s["h2"]),
        Paragraph("<b>Employee journey:</b> Show the visual goal canvas, AI-assisted goal creation, 100% weightage validation, and quarterly actual logging.", s["body"]),
        Paragraph("<b>Manager journey:</b> Review direct-report goals, approve or return goals, observe approval locks, log check-ins, and export CSV.", s["body"]),
        Paragraph("<b>Admin / HR journey:</b> Open governance analytics, push shared KPIs, inspect audit and notification logs, and evaluate escalations.", s["body"]),
        PageBreak(),
    ]

    arch_doc = SimpleDocTemplate(
        str(OUT),
        pagesize=landscape(letter),
        rightMargin=0.45 * inch,
        leftMargin=0.45 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
    )

    # Build a two-page PDF using the first document template for page one, then append
    # page two by temporarily switching page size through a separate build is not supported
    # by SimpleDocTemplate. Use portrait page two with a wide image for compatibility.
    story += [
        Paragraph("5. Architecture Diagram", s["h2"]),
        Paragraph("System design: browser users, Next.js App Router/API routes, signed cookie auth, Supabase Postgres, optional OpenAI goal generation, and integration logs.", s["body"]),
        Image(str(ARCH), width=6.7 * inch, height=3.98 * inch),
    ]

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    build()
