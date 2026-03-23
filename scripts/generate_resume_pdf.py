from pathlib import Path

OUTPUT_PDF = Path("bhargav-tsapparapu-resume.pdf")
PAGE_W, PAGE_H = 595, 842  # A4 points
MARGIN = 36
FONT_SIZE = 10
LEADING = 14
SECTION_GAP = 8

resume = {
    "name": "Bhargav Tsapparapu",
    "title": "Technical Product Owner",
    "subtitle": "Full-stack TPO with deep expertise in Angular and Java, bridging product vision, sprint delivery, and engineering execution for enterprise-scale applications.",
    "contact": [
        "Email: bhargavt17@gmail.com",
        "Phone: +91 9666366681",
        "Location: Hyderabad, India",
        "LinkedIn: bhargav-tsapparapu",
    ],
    "profile": "Technical Product Owner with 7+ years of end-to-end experience spanning product strategy, agile delivery, and hands-on full-stack engineering. Specialized in Angular, Java, and Spring Boot, with AWS Certified Developer and AWS Solutions Architect credentials. Led AI-integrated product builds using GPT-4 and Vertex AI while owning product roadmaps, maintaining sprint health, and translating complex business requirements into shipped features.",
    "experience": [
        ("Technical Product Owner & Team Lead | HashedIN by Deloitte | Dec 2021 – Present", [
            "Owned the product roadmap and sprint delivery for a Fortune-500 US retailer tax platform, coordinating release planning across 8+ engineers.",
            "Defined backlog structure with user stories, epics, and acceptance criteria aligned to business goals and technical feasibility.",
            "Spearheaded LLM-powered features using GPT-4 and Vertex AI in the media domain with measurable user-outcome goals.",
            "Architected a micro-frontend platform with JSON-driven forms and Azure SSO for modular enterprise delivery.",
            "Led agile ceremonies, mentoring, and architecture reviews to improve predictable, on-time delivery.",
        ]),
        ("Full Stack Developer — Associate | Cognizant | Sep 2019 – Nov 2021", [
            "Developed Angular 12 UI modules integrated with Spring Boot REST APIs, Bootstrap, and UXC Angular libraries.",
            "Worked with business analysts and tech leads on UX design, achieving stakeholder approval on the first review cycle.",
            "Coordinated with governance teams for compliance review and formal screen approvals.",
        ]),
        ("Backend Developer | Gamenous | May 2019 – Jul 2019", [
            "Built Node.js backend services, integrated third-party APIs, and supported real-time analytics dashboards for user behavior tracking.",
        ]),
    ],
    "projects": [
        "Tax Automation Platform — US Retail | 2021 – Present | Sole TPO managing roadmap, backlog, and the end-to-end delivery cycle for a Fortune-500 retailer tax workflow platform.",
        "LLM Content Pipeline — Media Domain | 2023 – Present | Led product strategy and engineering for a GPT-4 and Vertex AI powered content generation and recommendation system.",
        "Bank Onboarding Portal | 2020 – 2021 | Designed and built a multi-role onboarding platform using Angular and Spring Boot with role-based access controls.",
    ],
    "certifications": [
        "AWS Certified Developer — Associate · Amazon Web Services",
        "AWS Solutions Architect — Associate · Amazon Web Services",
    ],
    "skills": [
        "Product & Agile: Product Ownership, Roadmap Planning, Sprint Delivery, User Stories, Scrum / SAFe, Stakeholder Management",
        "Frontend: Angular, TypeScript, JavaScript, HTML5 / CSS3, Micro-frontend",
        "Backend & Cloud: Java, Spring Boot, REST APIs, AWS, Azure, Docker, Node.js",
        "AI & Tools: GPT-4 API, Vertex AI, NLP, Git, Jira, CI/CD",
    ],
    "education": ["B.Tech — Computer Science | KL University | 2015 – 2019"],
    "achievements": [
        "Excellence Award × 3 — HashedIN by Deloitte (2022, 2023, 2024)",
        "Co-Founder · ForschenAI — AR apps for construction (2018)",
        "Microsoft Student Partner — KL University (2017 – 2020)",
        "Published — Springer Journal, Image Optimization Mechanism (2017)",
        "Chief Web Developer — National Fest Samyak, KL University (2018)",
    ],
    "interests": ["Cricket", "Food Blogging", "Virtual Reality", "Gaming"],
}


def escape_pdf_text(text: str) -> str:
    return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def wrap_text(text: str, max_chars: int):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if len(test) <= max_chars:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


left_x = MARGIN
right_x = 392
left_width_chars = 74
right_width_chars = 30

def add_line(lines, x, y, text, font="F1", size=FONT_SIZE):
    lines.append(f"BT /{font} {size} Tf 1 0 0 1 {x} {y} Tm ({escape_pdf_text(text)}) Tj ET")

pdf_lines = []
y = PAGE_H - MARGIN

# Header background strip approximation with text only.
add_line(pdf_lines, left_x, y, resume["title"].upper(), "F2", 10)
y -= 18
add_line(pdf_lines, left_x, y, resume["name"], "F3", 24)
y -= 20
for line in wrap_text(resume["subtitle"], 88):
    add_line(pdf_lines, left_x, y, line, "F1", 10)
    y -= LEADING
for item in resume["contact"]:
    add_line(pdf_lines, left_x, y, item, "F1", 10)
    y -= 12
add_line(pdf_lines, right_x, PAGE_H - MARGIN - 10, "7+ YEARS OF EXPERIENCE", "F2", 10)
add_line(pdf_lines, right_x, PAGE_H - MARGIN - 28, "Core Stack", "F2", 10)
for i, line in enumerate(wrap_text("Angular, Java, Spring Boot, AWS, Azure, Docker", right_width_chars)):
    add_line(pdf_lines, right_x, PAGE_H - MARGIN - 42 - i * 12, line, "F1", 10)
add_line(pdf_lines, right_x, PAGE_H - MARGIN - 78, "Open to TPO roles", "F1", 10)
add_line(pdf_lines, right_x, PAGE_H - MARGIN - 90, "Hyderabad / Remote / Bengaluru", "F1", 10)

y -= 8

sections_left = [
    ("PROFILE", [resume["profile"]]),
    ("EXPERIENCE", []),
]

add_line(pdf_lines, left_x, y, "PROFILE", "F2", 11)
y -= 16
for line in wrap_text(resume["profile"], left_width_chars):
    add_line(pdf_lines, left_x, y, line, "F1", 10)
    y -= LEADING

y -= SECTION_GAP
add_line(pdf_lines, left_x, y, "EXPERIENCE", "F2", 11)
y -= 16
for title, bullets in resume["experience"]:
    for line in wrap_text(title, left_width_chars):
        add_line(pdf_lines, left_x, y, line, "F2", 10)
        y -= 12
    for bullet in bullets:
        wrapped = wrap_text(f"• {bullet}", left_width_chars)
        for line in wrapped:
            add_line(pdf_lines, left_x + 8, y, line, "F1", 10)
            y -= 12
    y -= 6

y -= 2
add_line(pdf_lines, left_x, y, "KEY PROJECTS", "F2", 11)
y -= 16
for project in resume["projects"]:
    for line in wrap_text(f"• {project}", left_width_chars):
        add_line(pdf_lines, left_x + 8, y, line, "F1", 10)
        y -= 12
    y -= 4

ry = PAGE_H - 180
for heading, items in [
    ("CERTIFICATIONS", resume["certifications"]),
    ("SKILLS", resume["skills"]),
    ("EDUCATION", resume["education"]),
    ("ACHIEVEMENTS", resume["achievements"]),
    ("INTERESTS", [", ".join(resume["interests"])]),
]:
    add_line(pdf_lines, right_x, ry, heading, "F2", 11)
    ry -= 16
    for item in items:
        for line in wrap_text(item, right_width_chars):
            add_line(pdf_lines, right_x, ry, line, "F1", 9)
            ry -= 11
        ry -= 4
    ry -= 4

stream = "\n".join(pdf_lines).encode("latin-1", "replace")
objects = []

def add_object(data: bytes):
    objects.append(data)

add_object(b"<< /Type /Catalog /Pages 2 0 R >>")
add_object(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
add_object(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>".encode())
add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
add_object(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")

pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for i, obj in enumerate(objects, start=1):
    offsets.append(len(pdf))
    pdf.extend(f"{i} 0 obj\n".encode())
    pdf.extend(obj)
    pdf.extend(b"\nendobj\n")

xref_start = len(pdf)
pdf.extend(f"xref\n0 {len(objects)+1}\n".encode())
pdf.extend(b"0000000000 65535 f \n")
for off in offsets[1:]:
    pdf.extend(f"{off:010d} 00000 n \n".encode())
pdf.extend(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode())

OUTPUT_PDF.write_bytes(pdf)
print(f"Generated {OUTPUT_PDF}")
