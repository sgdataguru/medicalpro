# Data Platform Strategy

## 1.1 Executive Summary

### Business Context

Farrer Park Hospital operates in a Southeast Asian healthcare market where clinical analytics remains overwhelmingly descriptive — hospitals can see what happened, but lack the tooling to predict what will happen or prescribe what should happen. Operational decisions around staffing, bed management, supply chain, and financial planning are made reactively, driven by assumption rather than evidence. Data fragmentation across clinical systems (EHR, HR, procurement, finance) compounds the problem, leaving administrators without a unified operational picture.

### Strategic Vision

MedicalPro — the Clinical Analytics OS — will deliver a unified data platform that ingests, standardizes, and governs hospital operational data across five core domains (staffing, bed allocation, supply chain, revenue/cost analysis, and anomaly detection), then layers predictive and prescriptive intelligence on top. The platform's defining capability is **foresight simulation**: the ability to model what-if scenarios — "What if we reduce nursing staff by 20 in December?" — and trace cascading impacts across every operational module before a decision is executed. This positions MedicalPro at the prescriptive analytics tier, a capability rare in Southeast Asian healthcare, delivering actionable recommendations rather than retrospective dashboards.

### Expected Outcomes

- **Operational efficiency**: Reduce overtime staffing costs by 15–20% through predictive allocation; improve bed turnover by 10–15% through demand-driven reallocation.
- **Financial transparency**: Surface the top cost drivers with AI-generated narratives, reducing finance report turnaround from days to minutes.
- **Supply chain resilience**: Prevent stockouts and reduce waste by forecasting demand and flagging expiring inventory automatically.
- **Decision confidence**: Enable hospital directors to simulate high-stakes decisions (ward closures, budget cuts, supplier changes) and see projected outcomes with confidence intervals before committing.
- **Data quality uplift**: Catch data inconsistencies at ingestion — before they propagate to analytics — with automated validation, quarantine management, and graph-based orphan detection.

### Strategic Bets

1. **Cross-module cascade simulation as the differentiator.** Rather than building five independent analytics dashboards, we invest in a graph-based dependency model (Neo4j) that connects every operational domain. The simulation engine traverses this graph to compute cascading impacts — a capability no competitor in the region offers.
2. **Output-first (Kimball) data design.** Instead of gathering all available data and hoping it supports analytics, we define the predictive model outputs we need first, then work backward to specify precisely which data fields each hospital must provide. This accelerates implementation and prevents "garbage in, garbage out" analytics.
3. **AI-augmented analytics with healthcare guardrails.** Claude API handles ~70% of routine data analyst work (narrative generation, anomaly classification, NLP query decomposition, field mapping suggestions), while healthcare-specific guardrails prevent hallucination, PHI exposure, and misinterpretation.

---

## 1.2 Business Requirements & Strategic Response

### REQ-001: Predictive Staff Allocation

- **Strategic Approach**: Ingest staff records, shift assignments, and patient census data to build 72-hour staffing demand forecasts. Predictive models recommend staffing adjustments that respect regulatory nurse-to-patient ratios, budget constraints, and staff availability.
- **Key Capabilities**: Data ingestion from HR/scheduling systems, time-series forecasting, constraint-aware optimization, recommendation engine with accept/dismiss workflow.
- **Success Criteria**: Coverage gaps identified 72 hours in advance; overtime cost projections within 10% of actuals; recommendations adopted >60% of the time within 6 months.
- **Dependencies**: REQ-006 (simulation engine for modeling staffing change impacts), REQ-009 (data ingestion pipeline for HR and EHR feeds).
- **Strategic Rationale**: Staffing is the largest hospital operating expense (~40–50% of total). Predictive allocation directly reduces overtime while maintaining care quality. We chose constraint-aware optimization over simple demand forecasting because regulatory ratio compliance is non-negotiable in healthcare.

### REQ-002: Strategic Bed Allocation

- **Strategic Approach**: Combine real-time ADT (Admit/Discharge/Transfer) event streams with 7-day demand forecasts to recommend bed reallocation across departments. Neo4j adjacency graphs model department transfer routes for optimal overflow routing.
- **Key Capabilities**: Real-time occupancy tracking (SSE/WebSocket), demand forecasting, reallocation recommendation engine, revenue impact modeling, capacity alerting.
- **Success Criteria**: Occupancy maintained at 85–92% optimal range; patient wait times reduced by 15%; revenue impact of reallocation decisions quantified before execution.
- **Dependencies**: REQ-001 (staffing affects bed capacity), REQ-004 (revenue impact modeling), REQ-009 (ADT event ingestion).
- **Strategic Rationale**: Bed allocation is "the money maker" for hospitals — unused beds represent lost revenue, while overcrowding degrades care quality. Real-time ADT event processing (rather than batch) is justified because bed status changes intra-day and delayed responses cause cascading bottlenecks.

### REQ-003: Supply Chain Optimization

- **Strategic Approach**: Track inventory levels and consumption rates across supply categories, forecast demand based on patient volume trends, and flag items at risk of expiration, overstocking, or stockout. Neo4j models supplier and substitution networks for resilience during disruptions.
- **Key Capabilities**: Inventory management with reorder alerting, demand forecasting, procurement recommendation engine, expiration tracking (daily scans), supplier performance analytics.
- **Success Criteria**: Zero critical stockouts; expired inventory waste reduced by 25%; procurement recommendations generate measurable cost savings.
- **Dependencies**: REQ-009 (procurement and inventory data ingestion), REQ-006 (supply disruption what-if scenarios).
- **Strategic Rationale**: Hospital supply chains have unique challenges — expiration timelines, substitution constraints, and regulatory requirements. We use a graph database for item substitution networks because relational foreign keys cannot model complex substitution chains with compatibility scores.

### REQ-004: Revenue and Cost Driver Analysis

- **Strategic Approach**: Build a financial analytics layer with period-over-period variance analysis, AI-generated narrative explanations of revenue changes, and drill-down from summary KPIs to individual cost/revenue line items. Claude API generates plain-English financial narratives.
- **Key Capabilities**: Multi-period financial summaries, waterfall charts, cost treemaps, variance analysis, AI-generated financial narratives, PDF/Excel export.
- **Success Criteria**: Finance team can self-serve revenue/cost analysis without analyst involvement; narrative explanations rated "useful" by >70% of users; report generation time reduced from days to minutes.
- **Dependencies**: REQ-009 (financial system data ingestion), REQ-001 and REQ-002 (staffing and bed data feed cost and revenue models).
- **Strategic Rationale**: Financial analytics requires strict RBAC (role-based access control) and audit logging due to data sensitivity. AI-generated narratives chosen over static dashboards because hospital directors need "why" explanations, not just charts — "Revenue declined 8% driven primarily by reduced surgical volume in Ward B" is more actionable than a bar chart.

### REQ-005: Operational Anomaly Detection

- **Strategic Approach**: Continuously monitor data across all operational modules using statistical methods (Z-score, IQR, moving average deviation) and Claude AI for severity classification, root cause hypothesis generation, and recommended actions. Neo4j traversal detects cascading anomalies across module boundaries.
- **Key Capabilities**: Multi-method anomaly detection, real-time alerting (SSE), severity classification (critical/high/medium/low), root cause analysis, cross-module cascade detection, feedback loop for classification accuracy.
- **Success Criteria**: Critical anomalies surfaced within 5 minutes of detection; false positive rate <15%; cascading anomaly chains identified across module boundaries.
- **Dependencies**: REQ-001–004 (monitors all operational modules), REQ-008 (quality anomalies overlap with governance).
- **Strategic Rationale**: Healthcare anomalies can have patient safety implications — a staffing anomaly causing understaffing in ICU is not equivalent to a minor inventory discrepancy. AI-powered severity classification with healthcare context is essential to prevent alert fatigue.

### REQ-006: What-If Foresight Simulation

- **Strategic Approach**: Build an interactive scenario builder where directors define operational changes (staffing reductions, ward closures, budget cuts, supplier changes), and a cascade calculator traverses the Neo4j dependency graph to compute cross-module impacts with confidence intervals (Monte Carlo estimation).
- **Key Capabilities**: Scenario builder with natural language input (Claude-parsed), cross-module cascade computation, confidence intervals, side-by-side scenario comparison, scenario sharing, PDF export.
- **Success Criteria**: Simulations complete within 30 seconds; cascade impacts computed across 4+ module hops; directors report increased decision confidence (survey).
- **Dependencies**: REQ-001–005 (all module models feed simulation), REQ-011 (cascade visualization).
- **Strategic Rationale**: This is the **platform's core differentiator**. In Southeast Asia, no other healthcare analytics vendor offers foresight simulation with cross-module cascade analysis. The graph database is essential — relational joins cannot efficiently traverse multi-hop impact chains.

### REQ-007: Self-Service Sandbox Demo

- **Strategic Approach**: Provide a fully isolated sandbox environment with synthetic data across all five modules, accessible via a public landing page without authentication. Session-scoped isolation (schema-per-session in PostgreSQL, namespace-per-session in Redis, partition labels in Neo4j) ensures demo data never touches production.
- **Key Capabilities**: Sandbox provisioning with synthetic data generation, guided tour, session timer (4-hour TTL), module exploration tracking, demo request form (CRM integration), sandbox reset.
- **Success Criteria**: Prospective clients can self-serve a full demo without sales team involvement; sandbox-to-demo-request conversion rate >20%.
- **Dependencies**: REQ-001–006 (all modules must be demonstrable in sandbox).
- **Strategic Rationale**: Pre-sales demos are the primary conversion mechanism for hospital SaaS. A self-service sandbox overcomes buyer skepticism by letting prospects experience what-if simulations with their domain's data patterns.

### REQ-008: Data Quality Governance

- **Strategic Approach**: Implement a four-layer quality monitoring framework (raw → processing → action → simulation) with configurable benchmarks, 5 quality rule categories (completeness, accuracy, consistency, timeliness, custom), tamper-evident audit logging, and Claude-powered root cause analysis for quality issues.
- **Key Capabilities**: Pipeline-stage quality scoring, issue management with root cause analysis, configurable benchmarks, hash-chained append-only audit log (7-year retention), quality trend analysis.
- **Success Criteria**: Quality scores visible at every pipeline stage; data issues traceable to origin layer within 3 clicks; audit log retention meets healthcare regulatory requirements.
- **Dependencies**: REQ-009 (ingestion-layer validation is the first quality gate).
- **Strategic Rationale**: Healthcare data governance is not optional — it's regulatory. The four-layer approach ensures quality is measured at each transformation boundary, not just at final output. Hash-chained audit logs provide tamper evidence for compliance audits.

### REQ-009: Data Ingestion and Validation

- **Strategic Approach**: Build an automated ingestion pipeline supporting multiple healthcare data formats (FHIR R4, HL7v2, CSV, JSON) with rule-based validation (JSONLogic expressions), unit standardization (mmHg/kPa, mg/dL/mmol/L, F/C), quarantine management for failed records, and Neo4j-based orphan node detection.
- **Key Capabilities**: Multi-format parsing, configurable validation rules, unit standardization, quarantine and remediation workflow, orphan detection, real-time job progress (WebSocket).
- **Success Criteria**: 10,000 records/minute throughput; <2% records requiring manual remediation; zero invalid records propagated to downstream analytics.
- **Dependencies**: REQ-013 (module configuration defines which fields to ingest).
- **Strategic Rationale**: Healthcare data fragmentation — different departments using different units, formats, and coding systems — is the root cause of analytics failures. Quarantine-first design (invalid records quarantined immediately, never blocking the pipeline) prevents bad data from contaminating analytics while preserving throughput.

### REQ-010: Natural Language Query

- **Strategic Approach**: Deploy a Claude-powered NLP query interface where administrators ask questions in plain English ("Why is my revenue lower this quarter?"). Claude decomposes queries into SQL/Cypher sub-queries via tool-use, routes to PostgreSQL or Neo4j, then synthesizes results with streaming progressive rendering (text → data → visualization → citations).
- **Key Capabilities**: Natural language query decomposition, multi-turn conversation, voice input (Web Speech API), dynamic visualization generation, healthcare guardrails, confidence scoring, data citations.
- **Success Criteria**: >80% of queries answered without reformulation; response time <10 seconds for common queries; guardrails block 100% of PHI-exposing queries.
- **Dependencies**: All modules (NL queries span any module's data).
- **Strategic Rationale**: Hospital directors are not data-literate. A natural language interface removes the barrier between operational questions and data-driven answers, eliminating dependency on analyst intermediaries.

### REQ-011: Cross-Module Impact Visualization

- **Strategic Approach**: Build an interactive force-directed graph (D3.js) showing how changes in one module cascade through related modules. Neo4j Cypher traversal (depth-limited to 4 hops) computes cascade paths, with correlation-based weights from historical data.
- **Key Capabilities**: Force-directed, hierarchical, and radial graph layouts; animated SVG impact path tracing; module-level and metric-level drill-down; impact weight matrix from historical data.
- **Success Criteria**: Directors can trace a staffing change through to its revenue impact in <3 clicks; impact weights recalculated weekly from historical correlation data.
- **Dependencies**: REQ-006 (shares cascade computation engine), all operational modules.
- **Strategic Rationale**: D3.js (SVG-based) chosen over Canvas-based rendering for accessibility and DOM event handling. Cascade depth limited to 4 hops to prevent exponential graph explosion while covering meaningful impact chains.

### REQ-012: Prescriptive Action Recommendations

- **Strategic Approach**: Aggregate predictive model outputs from all modules, use Claude API to generate prescriptive actions with reasoning and expected outcomes, prioritize by weighted composite scoring (revenue impact 30%, patient safety 25%, cost savings 20%, operational efficiency 15%, compliance 10%), and track actual outcomes post-implementation for learning feedback loop.
- **Key Capabilities**: Recommendation generation from predictive signals, weighted priority scoring, accept/defer/dismiss workflow, outcome tracking, monthly learning loop adjustment.
- **Success Criteria**: Recommendations adopted >50% of the time; predicted outcomes within 20% of actual results after 6 months of learning; dismiss rationale captured for 100% of dismissed recommendations.
- **Dependencies**: REQ-001–005 (all module predictions feed recommendations), REQ-006 (simulation preview for recommendations).
- **Strategic Rationale**: Prescriptive analytics — telling administrators what to do, not just what happened — is the platform's market positioning. The learning loop ensures recommendation quality improves over time. Mandatory dismiss rationale feeds the learning model.

### REQ-013: Module Data Configuration

- **Strategic Approach**: Provide an implementation consultant tool where data field requirements are defined per module per hospital, using the output-first (Kimball) methodology where predictive model outputs determine required input fields. AI-powered field mapping suggestions (Claude API) accelerate hospital onboarding.
- **Key Capabilities**: Standard field templates (5 modules × 18–28 fields each), output-to-input traceability, capability resolution (which analytics unlock based on configured fields), 70/30 standard/custom field ratio enforcement, versioned configurations, PDF/CSV/XLSX export.
- **Success Criteria**: Hospital onboarding data requirements defined within one day; capability impact of missing fields visible before data collection begins; 70/30 standard/custom ratio maintained.
- **Dependencies**: REQ-009 (field definitions drive ingestion validation rules).
- **Strategic Rationale**: The output-first approach prevents the classic analytics failure mode of collecting data for months only to discover it doesn't support the desired predictive models. By basing the platform on Kimball (not Inmon), we prioritize actionable analytics over comprehensive data warehousing.

---

## 1.3 Data Platform Strategy

### Data Architecture Pattern

MedicalPro adopts a **four-layer zone-based architecture** aligned with the progressive data refinement principle:

1. **Raw Layer** — Incoming data preserved in original format (FHIR R4, HL7v2, CSV). No transformations applied. Enables reprocessability and audit compliance.
2. **Processing Layer** — Validated, standardized, and enriched data. Unit conversions applied (mmHg/kPa, mg/dL/mmol/L). Failed records quarantined. Graph relationships established in Neo4j.
3. **Action Layer** — Module-specific analytical models (staffing predictions, bed demand forecasts, financial variance analyses). This is where predictive intelligence is computed.
4. **Simulation Layer** — What-if scenario computations, cascade impact calculations, and prescriptive recommendation generation. Consumes outputs from the Action Layer and the Neo4j dependency graph.

This is a **modified medallion architecture** (raw → cleansed → curated) extended with a simulation tier that distinguishes MedicalPro from standard analytics platforms.

### Data Storage Strategy

| Storage Tier | Technology | Purpose | Access Pattern |
|---|---|---|---|
| Hot | PostgreSQL + Redis | Current operational state, active sessions, real-time caching | Sub-second reads, 5–30 min TTL cache |
| Warm | PostgreSQL (partitioned) | Historical trends, audit logs, archived recommendations | Analytical queries, monthly partitions |
| Cold | PostgreSQL (compressed) + Object Storage | 7-year audit retention, raw ingestion archives | Compliance retrieval, batch access |
| Graph | Neo4j | Module dependency graphs, patient flow paths, supplier networks, orphan detection | Traversal queries (1–4 hops), cascade computation |

**Rationale**: PostgreSQL as the primary OLTP/OLAP store (with materialized views for aggregation) keeps operational complexity low. Neo4j is justified specifically for graph traversal use cases — cascade impact computation, transfer route optimization, and orphan detection — where relational joins would be prohibitively expensive at depth >2.

### Data Integration Approach

- **Primary pattern**: **ELT (Extract-Load-Transform)** — data extracted from source systems, loaded into the Raw Layer in original format, then transformed in-place through the Processing and Action Layers. ELT chosen over ETL for flexibility: raw data is preserved for schema evolution and reprocessing.
- **Real-time events**: ADT (Admit/Discharge/Transfer) events, anomaly alerts, and simulation progress use **Server-Sent Events (SSE)** and **WebSocket** for sub-second delivery to the frontend. Not full event streaming (Kafka) — the volume doesn't justify it at single-hospital scale.
- **Batch processing**: Demand forecasts, financial aggregations, quality assessments, and recommendation generation run as **BullMQ background jobs** with configurable schedules. 24 distinct queue types handle domain-specific workloads with retry policies (3 attempts, exponential backoff).
- **Idempotency**: All ingestion and transformation jobs are idempotent — safe to re-run without duplicating data or corrupting state.

### Data Modeling Approach

- **Operational modules (Staffing, Beds, Supply, Finance)**: Dimensional models aligned with the Kimball methodology. Fact tables (shift assignments, occupancy snapshots, consumption records, financial line items) surrounded by dimension tables (departments, wards, staff roles, supply categories, financial periods). Designed for query performance and business user comprehension.
- **Graph model (Neo4j)**: Nodes represent Modules, Departments, Wards, Suppliers, and Metrics. Relationships represent IMPACTS, ADJACENT_TO, FLOWS_TO, SHARES_RESOURCE, SUBSTITUTES_FOR — each with typed properties (weight, direction, timeframe). This model directly supports cascade traversal and cross-module impact analysis.
- **Configuration model**: Output-first traceability — every required input field is linked to the predictive model output it enables, establishing lineage from business outcome back to data source.

### Data Quality Strategy

Quality is enforced at every layer boundary, following the principle that catching errors early is exponentially cheaper than fixing them downstream:

1. **Ingestion (Raw → Processing)**: JSONLogic validation rules check completeness, format, range constraints. Failed records quarantined immediately. Unit standardization applied. Neo4j orphan detection identifies disconnected records.
2. **Processing (Processing → Action)**: Cross-field and cross-module consistency checks. Timeliness checks flag stale data. Quality scores computed per module per dimension (completeness, accuracy, consistency, timeliness).
3. **Action (Action → Simulation)**: Model input validation ensures prediction inputs meet minimum quality thresholds before computation.
4. **Simulation**: Confidence intervals quantify uncertainty in simulation outputs, making quality visible to decision-makers.

Configurable benchmarks allow each hospital to set quality thresholds appropriate to their data maturity.

### Data Lineage & Observability

- **Pipeline observability**: Every ingestion job, transformation step, and quality assessment is logged with timestamps, record counts, pass/fail metrics, and error details. BullMQ job queues provide built-in retry tracking and failure visibility.
- **Audit logging**: Hash-chained, append-only audit log (no UPDATE/DELETE) partitioned monthly with 7-year retention. Tamper-evident design supports healthcare regulatory compliance.
- **Output-to-input traceability**: Module Configuration (REQ-013) establishes traceability from every predictive output back to its required input fields, making data lineage explicit from business outcome to source system.
- **Quality trend monitoring**: Quality scores tracked over time with 7-day, 30-day, 90-day, and 1-year trend views. Degradation triggers automated alerts.

### Security & Governance Approach

- **Authentication and authorization**: JWT with role-based access control (RBAC). Roles include administrator, director, data_administrator, finance_analyst, and implementation_consultant. Financial data access restricted to DIRECTOR, CFO, and FINANCE_ANALYST roles.
- **Data classification**: Financial data classified as confidential (no browser caching, export watermarks). Clinical data subject to healthcare privacy regulations. Sandbox data isolated per session.
- **Encryption**: TLS in transit; column-level encryption for sensitive financial figures at rest.
- **Audit**: All data access logged. Export operations watermarked with user identity and timestamp.
- **Sandbox isolation**: Complete data isolation between sandbox demos and production — schema-per-session (PostgreSQL), namespace-per-session (Redis), partition labels (Neo4j).
- **AI guardrails**: Healthcare-specific guardrails on all Claude API interactions prevent PHI exposure, block harmful queries, and enforce confidence thresholds.

---

## 1.4 Technology Approach

### Cloud Platform Rationale

MedicalPro targets **AWS** as the primary cloud platform:
- **ECS/Lambda**: Container orchestration for NestJS services, with Lambda for event-driven workloads (scheduled quality assessments, expiration scans).
- **RDS PostgreSQL**: Managed relational database with automated backups, point-in-time recovery, and read replicas for analytical queries.
- **ElastiCache Redis**: Managed Redis for caching, session state, and BullMQ job queue backing.
- **CloudFront CDN**: Static asset delivery for the Next.js frontend.

**Rationale**: AWS provides managed services that reduce operational overhead. The team's existing skills align with the AWS ecosystem. Singapore region availability satisfies data residency requirements for Southeast Asian healthcare.

### Core Platform Capabilities

| Capability | Technology | Rationale |
|---|---|---|
| API Framework | NestJS (TypeScript) | Full-stack TypeScript consistency; decorators for RBAC, validation, Swagger |
| Primary Database | PostgreSQL | Mature OLTP/OLAP, materialized views, table partitioning, JSON support |
| Graph Database | Neo4j | Native graph traversal for cascade computation, relationship modeling |
| Cache/Queue Backing | Redis | Sub-millisecond reads, BullMQ compatibility, session and cache management |
| Job Processing | BullMQ | 24 dedicated queues with priority, retry, and dead-letter handling |
| AI Layer | Claude API (Anthropic) | Narrative generation, anomaly classification, NLP query decomposition, field mapping |
| Frontend | Next.js 16 (App Router) + React 19 | Server components for performance, client components for interactivity |
| Visualization | Recharts + D3.js | Recharts for standard charts; D3.js for force-directed graph and custom SVG |
| Real-time | SSE + WebSocket | SSE for unidirectional streams (anomalies, progress); WebSocket for bidirectional (ingestion) |

### Integration Patterns

- **Hospital source systems**: FHIR R4 and HL7v2 as primary healthcare data interchange standards. CSV/JSON for legacy systems. All integrations route through the Data Ingestion Pipeline (REQ-009) — no point-to-point connections between source systems and analytical modules.
- **Claude API**: Used as a tool-use agent for query decomposition (NLP), a classifier (anomaly detection), a generator (financial narratives, recommendations), and a suggestor (field mapping). All interactions pass through healthcare guardrails.
- **CRM integration**: Sandbox demo requests trigger a webhook to the hospital's sales CRM system.
- **Export services**: PDF generation via @react-pdf/renderer, Excel via SheetJS, CSV via native streaming. All exports run as background BullMQ jobs to avoid blocking request threads.

### Analytics & Reporting Approach

- **Executive dashboard**: Server-rendered summary with real-time KPI cards, revenue cycle charts, expense breakdowns, payer mix analysis, and foresight simulation ROI. Data refreshed per session.
- **Module dashboards**: Each operational module has its own analytical dashboard with module-specific visualizations (heatmaps, timelines, trend charts, treemaps).
- **Self-service NLP**: Natural language query interface allows non-technical users to ask questions and receive answers with auto-generated visualizations. Replaces the traditional BI report request workflow.
- **Prescriptive layer**: Recommendations surface as actionable cards with reasoning, supporting data, expected outcomes, and accept/defer/dismiss workflow — not passive reports.

### Infrastructure as Code

- **CI/CD**: GitHub Actions pipelines for build, test, lint, and deployment.
- **Infrastructure**: AWS CDK or Terraform for declarative infrastructure provisioning with environment parity (dev/staging/production).
- **Database migrations**: Versioned migration files managed through TypeORM or a dedicated migration tool, applied automatically during deployment.
- **Environment parity**: All environments (development, staging, production, sandbox) run identical infrastructure configurations, differing only in scale and data.

---

## 1.5 Strategic Decision Framework

### Decision D-001: Graph Database for Cross-Module Impact

**Decision Point**: How should cross-module dependency relationships be modeled and traversed?

**Options Considered**:
1. **Relational (PostgreSQL with recursive CTEs)**: Model dependencies as foreign key relationships; use recursive queries for traversal.
   - Pros: No additional technology; team familiarity.
   - Cons: Recursive CTEs degrade at depth >2; cascade computation becomes expensive; relationship properties (weight, direction, timeframe) awkward in relational model.

2. **Graph database (Neo4j)**: Native graph storage with Cypher traversal for cascade computation.
   - Pros: Sub-millisecond traversal at depth 4; natural relationship modeling with typed properties; pattern matching for cascade detection.
   - Cons: Additional technology to manage; team learning curve; data synchronization between PostgreSQL and Neo4j.

3. **In-memory graph (application-layer)**: Build dependency graph in application memory on startup.
   - Pros: No additional database; fast traversal.
   - Cons: Memory limits at scale; no persistence; reconstruction cost on restart; difficult to query ad-hoc.

**Recommended Strategy**: Neo4j as the dedicated graph layer, scoped strictly to relationship-heavy use cases (cascade impact, transfer routing, orphan detection, supplier networks).

**Decision Criteria**: The simulation engine — the platform's core differentiator — requires efficient multi-hop traversal across module boundaries. This is inherently a graph problem. PostgreSQL recursive CTEs cannot meet the <1-second latency target at depth 4 with the expected relationship density.

**Decision Timing**: Validated during Module 06 (Simulations) implementation. The Pure-SVG cascade diagram in the MVP frontend already assumes graph-structured data.

**Reversibility**: One-way door for the cascade computation path. However, Neo4j is scoped narrowly — all operational data remains in PostgreSQL. If Neo4j proves unnecessary, the graph layer can be replaced without impacting core module functionality.

---

### Decision D-002: Output-First (Kimball) vs. Data-First (Inmon) Design

**Decision Point**: What methodology should drive the data model and field requirements?

**Options Considered**:
1. **Inmon (data-first)**: Build a comprehensive enterprise data warehouse from all available source data, then derive analytical models.
   - Pros: Complete data availability; discovery-friendly.
   - Cons: Long time to value; data collection precedes analytics; risk of collecting data that never gets used; hospitals frustrated by lengthy onboarding.

2. **Kimball (output-first)**: Define desired analytical outputs first, then work backward to specify exactly which data fields are required.
   - Pros: Faster time to value; precise data requirements; cleaner hospital onboarding; every field justified by a business outcome.
   - Cons: Less discovery flexibility; adding new analytics later requires field requirement updates.

**Recommended Strategy**: Kimball output-first, implemented through Module 13 (Configure Module Data Requirements) where every data field is traced back to the predictive model output it enables.

**Decision Criteria**: Hospital onboarding speed is critical for enterprise sales. Defining exact data requirements upfront (rather than requesting "everything you have") reduces implementation friction and sets clear expectations. The 70/30 standard/custom ratio provides structured flexibility.

**Decision Timing**: Confirmed — Module 13 is already designed with output-first traceability.

**Reversibility**: Two-way door. Additional fields can be added to the standard templates as new analytical capabilities are developed. The 30% custom field allowance accommodates hospital-specific needs.

---

### Decision D-003: AI Layer Strategy (Claude API vs. Custom ML Models)

**Decision Point**: How should the platform's intelligence capabilities be powered?

**Options Considered**:
1. **Custom ML models**: Train and host domain-specific models for forecasting, classification, and NLP.
   - Pros: Full control; no API dependency; potentially lower marginal cost at scale.
   - Cons: Significant ML engineering investment; long development cycle; model training data requirements; ongoing model maintenance.

2. **LLM API (Claude)**: Use Claude API for narrative generation, anomaly classification, NLP query decomposition, and field mapping.
   - Pros: Rapid deployment; state-of-the-art language understanding; tool-use capabilities for query decomposition; no training data needed.
   - Cons: API cost per query; latency for streaming responses; dependency on external vendor; healthcare guardrail engineering required.

3. **Hybrid**: Statistical methods for forecasting (Z-score, moving average, Monte Carlo) combined with Claude API for language-heavy tasks.
   - Pros: Best of both — statistical reliability for numeric forecasts, LLM capability for language tasks.
   - Cons: Two inference patterns to maintain.

**Recommended Strategy**: Hybrid approach. Statistical and algorithmic methods for numeric forecasting and anomaly detection. Claude API for language-intensive tasks (narratives, NLP queries, classification, recommendations). Healthcare guardrails applied to all AI interactions.

**Decision Criteria**: Numeric forecasting (staffing demand, bed occupancy, supply consumption) is better served by well-understood statistical methods with interpretable confidence intervals. Language tasks (explaining financial variances, parsing natural language queries, generating recommendations) benefit from LLM capabilities that statistical models cannot replicate.

**Decision Timing**: Validated — Module 05 implementation plan already specifies statistical methods (Z-score, IQR, moving average) for detection and Claude API for classification. Module 10 specifies Claude tool-use for query decomposition.

**Reversibility**: Two-way door. Claude API can be replaced with alternative LLM providers (self-hosted models, competitor APIs) without changing the application architecture. Statistical models can be upgraded to trained ML models as training data accumulates.

---

### Decision D-004: Real-Time vs. Batch Data Processing

**Decision Point**: What data processing model should anchor the ingestion and analytics pipeline?

**Options Considered**:
1. **Full event streaming (Kafka/Kinesis)**: All data ingested and processed as real-time event streams.
   - Pros: Sub-second data freshness across all modules.
   - Cons: Extreme complexity; cost disproportionate to single-hospital scale; over-engineered for batch-friendly modules (finance, procurement).

2. **Batch + targeted real-time (BullMQ + SSE/WebSocket)**: Batch processing for forecasts, reports, and quality assessments. Real-time event delivery only where latency matters (ADT events, anomaly alerts, simulation progress).
   - Pros: Appropriate complexity per use case; cost-effective; BullMQ integrates natively with NestJS; SSE/WebSocket sufficient for single-hospital fan-out.
   - Cons: Not suitable for multi-hospital event correlation in real-time.

3. **Micro-batch (5–15 minute cycles)**: Scheduled processing at short intervals.
   - Pros: Near-real-time without streaming complexity.
   - Cons: Fixed latency floor; wasted compute during quiet periods.

**Recommended Strategy**: Batch + targeted real-time. BullMQ (24 queue types) handles all batch workloads with priority, retry, and scheduling. SSE and WebSocket deliver real-time events only where business requirements demand it (bed occupancy changes, anomaly alerts, simulation progress, ingestion monitoring).

**Decision Criteria**: At single-hospital scale (~50,000 records/day ingestion, <1,000 concurrent users), full event streaming is over-engineered. BullMQ provides sufficient throughput (10,000 records/minute target) while keeping the stack consistent (Node.js/Redis). Real-time delivery is scoped to three use cases where freshness directly impacts decisions.

**Decision Timing**: Confirmed in architecture. Can evolve to event streaming when multi-hospital scale requires it.

**Reversibility**: Two-way door. The four-layer zone architecture supports future streaming adoption without restructuring. Adding Kafka between the Raw and Processing layers is additive, not destructive.

---

*See [Value Delivery Roadmap](./value-delivery-roadmap.md) for implementation phasing and sequencing. See [Risk & Constraint Register](./risk-constraint-register.md) for risk landscape and boundary conditions.*
