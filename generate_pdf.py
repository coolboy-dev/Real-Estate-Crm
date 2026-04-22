from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_docs():
    doc = SimpleDocTemplate('CRM_Documentation.pdf', pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph('Real Estate CRM: Comprehensive API & Deployment Documentation', styles['Title']))
    story.append(Spacer(1, 24))

    # Section 1: API
    story.append(Paragraph('1. API Documentation', styles['Heading1']))
    story.append(Spacer(1, 12))
    story.append(Paragraph('Base URL: <u>http://localhost:4000/api</u>', styles['Normal']))
    story.append(Spacer(1, 12))

    # Auth
    story.append(Paragraph('Authentication & Users', styles['Heading2']))
    story.append(Paragraph('• <b>POST /auth/register</b>: Create a new account.', styles['Normal']))
    story.append(Paragraph('• <b>POST /auth/login</b>: Obtain a JWT token.', styles['Normal']))
    story.append(Paragraph('• <b>GET /users</b>: (Admin) List all system users.', styles['Normal']))
    story.append(Paragraph('• <b>PATCH /users/:id/role</b>: (Admin) Update user permissions.', styles['Normal']))
    story.append(Spacer(1, 12))

    # Leads
    story.append(Paragraph('Acquisitions (Leads)', styles['Heading2']))
    story.append(Paragraph('• <b>GET /leads</b>: Retrieve leads (Admins see all; Agents see assigned).', styles['Normal']))
    story.append(Paragraph('• <b>POST /leads</b>: Register a new prospect.', styles['Normal']))
    story.append(Paragraph('• <b>POST /leads/webhook</b>: Public endpoint for web forms.', styles['Normal']))
    story.append(Paragraph('• <b>PATCH /leads/:id/status</b>: Transition lead status.', styles['Normal']))
    story.append(Paragraph('• <b>PATCH /leads/:id/assign</b>: (Admin/Manager) Assign lead to agent.', styles['Normal']))
    story.append(Spacer(1, 12))

    # Properties
    story.append(Paragraph('Property Portfolio', styles['Heading2']))
    story.append(Paragraph('• <b>GET /properties</b>: List curated property listings.', styles['Normal']))
    story.append(Paragraph('• <b>POST /properties</b>: Add a new asset to the portfolio.', styles['Normal']))
    story.append(Paragraph('• <b>POST /properties/:id/images</b>: Upload asset imagery.', styles['Normal']))
    story.append(Spacer(1, 12))

    # Clients
    story.append(Paragraph('Client Management', styles['Heading2']))
    story.append(Paragraph('• <b>GET /clients</b>: List all buyer/seller profiles.', styles['Normal']))
    story.append(Paragraph('• <b>POST /clients</b>: Create a new client profile.', styles['Normal']))
    story.append(Paragraph('• <b>GET /clients/:id</b>: Retrieve specific client details.', styles['Normal']))
    story.append(Paragraph('• <b>PUT /clients/:id</b>: Update client information.', styles['Normal']))
    story.append(Spacer(1, 12))

    story.append(PageBreak())

    # Deals
    story.append(Paragraph('Pipelines (Deals)', styles['Heading2']))
    story.append(Paragraph('• <b>GET /deals</b>: List active transaction pipelines.', styles['Normal']))
    story.append(Paragraph('• <b>POST /deals</b>: Initiate a new transaction.', styles['Normal']))
    story.append(Paragraph('• <b>PATCH /deals/:id/stage</b>: Move deal through Kanban stages (Negotiation, Agreement, Closed).', styles['Normal']))
    story.append(Paragraph('• <b>GET /deals/:id/commission</b>: Calculate agent commission for the deal.', styles['Normal']))
    story.append(Spacer(1, 12))

    # Activities & Follow-ups
    story.append(Paragraph('Activities & Follow-ups', styles['Heading2']))
    story.append(Paragraph('• <b>GET /activities</b>: Retrieve interaction history log.', styles['Normal']))
    story.append(Paragraph('• <b>POST /activities</b>: Log a new interaction (Call, Meeting, Email).', styles['Normal']))
    story.append(Paragraph('• <b>POST /followups</b>: Schedule a future follow-up task.', styles['Normal']))
    story.append(Paragraph('• <b>PATCH /followups/:id/done</b>: Mark a follow-up task as completed.', styles['Normal']))
    story.append(Spacer(1, 12))

    # Reports
    story.append(Paragraph('Intelligence & Analytics', styles['Heading2']))
    story.append(Paragraph('• <b>GET /reports/overview</b>: High-level KPI summary.', styles['Normal']))
    story.append(Paragraph('• <b>GET /reports/monthly</b>: Monthly revenue and deal volume trajectories.', styles['Normal']))
    story.append(Paragraph('• <b>GET /reports/agents</b>: (Admin) Comparative agent performance metrics.', styles['Normal']))
    story.append(Paragraph('• <b>GET /reports/export</b>: Download comprehensive Excel performance dossier.', styles['Normal']))

    story.append(PageBreak())

    # Section 2: Roles
    story.append(Paragraph('2. Admin vs Agent Visibility', styles['Heading1']))
    story.append(Spacer(1, 12))
    story.append(Paragraph('The system utilizes granular role-based access control (RBAC) to manage data visibility:', styles['Normal']))
    story.append(Spacer(1, 8))
    
    role_data = [
        ['Feature', 'Admin / Manager View', 'Agent View'],
        ['Acquisitions', 'Full visibility of all system leads.', 'Visibility limited to assigned leads.'],
        ['Pipelines', 'Oversight of all active deals.', 'Management of personal deals only.'],
        ['Intelligence', 'Global fiscal and performance reports.', 'Personal commission and unit targets.'],
        ['Users', 'Full user and role management.', 'No access to user management.'],
    ]
    t = Table(role_data, colWidths=[100, 200, 200])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.brandgold if hasattr(colors, 'brandgold') else colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Section 3: Deployment
    story.append(Paragraph('3. Deployment & CI/CD', styles['Heading1']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('Infrastructure Orchestration', styles['Heading2']))
    story.append(Paragraph('<b>1. Environment Setup:</b> Configure <i>server/.env</i> with DATABASE_URL, JWT_SECRET, and SMTP/Twilio credentials.', styles['Normal']))
    story.append(Paragraph('<b>2. Launch:</b> Run <code>docker compose up -d --build</code> to instantiate the stack.', styles['Normal']))
    story.append(Paragraph('<b>3. Routing:</b> Nginx handles production React routing via <i>try_files</i> redirection to index.html.', styles['Normal']))
    story.append(Spacer(1, 12))

    story.append(Paragraph('Security & Persistence', styles['Heading2']))
    story.append(Paragraph('• <b>Data Persistence:</b> PostgreSQL data is stored in the <i>pgdata</i> Docker volume.', styles['Normal']))
    story.append(Paragraph('• <b>Encryption:</b> Passwords are salted and hashed via BCrypt. JWT tokens secure sessions.', styles['Normal']))
    story.append(Paragraph('• <b>CI/CD:</b> A GitHub Actions pipeline is configured for automated testing and build verification.', styles['Normal']))

    story.append(Spacer(1, 24))
    story.append(Paragraph('Architectural Grade Systems © 2026', styles['Normal']))

    doc.build(story)

if __name__ == '__main__':
    generate_docs()
