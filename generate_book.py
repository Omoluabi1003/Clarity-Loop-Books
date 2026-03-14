from datetime import date
from fpdf import FPDF

TITLE = "Clarity Loop: A Practical Guide to Thinking, Building, and Improving"
AUTHOR = "Paul A.K. Iyogun"
OUTPUT_FILE = "clarity_loop.pdf"
TOTAL_CONTENT_PAGES = 160

CHAPTERS = [
    {
        "title": "The Clarity Loop Operating Model",
        "concept": "Define Observe-Structure-Automate-Measure-Refine-Institutionalize as a repeatable control loop for enterprise delivery.",
        "gis_example": "A county GIS office starts by documenting parcel edit requests, current map update latency, and handoff failures between survey and GIS teams.",
        "automation_use_case": "An intake bot classifies incoming work orders by source system and routes each request to a structured queue with SLA targets.",
        "implementation_steps": [
            "Map all current actors, systems, and decision points in the end-to-end GIS service lifecycle.",
            "Define one measurable signal per loop phase: capture rate, schema compliance, automation coverage, QA pass rate, correction cycle time, policy adoption.",
            "Create a 30-day pilot where every project uses the same loop checkpoints and review cadence.",
        ],
        "failure_points": [
            "Teams skip observation and automate unstable processes.",
            "No ownership is assigned for cross-functional data quality decisions.",
            "Loop metrics are reported but not tied to governance actions.",
        ],
        "improvement_loop": "Weekly loop review with GIS operations, data engineering, and PMO; promote proven controls into standard operating procedures.",
        "reflection_prompts": [
            "Which phase currently drives the most production incidents?",
            "What evidence is missing to move from opinion to operational decision?",
        ],
    },
    {
        "title": "Observability for GIS and IT Workflows",
        "concept": "Observation starts with instrumentation: capture where data enters, transforms, fails, and exits across spatial and enterprise systems.",
        "gis_example": "Document scan stations log resolution, operator, source department, and scan timestamp to create a traceable ingestion chain.",
        "automation_use_case": "A telemetry pipeline collects ETL runtime, geoprocessing errors, and API latency into a shared dashboard.",
        "implementation_steps": [
            "Instrument document ingestion, georeferencing, vectorization, and publishing stages with structured logs.",
            "Tag each record with lineage metadata: source file, processing script version, operator, and QC status.",
            "Publish operational dashboards for throughput, backlog, and failure classes by department.",
        ],
        "failure_points": [
            "Audit trails are stored in unsearchable logs.",
            "Data lineage stops at departmental boundaries.",
            "Critical exceptions are manually discovered days later.",
        ],
        "improvement_loop": "Use incident postmortems to add missing signals and alerts for recurring spatial data failures.",
        "reflection_prompts": [
            "Where does your pipeline become opaque after handoff?",
            "Which metric would prevent repeated map publication outages?",
        ],
    },
    {
        "title": "Structuring Spatial Data for Reliability",
        "concept": "Structure converts raw inputs into governed data models with enforceable rules for geometry, attributes, and metadata.",
        "gis_example": "Scanned plats are georeferenced, indexed by township-range-section, and stored in a geodatabase with versioned edit rules.",
        "automation_use_case": "Schema validation scripts reject uploads that violate coordinate system policy or mandatory field constraints.",
        "implementation_steps": [
            "Define canonical feature schemas for parcels, right-of-way, address points, and utility assets.",
            "Standardize coordinate reference systems and transformation methods across all producers.",
            "Implement topology rules and domain constraints before automation consumes the data.",
        ],
        "failure_points": [
            "Inconsistent EPSG usage shifts geometry and corrupts overlays.",
            "Manual attribute naming creates duplicate semantic fields.",
            "Topology validation is deferred until after publication.",
        ],
        "improvement_loop": "Track schema exception trends and revise templates, training, and ingestion rules each sprint.",
        "reflection_prompts": [
            "Which spatial entities lack a canonical data contract?",
            "Where are topology failures repeatedly introduced?",
        ],
    },
    {
        "title": "Document Digitization to Spatial Records",
        "concept": "Digitization is not just scanning; it is a controlled conversion from analog evidence to queryable, geospatially indexed assets.",
        "gis_example": "Paper easement packets are scanned, OCR processed, georeferenced, and linked to parcel IDs in enterprise GIS.",
        "automation_use_case": "Computer vision extracts document type and key metadata fields, then routes records for human verification.",
        "implementation_steps": [
            "Define scanning standards: DPI, color depth, file naming, retention class, and checksum policy.",
            "Apply OCR and metadata tagging with confidence thresholds and exception queues.",
            "Link validated records to geospatial keys (parcel ID, address ID, permit ID).",
        ],
        "failure_points": [
            "Low-quality scans reduce OCR accuracy and downstream automation quality.",
            "Metadata taxonomies differ across departments.",
            "No mechanism exists to reconcile document and GIS identifiers.",
        ],
        "improvement_loop": "Sample low-confidence OCR batches weekly; retrain classifiers and update scanning SOPs.",
        "reflection_prompts": [
            "What percentage of scanned records are spatially joinable?",
            "Which metadata field causes the most routing errors?",
        ],
    },
    {
        "title": "Address Data Engineering and Standardization",
        "concept": "Address systems require master data governance, parsing standards, and spatial validation to support emergency, utility, and planning operations.",
        "gis_example": "A city consolidates legacy address points into a single authoritative dataset aligned with road centerlines and jurisdiction boundaries.",
        "automation_use_case": "A rules engine flags duplicate address numbers, invalid suffixes, and off-centerline placement anomalies.",
        "implementation_steps": [
            "Adopt a standard address model with components, aliases, lifecycle status, and authoritative source fields.",
            "Implement geocoding and reverse-geocoding validation against approved road and parcel datasets.",
            "Publish API endpoints for downstream systems to consume validated address IDs.",
        ],
        "failure_points": [
            "Parallel datasets exist in permitting, billing, and 911 systems.",
            "Address edits bypass QA and break geocoding confidence.",
            "No stewardship model exists for disputed records.",
        ],
        "improvement_loop": "Monthly cross-agency reconciliation of unmatched addresses with tracked remediation ownership.",
        "reflection_prompts": [
            "Where do address conflicts originate most often?",
            "How fast can your team resolve critical dispatch address discrepancies?",
        ],
    },
    {
        "title": "Spatial ETL and Integration Architecture",
        "concept": "Enterprise GIS depends on repeatable ETL pipelines that enforce contracts between source systems, transformation logic, and analytic outputs.",
        "gis_example": "Nightly jobs ingest assessor updates, transform geometry, and sync parcel layers to ArcGIS Enterprise and data warehouse marts.",
        "automation_use_case": "Orchestrated pipelines run validation, transformation, enrichment, and publish steps with rollback on failure.",
        "implementation_steps": [
            "Model ETL stages with explicit inputs, outputs, and quality gates.",
            "Version transformation code and maintain reproducible environments.",
            "Implement retry, dead-letter, and replay controls for failed jobs.",
        ],
        "failure_points": [
            "Business logic is hidden in ad hoc desktop scripts.",
            "Schema drift in source systems silently breaks joins.",
            "Pipelines lack idempotency and create duplicate records.",
        ],
        "improvement_loop": "Use pipeline metrics to prioritize refactoring and contract updates with source system owners.",
        "reflection_prompts": [
            "Which pipeline stage has the highest mean time to recovery?",
            "How quickly can you replay a failed spatial load without data loss?",
        ],
    },
    {
        "title": "ArcGIS Enterprise and Platform Design",
        "concept": "Platform clarity means designing ArcGIS Enterprise as a service architecture with role separation, scaling rules, and operational controls.",
        "gis_example": "An organization separates hosting servers, image servers, and geodatabases across environments with controlled promotion paths.",
        "automation_use_case": "Infrastructure-as-code provisions ArcGIS tiers, security policies, and scheduled service health checks.",
        "implementation_steps": [
            "Define environment topology for dev, test, and production with network and identity boundaries.",
            "Implement service publishing standards, naming conventions, and dependency maps.",
            "Automate backup, restore testing, and patch cadence execution.",
        ],
        "failure_points": [
            "Single-server deployments carry production and development workloads together.",
            "Service dependencies are undocumented, causing cascading outages.",
            "Patching is reactive and untested.",
        ],
        "improvement_loop": "Quarterly platform architecture reviews tied to capacity, uptime, and incident trend data.",
        "reflection_prompts": [
            "Which ArcGIS services are mission critical but under-monitored?",
            "Can your team execute a validated restore within target RTO/RPO?",
        ],
    },
    {
        "title": "Automation Engineering for GIS Operations",
        "concept": "Automation should remove repetitive work while preserving control, traceability, and exception management.",
        "gis_example": "Python and ArcPy workflows automate map tile cache refresh, topology checks, and feature service publishing.",
        "automation_use_case": "Event-driven automation triggers validation scripts when new data arrives in object storage.",
        "implementation_steps": [
            "Catalogue repetitive GIS tasks and rank by volume, error rate, and business impact.",
            "Convert high-value tasks into parameterized scripts with logging and test harnesses.",
            "Define exception workflows where humans review only ambiguous or high-risk outputs.",
        ],
        "failure_points": [
            "Scripts run without version control or deployment standards.",
            "No alerting exists for partial automation failures.",
            "Automations assume perfect data and crash on edge cases.",
        ],
        "improvement_loop": "Track manual override frequency to improve script robustness and decision rules.",
        "reflection_prompts": [
            "Which manual GIS task is most expensive to keep manual?",
            "How do you know when automation degraded instead of improved quality?",
        ],
    },
    {
        "title": "AI-Ready Data and Labeling Strategy",
        "concept": "AI outcomes depend on clean, representative, and governance-compliant training data with explicit labeling protocols.",
        "gis_example": "Historical permit documents and orthophotos are labeled to train models that detect probable land-use change.",
        "automation_use_case": "A labeling platform assigns review tasks, computes inter-annotator agreement, and tracks model drift signals.",
        "implementation_steps": [
            "Define target prediction tasks and required labels for each geospatial asset type.",
            "Build quality controls for annotation consistency, bias checks, and class balance.",
            "Store training sets with lineage to source datasets and preprocessing pipelines.",
        ],
        "failure_points": [
            "Labels are derived from outdated or inconsistent policies.",
            "Training data excludes rare but operationally critical events.",
            "Model decisions cannot be traced to data versions.",
        ],
        "improvement_loop": "Continuously back-test predictions against verified field outcomes and update labels.",
        "reflection_prompts": [
            "Which classes are underrepresented in your training corpus?",
            "How often do model errors map to labeling ambiguity rather than algorithm choice?",
        ],
    },
    {
        "title": "Geospatial AI and Anomaly Detection",
        "concept": "Geospatial AI is most effective when model outputs are integrated into operational decision workflows with confidence-aware routing.",
        "gis_example": "A utility detects meter location anomalies by comparing predicted service points with network topology constraints.",
        "automation_use_case": "Models score incoming features for geometry anomalies and trigger targeted QA review tasks.",
        "implementation_steps": [
            "Define anomaly taxonomy: geometric, semantic, temporal, and cross-system inconsistencies.",
            "Establish model thresholds tied to action types: auto-accept, human review, reject.",
            "Deploy monitoring for precision, recall, and false-positive operational cost.",
        ],
        "failure_points": [
            "Model confidence is ignored, causing over-automation.",
            "Operations teams receive alerts without remediation context.",
            "Feedback from resolved anomalies is not reintegrated.",
        ],
        "improvement_loop": "Close the loop by pushing reviewed anomalies into retraining and rule tuning.",
        "reflection_prompts": [
            "What is the operational cost of your current false positives?",
            "Which anomalies should remain rule-based rather than model-driven?",
        ],
    },
    {
        "title": "Measurement, SLAs, and Operational Intelligence",
        "concept": "Measurement translates clarity into measurable reliability, throughput, and decision quality outcomes.",
        "gis_example": "A GIS PMO tracks map update SLA adherence, feature-level defect rates, and geocoding confidence trends.",
        "automation_use_case": "A KPI pipeline merges service logs, QA results, and business impact metrics into executive dashboards.",
        "implementation_steps": [
            "Define service-level objectives for data freshness, accuracy, and availability.",
            "Map technical indicators to business outcomes such as permit cycle time or dispatch accuracy.",
            "Create escalation policies when thresholds are breached.",
        ],
        "failure_points": [
            "Metrics focus on activity volume instead of decision quality.",
            "Dashboards are static and disconnected from corrective workflows.",
            "No common metric definitions exist across teams.",
        ],
        "improvement_loop": "Run monthly metric calibration sessions to retire vanity metrics and add actionable ones.",
        "reflection_prompts": [
            "Which KPI currently drives the wrong behavior?",
            "Do your SLAs reflect user impact or only internal convenience?",
        ],
    },
    {
        "title": "Data Governance and Metadata Standards",
        "concept": "Governance institutionalizes clarity through ownership, policy, metadata standards, and audit-ready controls.",
        "gis_example": "Every authoritative layer carries metadata for lineage, steward, update cadence, and usage restrictions.",
        "automation_use_case": "Policy engines block publication when metadata completeness or classification tags are missing.",
        "implementation_steps": [
            "Define stewardship roles, approval workflows, and policy exceptions.",
            "Adopt metadata standards aligned to enterprise catalog requirements.",
            "Schedule compliance checks for sensitive and high-impact datasets.",
        ],
        "failure_points": [
            "Ownership is unclear for cross-department datasets.",
            "Metadata is optional and quickly becomes stale.",
            "Governance reviews occur only during audits.",
        ],
        "improvement_loop": "Integrate governance checks into CI/CD and publishing pipelines rather than periodic manual audits.",
        "reflection_prompts": [
            "Who can approve a schema change to an enterprise layer?",
            "Which datasets lack metadata required for risk assessment?",
        ],
    },
    {
        "title": "QA/QC Validation Pipelines",
        "concept": "Quality must be engineered as a pipeline with automated tests, manual review protocols, and defect analytics.",
        "gis_example": "Before publication, parcel edits undergo geometry validity checks, topology enforcement, and attribute completeness scoring.",
        "automation_use_case": "A QA service runs rule suites and opens issue tickets when datasets violate thresholds.",
        "implementation_steps": [
            "Build automated checks for geometry, topology, attribution, temporal consistency, and referential integrity.",
            "Define severity levels and release gates tied to defect classes.",
            "Capture defect root causes and feed them into training and process updates.",
        ],
        "failure_points": [
            "QA scripts are inconsistent across environments.",
            "Defects are fixed in place without root-cause tracking.",
            "Release deadlines override quality gates.",
        ],
        "improvement_loop": "Trend defect patterns by source and team to target preventive controls.",
        "reflection_prompts": [
            "Which defect class recurs despite repeated fixes?",
            "How often are release gates bypassed and why?",
        ],
    },
    {
        "title": "Change Management and Release Engineering",
        "concept": "Controlled change prevents instability by aligning technical releases with governance, communication, and rollback readiness.",
        "gis_example": "Schema updates for zoning layers are promoted through dev/test/prod with stakeholder sign-off and rollback scripts.",
        "automation_use_case": "Release pipelines execute migration tests, service smoke tests, and post-deploy validation automatically.",
        "implementation_steps": [
            "Use change advisory workflows with impact classification and dependency mapping.",
            "Package schema, service, and automation changes as versioned release bundles.",
            "Practice rollback and contingency playbooks in non-production environments.",
        ],
        "failure_points": [
            "Emergency fixes bypass documentation and approvals.",
            "Rollback scripts are untested.",
            "Users are not informed of downstream workflow impacts.",
        ],
        "improvement_loop": "Review change failure rate and improve pre-release validation depth.",
        "reflection_prompts": [
            "Which change category has the highest disruption risk?",
            "Do release plans include business continuity communication?",
        ],
    },
    {
        "title": "Security, Risk, and Compliance in Spatial Systems",
        "concept": "Security clarity requires data classification, access controls, monitoring, and incident response tailored to spatial assets.",
        "gis_example": "Critical infrastructure layers are segmented, encrypted, and access-logged with role-based permissions.",
        "automation_use_case": "Automated policy checks verify least-privilege roles and detect anomalous download behavior.",
        "implementation_steps": [
            "Classify spatial datasets by sensitivity and regulatory impact.",
            "Implement identity federation, RBAC, and service account governance.",
            "Run continuous security monitoring with incident triage procedures.",
        ],
        "failure_points": [
            "Legacy shared accounts hide accountability.",
            "Sensitive data is replicated into unsecured analysis workspaces.",
            "Security logs are not reviewed against operational context.",
        ],
        "improvement_loop": "Conduct joint security and GIS operations drills to test detection and response readiness.",
        "reflection_prompts": [
            "Which spatial datasets create the highest compliance exposure?",
            "How quickly can you revoke access and audit data exfiltration paths?",
        ],
    },
    {
        "title": "Decision Intelligence and Spatial Analytics",
        "concept": "Decision systems should combine governed data, analytics, and explainable models to support policy, operations, and investment planning.",
        "gis_example": "A municipality prioritizes road maintenance using pavement condition, traffic volume, utility conflicts, and equity indicators.",
        "automation_use_case": "Scenario engines run spatial forecasts and produce ranked intervention plans with uncertainty ranges.",
        "implementation_steps": [
            "Define decision questions, stakeholders, and acceptable confidence levels.",
            "Integrate spatial analytics outputs into dashboards with drill-down evidence.",
            "Capture final decisions and compare outcomes to model recommendations.",
        ],
        "failure_points": [
            "Analytics outputs are delivered without operational context.",
            "Model assumptions are undocumented.",
            "Decision outcomes are not fed back into model evaluation.",
        ],
        "improvement_loop": "Use after-action reviews to recalibrate analytic models and policy thresholds.",
        "reflection_prompts": [
            "Which decisions still rely on anecdotal evidence despite available data?",
            "How do you communicate model uncertainty to executives?",
        ],
    },
    {
        "title": "Level-Based System Evolution Roadmap",
        "concept": "A maturity roadmap converts isolated initiatives into staged capability growth from manual workflows to enterprise intelligence.",
        "gis_example": "The organization progresses from scanning paper maps to integrated geospatial decision systems used by planning, public works, and emergency response.",
        "automation_use_case": "A maturity tracker scores each business unit across process standardization, automation coverage, and AI readiness.",
        "implementation_steps": [
            "Assess current state against six levels: manual scanning, metadata digitization, GIS integration, ETL automation, AI-assisted QA, enterprise intelligence.",
            "Define target capabilities, dependencies, and investment sequence for each level.",
            "Publish a roadmap with quarterly milestones and accountable owners.",
        ],
        "failure_points": [
            "Teams invest in AI before stabilizing data foundations.",
            "Maturity claims are made without measurable criteria.",
            "Roadmaps ignore integration dependencies.",
        ],
        "improvement_loop": "Re-baseline maturity scores each quarter and reprioritize initiatives using delivery evidence.",
        "reflection_prompts": [
            "Which maturity level is constrained by governance gaps?",
            "What capability unlocks the largest cross-department value next?",
        ],
    },
    {
        "title": "Institutionalizing Clarity in Teams and Culture",
        "concept": "Institutionalization embeds standards, training, and decision rights so clarity survives staffing changes and scaling pressures.",
        "gis_example": "GIS, IT, and data teams adopt shared runbooks, architecture review boards, and onboarding pathways.",
        "automation_use_case": "Knowledge systems auto-publish updated SOPs, architecture diagrams, and decision logs from release metadata.",
        "implementation_steps": [
            "Create standard documentation templates for architecture, operations, and governance decisions.",
            "Establish recurring architecture and service review rituals with cross-functional participation.",
            "Tie performance objectives to system reliability, data quality, and governance compliance outcomes.",
        ],
        "failure_points": [
            "Knowledge remains trapped with individual experts.",
            "Standards are written once and never operationalized.",
            "Training omits real production incident patterns.",
        ],
        "improvement_loop": "Measure SOP adoption and incident response consistency to update training and standards.",
        "reflection_prompts": [
            "Which critical workflow depends on undocumented tribal knowledge?",
            "How is adherence to standards currently verified?",
        ],
    },
    {
        "title": "Enterprise Playbooks for CIO and GIS Leadership",
        "concept": "Leadership clarity aligns funding, architecture, and operational accountability around measurable service outcomes.",
        "gis_example": "A CIO office sponsors a GIS modernization portfolio with shared services, governance councils, and KPI-driven reporting.",
        "automation_use_case": "Portfolio analytics monitor delivery risk, platform debt, and automation ROI across programs.",
        "implementation_steps": [
            "Define an enterprise operating model linking GIS services to strategic business capabilities.",
            "Implement investment governance using value, risk, and readiness criteria.",
            "Require each initiative to report reliability, quality, and adoption metrics.",
        ],
        "failure_points": [
            "Projects are funded without architecture alignment.",
            "Value tracking stops at go-live.",
            "Executive dashboards hide technical risk accumulation.",
        ],
        "improvement_loop": "Use portfolio retrospectives to redirect funding toward proven delivery patterns.",
        "reflection_prompts": [
            "Are modernization investments reducing operational fragility?",
            "Which governance decision would most improve delivery speed and quality?",
        ],
    },
    {
        "title": "Field Guide: Applying the Clarity Loop End-to-End",
        "concept": "The final field guide demonstrates how to run the loop continuously from discovery through operations and institutional governance.",
        "gis_example": "A regional authority executes a full transformation: scanned legacy records become governed geospatial assets powering predictive maintenance decisions.",
        "automation_use_case": "Unified orchestration coordinates ingestion, validation, AI scoring, dashboarding, and governance reporting in one operating rhythm.",
        "implementation_steps": [
            "Launch a pilot domain with clear scope, success metrics, and executive sponsorship.",
            "Scale by replicating proven patterns across datasets and departments.",
            "Institutionalize with policy, training, architecture standards, and audited controls.",
        ],
        "failure_points": [
            "Pilots never transition to enterprise operations.",
            "Scaling occurs without standard interfaces.",
            "Governance lags behind automation expansion.",
        ],
        "improvement_loop": "Operate a standing clarity council that reviews metrics, incidents, and roadmap priorities monthly.",
        "reflection_prompts": [
            "What would break if volume doubled next quarter?",
            "Which control should be standardized immediately across all teams?",
        ],
    },
]

CLARITY_LOOP_PHASES = [
    "Observe",
    "Structure",
    "Automate",
    "Measure",
    "Refine",
    "Institutionalize",
]

SYSTEM_DOMAINS = [
    "GIS data pipelines",
    "AI automation systems",
    "Enterprise IT infrastructure",
    "Spatial analytics platforms",
    "Digital governance workflows",
]

EVOLUTION_LEVELS = [
    "Level 1 - Manual scanning of documents",
    "Level 2 - Digitization workflow with metadata tagging",
    "Level 3 - Spatial indexing and GIS integration",
    "Level 4 - Automation with scripts and ETL pipelines",
    "Level 5 - AI-assisted classification and anomaly detection",
    "Level 6 - Enterprise decision systems powered by spatial intelligence",
]

SECTION_TYPES = [
    "Concept explanation",
    "GIS/IT architectural example",
    "AI or automation use case",
    "Implementation steps",
    "Common failure points",
    "System improvement loop",
    "Reflection prompts for practitioners",
    "Applied architecture synthesis",
]


class BookPDF(FPDF):
    def header(self):
        if self.page_no() <= 3:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, TITLE, border=0, ln=0, align="L")
        self.cell(0, 8, f"Page {self.page_no() - 3}", border=0, ln=1, align="R")
        self.ln(2)

    def footer(self):
        if self.page_no() <= 3:
            return
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(110, 110, 110)
        self.cell(0, 8, f"Clarity Loop Edition - {date.today().isoformat()}", 0, 0, "C")


def chapter_for_page(content_page_number: int) -> tuple[int, dict]:
    pages_per_chapter = TOTAL_CONTENT_PAGES // len(CHAPTERS)
    chapter_index = min((content_page_number - 1) // pages_per_chapter, len(CHAPTERS) - 1)
    return chapter_index + 1, CHAPTERS[chapter_index]


def mc(pdf: BookPDF, text: str, h: int = 7, align: str = "L"):
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(0, h, text, align=align, new_x="LMARGIN", new_y="NEXT")


def draw_title_page(pdf: BookPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 24)
    pdf.ln(35)
    mc(pdf, TITLE, h=12, align="C")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 13)
    mc(pdf, "A systems-thinking manual for GIS modernization, AI automation, and enterprise IT operations", h=8, align="C")
    pdf.ln(12)
    pdf.set_font("Helvetica", "", 12)
    mc(pdf, "Core lifecycle: Observe -> Structure -> Automate -> Measure -> Refine -> Institutionalize", align="C")
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 12)
    mc(pdf, AUTHOR, h=8, align="C")
    mc(pdf, f"Generated on {date.today().isoformat()}", h=8, align="C")


def draw_copyright_page(pdf: BookPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, "Publication Notes", ln=1)
    pdf.set_font("Helvetica", "", 11)
    note = (
        "This manual is designed for engineers, GIS consultants, CIO offices, and digital transformation leaders "
        "who need practical guidance for building reliable, governed, and automation-ready systems.\n\n"
        "Each chapter is implementation-focused and includes concept framing, architecture examples, automation patterns, "
        "execution steps, failure modes, and improvement prompts."
    )
    mc(pdf, note)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "System evolution model", ln=1)
    pdf.set_font("Helvetica", "", 11)
    for level in EVOLUTION_LEVELS:
        mc(pdf, f"- {level}")


def draw_toc(pdf: BookPDF):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Table of Contents", ln=1)
    pdf.ln(3)
    pdf.set_font("Helvetica", "", 11)
    pages_per_chapter = TOTAL_CONTENT_PAGES // len(CHAPTERS)
    for idx, chapter in enumerate(CHAPTERS, start=1):
        start_page = (idx - 1) * pages_per_chapter + 1
        end_page = idx * pages_per_chapter
        if idx == len(CHAPTERS):
            end_page = TOTAL_CONTENT_PAGES
        title = chapter["title"]
        dots = "." * max(4, 70 - len(title))
        pdf.cell(0, 7, f"Chapter {idx}: {title} {dots} {start_page}-{end_page}", ln=1)


def draw_content_page(pdf: BookPDF, content_page_number: int):
    chapter_num, chapter = chapter_for_page(content_page_number)
    section = SECTION_TYPES[(content_page_number - 1) % len(SECTION_TYPES)]
    loop_phase = CLARITY_LOOP_PHASES[(content_page_number - 1) % len(CLARITY_LOOP_PHASES)]
    domain = SYSTEM_DOMAINS[(content_page_number - 1) % len(SYSTEM_DOMAINS)]
    level = EVOLUTION_LEVELS[(content_page_number - 1) % len(EVOLUTION_LEVELS)]

    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    mc(pdf, f"Chapter {chapter_num}: {chapter['title']}", h=8)
    pdf.set_font("Helvetica", "", 11)
    mc(pdf, f"Content Page {content_page_number} | Section: {section} | Loop phase emphasis: {loop_phase} | Domain: {domain}")
    mc(pdf, f"System evolution anchor: {level}")
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "1) Concept explanation")
    pdf.set_font("Helvetica", "", 11)
    mc(pdf, chapter["concept"])

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "2) GIS/IT architectural example")
    pdf.set_font("Helvetica", "", 11)
    mc(pdf, chapter["gis_example"])

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "3) AI or automation use case")
    pdf.set_font("Helvetica", "", 11)
    mc(pdf, chapter["automation_use_case"])

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "4) Implementation steps")
    pdf.set_font("Helvetica", "", 11)
    for step in chapter["implementation_steps"]:
        mc(pdf, f"- {step}")

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "5) Common failure points")
    pdf.set_font("Helvetica", "", 11)
    for failure in chapter["failure_points"]:
        mc(pdf, f"- {failure}")

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "6) System improvement loop")
    pdf.set_font("Helvetica", "", 11)
    mc(pdf, chapter["improvement_loop"])

    pdf.set_font("Helvetica", "B", 11)
    mc(pdf, "7) Reflection prompts for practitioners")
    pdf.set_font("Helvetica", "", 11)
    for prompt in chapter["reflection_prompts"]:
        mc(pdf, f"- {prompt}")

    pdf.ln(1)
    pdf.set_font("Helvetica", "I", 10)
    mc(
        pdf,
        "Applied architecture synthesis: In this phase, teams should verify data contracts, automation controls, and governance checkpoints before scaling workloads.",
        h=6,
    )


def main():
    pdf = BookPDF(format="LETTER")
    pdf.set_auto_page_break(auto=True, margin=15)

    draw_title_page(pdf)
    draw_copyright_page(pdf)
    draw_toc(pdf)

    for page_num in range(1, TOTAL_CONTENT_PAGES + 1):
        draw_content_page(pdf, page_num)

    pdf.output(OUTPUT_FILE)
    print(f"Generated {OUTPUT_FILE} with {pdf.page_no()} total pages.")


if __name__ == "__main__":
    main()
