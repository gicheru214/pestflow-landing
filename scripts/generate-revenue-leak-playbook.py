#!/usr/bin/env python3

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "client" / "public" / "pest-control-revenue-leak-playbook.pdf"

GREEN = colors.HexColor("#16A34A")
DEEP = colors.HexColor("#123B24")
INK = colors.HexColor("#142019")
MUTED = colors.HexColor("#58665D")
PALE = colors.HexColor("#EFF8F1")
LINE = colors.HexColor("#D5E6D9")
AMBER = colors.HexColor("#B45309")
RED = colors.HexColor("#B42318")
WHITE = colors.white


SECTIONS = [
    (
        "1. Recurring revenue",
        "Find the leaks that happen after the customer already said yes.",
        [
            ("Card-on-file coverage", "Can you see the percentage of active recurring customers with a valid payment method?", "A current list, an owner, and a weekly follow-up queue."),
            ("Service-to-invoice handoff", "Does every completed service create the correct invoice without someone rebuilding it?", "A completed job, invoice, and payment state that reconcile."),
            ("Failed-payment recovery", "Does a failed payment create an owned next action instead of sitting in a report?", "Retry timing, customer message, owner, and escalation date."),
            ("Skipped-service recovery", "When a recurring visit is skipped or rescheduled, is the revenue still protected?", "A visible exception queue with a replacement date."),
            ("Agreement and price control", "Can the office verify the service promise, frequency, and current price before changing anything?", "Searchable agreement history and an approval trail."),
        ],
    ),
    (
        "2. Route capacity",
        "Protect the minutes between stops, not just the minutes on the calendar.",
        [
            ("Stops per route day", "Do you know completed stops per technician by day and service type?", "A weekly trend that separates capacity from unusually short work."),
            ("Windshield time", "Can you see how many paid hours disappear into travel?", "Drive minutes beside route revenue and completed stops."),
            ("Route holes", "Does a cancellation create a recoverable opening the office can fill?", "A live opening with location, duration, and eligible customers."),
            ("Real job duration", "Are route decisions based on actual service duration or the same default block for every job?", "Duration history by pest, service, property, and technician."),
            ("Arrival-window risk", "Can dispatch spot a late or impossible stop before the customer calls?", "A visible risk signal and a proactive communication step."),
        ],
    ),
    (
        "3. Technician closeout",
        "The driveway is the cheapest place to prevent tomorrow's office cleanup.",
        [
            ("Treatment record", "Can the record answer what was used, where, how much, and for which target pest?", "Required fields that match the service performed."),
            ("Photos and findings", "Are photos and observations attached to the customer and job instead of a technician's camera roll?", "Time-stamped evidence with useful captions."),
            ("Customer recap", "Does the customer receive a plain-language summary of findings, treatment, preparation, and next steps?", "A readable recap sent before the tech leaves."),
            ("Product usage", "Can product usage be reconciled to the truck and service record?", "Product, quantity, location, technician, and job."),
            ("Completion gate", "Can a technician mark a job complete while required information is still missing?", "A conditional checklist that blocks incomplete closeout."),
        ],
    ),
    (
        "4. Estimate follow-up",
        "A quote is not a sales process until the next action has an owner.",
        [
            ("Response speed", "Can you measure how long it takes to contact a qualified lead?", "Created time, first response, and outcome."),
            ("Next-action ownership", "Does every open estimate have an owner and a dated next step?", "No open quote without an owner and follow-up date."),
            ("Useful sequence", "Does each follow-up remove a different objection or uncertainty?", "Recommendation, proof, common objection, and easy booking step."),
            ("Lost-reason learning", "Do you know why estimates are won, lost, or stalled?", "A small reason list the team can actually use."),
        ],
    ),
    (
        "5. Retention and communication",
        "Callbacks and customer questions are operating signals, not random interruptions.",
        [
            ("Re-service ownership", "Does every callback have an owner, next action, and promised customer update?", "Issue, prior service, owner, deadline, and resolution."),
            ("Cancellation save ladder", "Does the office know what to check before refunding or cancelling?", "Expectation, service history, re-service option, manager review."),
            ("Proactive arrival updates", "Is the customer told when timing changes before they need to chase the office?", "A clear window, delay notice, and reply path."),
            ("Reason-coded callbacks", "Can you group callbacks by cause instead of searching free-text notes?", "Reason tags by pest, service, technician, and expectation gap."),
        ],
    ),
    (
        "6. Owner visibility",
        "A dashboard earns its place by changing Monday's decision.",
        [
            ("Cash exceptions", "Can you see unpaid, failed, skipped, or disputed revenue in one owned queue?", "Amount, customer, reason, owner, and next date."),
            ("Route economics", "Can you compare route revenue with hours, drive time, callbacks, and discounts?", "A route-day view, not only total monthly sales."),
            ("Quality completion", "Can you see which jobs closed without required records or customer follow-up?", "A visible exception before the issue becomes a complaint."),
            ("Weekly action review", "Does each metric end with a named decision or owner?", "Five decision-ready numbers and a short action list."),
        ],
    ),
]


def styles():
    base = getSampleStyleSheet()
    return {
        "cover_kicker": ParagraphStyle("cover_kicker", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=GREEN, alignment=TA_CENTER, spaceAfter=12),
        "cover_title": ParagraphStyle("cover_title", parent=base["Title"], fontName="Helvetica-Bold", fontSize=34, leading=39, textColor=DEEP, alignment=TA_CENTER, spaceAfter=18),
        "cover_sub": ParagraphStyle("cover_sub", parent=base["Normal"], fontName="Helvetica", fontSize=15, leading=22, textColor=MUTED, alignment=TA_CENTER, spaceAfter=24),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=DEEP, spaceAfter=8),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=DEEP, spaceAfter=6),
        "intro": ParagraphStyle("intro", parent=base["Normal"], fontName="Helvetica", fontSize=11.5, leading=17, textColor=MUTED, spaceAfter=14),
        "body": ParagraphStyle("body", parent=base["Normal"], fontName="Helvetica", fontSize=10.5, leading=15, textColor=INK),
        "small": ParagraphStyle("small", parent=base["Normal"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=MUTED),
        "check_title": ParagraphStyle("check_title", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=DEEP),
        "check_body": ParagraphStyle("check_body", parent=base["Normal"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=INK),
        "score": ParagraphStyle("score", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=DEEP, alignment=TA_CENTER),
        "cta": ParagraphStyle("cta", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=14, leading=20, textColor=WHITE, alignment=TA_CENTER),
        "table_header": ParagraphStyle("table_header", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=WHITE),
    }


STYLES = styles()


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(GREEN)
    canvas.rect(0, height - 0.16 * inch, width, 0.16 * inch, stroke=0, fill=1)
    canvas.setFillColor(DEEP)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.62 * inch, 0.38 * inch, "PESTFLOW")
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - 0.62 * inch, 0.38 * inch, f"Revenue Leak Playbook  |  {doc.page}")
    canvas.restoreState()


def score_boxes():
    cells = [Paragraph("0<br/><font size='7'>Not controlled</font>", STYLES["score"]), Paragraph("1<br/><font size='7'>Inconsistent</font>", STYLES["score"]), Paragraph("2<br/><font size='7'>Controlled</font>", STYLES["score"])]
    table = Table([cells], colWidths=[0.78 * inch] * 3, rowHeights=[0.45 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return table


def check_block(index, item):
    title, question, evidence = item
    left = Paragraph(f"<b>{index}. {title}</b><br/><font size='9'>{question}</font><br/><font color='#58665D' size='8'><b>Proof:</b> {evidence}</font>", STYLES["check_body"])
    table = Table([[left, score_boxes()]], colWidths=[4.6 * inch, 2.34 * inch], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 11),
        ("RIGHTPADDING", (0, 0), (0, 0), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return KeepTogether([table, Spacer(1, 7)])


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.58 * inch,
        rightMargin=0.58 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.62 * inch,
        title="Pest Control Revenue Leak Playbook",
        author="PestFlow",
        subject="27-point owner scorecard for pest control operations",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="standard", frames=[frame], onPage=draw_page)])

    story = []
    story.extend([
        Spacer(1, 0.55 * inch),
        Paragraph("FREE OWNER SCORECARD", STYLES["cover_kicker"]),
        Paragraph("The Pest Control<br/>Revenue Leak Playbook", STYLES["cover_title"]),
        Paragraph("27 checks to find lost cash, wasted route capacity, incomplete field work, stalled estimates, and preventable churn before you buy another lead.", STYLES["cover_sub"]),
    ])
    cover_table = Table([
        [Paragraph("27", ParagraphStyle("big", parent=STYLES["cover_title"], fontSize=30, leading=32, textColor=GREEN)), Paragraph("6", ParagraphStyle("big2", parent=STYLES["cover_title"], fontSize=30, leading=32, textColor=GREEN)), Paragraph("7", ParagraphStyle("big3", parent=STYLES["cover_title"], fontSize=30, leading=32, textColor=GREEN))],
        [Paragraph("operating checks", STYLES["small"]), Paragraph("leak categories", STYLES["small"]), Paragraph("days to first fix", STYLES["small"])],
    ], colWidths=[2.18 * inch] * 3, rowHeights=[0.55 * inch, 0.35 * inch])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 1, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 1, LINE),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.extend([cover_table, Spacer(1, 0.42 * inch)])
    promise = Table([[Paragraph("This is not a generic business quiz. Every check asks for visible proof: a queue, field, owner, date, record, or decision your team can verify.", STYLES["cta"])]], colWidths=[6.55 * inch])
    promise.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), DEEP), ("BOX", (0, 0), (-1, -1), 0, DEEP), ("LEFTPADDING", (0, 0), (-1, -1), 18), ("RIGHTPADDING", (0, 0), (-1, -1), 18), ("TOPPADDING", (0, 0), (-1, -1), 15), ("BOTTOMPADDING", (0, 0), (-1, -1), 15)]))
    story.extend([promise, Spacer(1, 0.25 * inch), Paragraph("pestflow.org/playbook", ParagraphStyle("url", parent=STYLES["body"], fontName="Helvetica-Bold", fontSize=12, alignment=TA_CENTER, textColor=GREEN)), PageBreak()])

    story.extend([
        Paragraph("How to use the scorecard", STYLES["h1"]),
        Paragraph("Score each check from 0 to 2. Do not award points because the team usually remembers. Award points only when the workflow leaves evidence another person can find.", STYLES["intro"]),
    ])
    method = Table([
        [Paragraph("0 - Not controlled", STYLES["check_title"]), Paragraph("The result depends on memory, scattered messages, or heroics.", STYLES["body"])],
        [Paragraph("1 - Inconsistent", STYLES["check_title"]), Paragraph("A process exists, but it is skipped, incomplete, or hard to verify.", STYLES["body"])],
        [Paragraph("2 - Controlled", STYLES["check_title"]), Paragraph("The process creates visible evidence, an owner, and a clear next action.", STYLES["body"])],
    ], colWidths=[2.0 * inch, 4.95 * inch])
    method.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.8, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story.extend([method, Spacer(1, 18), Paragraph("Your score", STYLES["h2"])])
    totals = Table([
        [Paragraph("0-21", STYLES["score"]), Paragraph("22-39", STYLES["score"]), Paragraph("40-54", STYLES["score"])],
        [Paragraph("High leakage<br/><font size='8'>Fix ownership and evidence first.</font>", STYLES["score"]), Paragraph("Unstable growth<br/><font size='8'>Standardize the weakest handoffs.</font>", STYLES["score"]), Paragraph("Controlled system<br/><font size='8'>Improve speed, capacity, and exceptions.</font>", STYLES["score"])],
    ], colWidths=[2.31 * inch] * 3, rowHeights=[0.42 * inch, 0.65 * inch])
    totals.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), WHITE), ("BOX", (0, 0), (-1, -1), 1, LINE), ("INNERGRID", (0, 0), (-1, -1), 1, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    story.extend([totals, Spacer(1, 24), Paragraph("Write your starting score: ______ / 54", ParagraphStyle("start", parent=STYLES["h2"], fontSize=19, textColor=GREEN)), Spacer(1, 10), Paragraph("Then circle the three zeroes closest to money or customer trust. Those become the 7-day fix plan at the end of this playbook.", STYLES["intro"]), PageBreak()])

    counter = 1
    for section_index, (section_title, section_intro, items) in enumerate(SECTIONS):
        story.extend([Paragraph(section_title, STYLES["h1"]), Paragraph(section_intro, STYLES["intro"])])
        for item in items:
            story.append(check_block(counter, item))
            counter += 1
        subtotal_max = len(items) * 2
        story.extend([Spacer(1, 4), Paragraph(f"Section score: ______ / {subtotal_max}", ParagraphStyle("subtotal", parent=STYLES["h2"], fontSize=16, textColor=GREEN, alignment=TA_LEFT))])
        if section_index != len(SECTIONS) - 1:
            story.append(PageBreak())

    story.extend([
        PageBreak(),
        Paragraph("Your 7-day leak-fix plan", STYLES["h1"]),
        Paragraph("Choose three zero-score checks. Fix the smallest complete workflow first - not the biggest software project.", STYLES["intro"]),
    ])
    plan_rows = [[Paragraph("Priority", STYLES["table_header"]), Paragraph("Visible evidence to create", STYLES["table_header"]), Paragraph("Owner", STYLES["table_header"]), Paragraph("Due", STYLES["table_header"])]]
    for label in ["1", "2", "3"]:
        plan_rows.append([Paragraph(label, STYLES["score"]), Paragraph("", STYLES["body"]), Paragraph("", STYLES["body"]), Paragraph("", STYLES["body"])])
    plan = Table(plan_rows, colWidths=[0.8 * inch, 3.75 * inch, 1.4 * inch, 1.0 * inch], rowHeights=[0.45 * inch, 1.0 * inch, 1.0 * inch, 1.0 * inch])
    plan.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), DEEP), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE), ("BOX", (0, 0), (-1, -1), 1, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.8, LINE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9)]))
    story.extend([plan, Spacer(1, 22)])
    next_steps = Table([
        [Paragraph("Day 1", STYLES["check_title"]), Paragraph("Define the evidence and owner.", STYLES["body"])],
        [Paragraph("Days 2-3", STYLES["check_title"]), Paragraph("Run the workflow on one route, technician, or customer segment.", STYLES["body"])],
        [Paragraph("Days 4-5", STYLES["check_title"]), Paragraph("Review exceptions. Remove fields or steps that do not improve the decision.", STYLES["body"])],
        [Paragraph("Days 6-7", STYLES["check_title"]), Paragraph("Make the workflow visible to the whole team and assign the weekly review.", STYLES["body"])],
    ], colWidths=[1.15 * inch, 5.8 * inch])
    next_steps.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.8, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9)]))
    story.extend([next_steps, Spacer(1, 24)])
    cta = Table([[Paragraph("Want these checks connected to customers, routes, technicians, billing, communication, and owner reporting?<br/><font size='12'>See PestFlow at pestflow.org</font>", STYLES["cta"])]], colWidths=[6.95 * inch])
    cta.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), GREEN), ("LEFTPADDING", (0, 0), (-1, -1), 18), ("RIGHTPADDING", (0, 0), (-1, -1), 18), ("TOPPADDING", (0, 0), (-1, -1), 16), ("BOTTOMPADDING", (0, 0), (-1, -1), 16)]))
    story.append(cta)

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
