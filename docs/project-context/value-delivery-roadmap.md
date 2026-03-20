# Value Delivery Roadmap

## 2.1 Overview & Phasing Philosophy

This document defines the strategic phasing and sequencing of value delivery for MedicalPro — the Clinical Analytics OS for Farrer Park Hospital. It should be read alongside the [Data Platform Strategy](./data-platform-strategy.md), which defines the architectural patterns, technology decisions, and business requirement responses that inform this roadmap.

The phasing follows a **crawl-walk-run** progression, with each phase delivering tangible business outcomes — not just technical infrastructure. The guiding principle is that every phase should leave the platform in a deployable, demonstrable state.

---

## 2.2 Strategic Phasing Approach

Five principles guide the sequencing of work across phases:

1. **Value First**: Start with the highest-value, lowest-complexity capabilities that prove the platform's worth to hospital stakeholders. The sandbox demo and executive dashboard come before advanced simulation features because they are the primary conversion tools for hospital sales.

2. **End-to-End Vertical Slices**: Each phase delivers complete working features — from data ingestion through to user-facing output — rather than building horizontal infrastructure layers in isolation. A partially complete ingestion pipeline with no analytics consuming its output delivers zero business value.

3. **Foundation Early**: Observability (quality monitoring, audit logging), security (RBAC, encryption), and governance (validation, quarantine) are included from Phase 1. Technical debt in these areas is expensive to retrofit and risky to defer in healthcare.

4. **Learn and Adapt**: Early phases validate assumptions about data availability, hospital onboarding friction, and user adoption patterns. Phase 2 and Phase 3 scoping should be refined based on Phase 1 learnings.

5. **Measurable Progress**: Each phase defines specific KPIs and success criteria that stakeholders can observe. "Infrastructure is ready" is not a milestone — "Finance team can self-serve revenue reports" is.

---

## 2.3 Phase Definitions

### Phase 1: Foundation & Pre-Sales Readiness

**Strategic Objectives**: Establish the data platform foundation, build the pre-sales sandbox demo, and deliver the executive dashboard. This phase makes MedicalPro demonstrable to prospective hospital clients.

**Key Capabilities**:
- Data ingestion pipeline (FHIR R4, HL7v2, CSV, JSON) with validation, standardization, and quarantine management (REQ-009)
- Module data configuration tool for output-first field requirements (REQ-013)
- Data quality governance dashboard with four-layer quality monitoring and audit logging (REQ-008)
- Executive dashboard with KPI cards, revenue cycle chart, expense breakdown, payer mix analysis, and foresight ROI preview (existing, already built)
- Self-service sandbox demo environment with synthetic data across all five modules, guided tour, and demo request form (REQ-007)
- Authentication, RBAC, and security foundation (JWT, role-based access, audit logging)

**Business Value & Outcomes**:
- Prospective hospital clients can self-serve a full platform demo through the sandbox — no sales engineering required
- Implementation consultants can define data requirements per hospital in one day using output-first configuration
- Data quality issues caught at ingestion rather than propagating to analytics
- KPIs: Sandbox demo available for client meetings; data ingestion pipeline processing 10,000 records/minute; quality scores visible at every pipeline stage

**Strategic Enablers**:
- Data ingestion pipeline provides the data foundation for all Phase 2 analytical modules
- Module configuration defines which fields each hospital must provide, smoothing onboarding
- Sandbox proves the platform concept and generates sales pipeline
- RBAC and audit logging establish the security baseline required for healthcare data

**Success Criteria**:
- Sandbox demo runs end-to-end with synthetic data across all five modules
- Data ingestion pipeline validates, standardizes, and loads hospital-format data (FHIR R4 at minimum)
- Module configuration exports data requirements documents (PDF/CSV) for hospital IT teams
- Quality dashboard shows scores at raw, processing, action, and simulation layers
- Zero TypeScript build errors; all routes render correctly

**Dependencies & Prerequisites**:
- AWS infrastructure provisioned (ECS/RDS/ElastiCache/Neo4j)
- Development environment and CI/CD pipeline established (GitHub Actions)
- Design system tokens finalized (MD3 color system, Manrope/Inter typography, Material Symbols)
- Synthetic data generation for all five modules validated for demo realism

---

### Phase 2: Core Operational Modules

**Strategic Objectives**: Deliver the five core analytical modules — staffing optimization, bed allocation, supply chain management, revenue/cost analysis, and anomaly detection — with predictive capabilities and module-specific dashboards.

**Key Capabilities**:
- Predictive staff allocation with 72-hour forecasting, constraint-aware optimization, and overtime cost projection (REQ-001)
- Strategic bed allocation with real-time ADT event tracking, 7-day demand forecasting, and reallocation recommendations (REQ-002)
- Supply chain optimization with demand forecasting, procurement recommendations, expiration tracking, and supplier analytics (REQ-003)
- Revenue and cost driver analysis with variance analysis, cost treemaps, waterfall charts, and AI-generated financial narratives (REQ-004)
- Operational anomaly detection with multi-method detection, real-time alerting (SSE), Claude-powered severity classification, and root cause analysis (REQ-005)

**Business Value & Outcomes**:
- Hospital administrators receive staffing recommendations 72 hours in advance, reducing overtime by 15–20%
- Bed occupancy maintained in the 85–92% optimal range through demand-driven reallocation
- Supply chain stockouts prevented; expired inventory waste reduced by 25%
- Finance team self-serves revenue/cost analysis with AI-generated explanations — report turnaround drops from days to minutes
- Operational anomalies surfaced within 5 minutes of detection with severity classification and recommended actions
- KPIs: 5 module dashboards live; prediction accuracy >80% after calibration; recommendation adoption rate >40%

**Strategic Enablers**:
- All five module predictive models feed the simulation engine in Phase 3
- Anomaly detection provides the monitoring layer that makes the platform trustworthy
- Module-specific data flows validate the ingestion pipeline built in Phase 1
- AI-generated narratives demonstrate Claude API integration patterns reused in Phase 3

**Success Criteria**:
- All five modules operational with predictive capabilities
- Staff allocation predictions include coverage gap warnings and overtime projections
- Bed allocation uses real-time ADT events for occupancy tracking
- Revenue analysis includes drill-down from summary KPIs to individual cost/revenue lines
- Anomaly detection covers all five operational modules with <15% false positive rate
- Hospital source system integrations (HR, EHR, procurement, finance) established

**Dependencies & Prerequisites**:
- Phase 1 data ingestion pipeline operational and validated
- Hospital source system APIs accessible (Workday/Kronos for HR, Epic/Cerner for EHR, procurement system, financial system)
- Neo4j graph model established with department adjacency, patient flow paths, and supplier networks
- Redis caching layer operational for real-time state management

---

### Phase 3: Intelligence & Simulation Layer

**Strategic Objectives**: Deliver the platform's core differentiators — what-if foresight simulation, cross-module impact visualization, prescriptive recommendations, and natural language query — that position MedicalPro as a prescriptive analytics platform rather than a descriptive dashboard.

**Key Capabilities**:
- What-if foresight simulation with cross-module cascade computation, confidence intervals, scenario comparison, natural language input, and PDF export (REQ-006)
- Cross-module impact visualization with D3.js force-directed graph, animated cascade paths, and impact weight matrix (REQ-011)
- Prescriptive action recommendations with weighted priority scoring, accept/defer/dismiss workflow, outcome tracking, and monthly learning loop (REQ-012)
- Natural language query interface with Claude tool-use for query decomposition, streaming progressive rendering, voice input, and healthcare guardrails (REQ-010)

**Business Value & Outcomes**:
- Hospital directors simulate high-stakes decisions (staff reductions, ward closures, budget cuts) and see projected cross-module impacts with confidence intervals before committing
- Cascading effects visible across module boundaries — a staffing change's impact on bed capacity, revenue, and supply chain traced in one visualization
- Prescriptive recommendations tell administrators what to do, not just what happened — with reasoning, expected outcomes, and priority scores
- Non-technical users ask questions in plain English and receive answers with auto-generated visualizations
- KPIs: Simulations complete in <30 seconds; director decision confidence improves (survey); recommendation adoption rate >50%; NLP query success rate >80%

**Strategic Enablers**:
- Simulation engine becomes the primary differentiator for enterprise sales
- Learning loop on recommendations improves platform intelligence over time
- NLP interface reduces dependency on data analysts, enabling broader adoption
- Cross-module visualization validates the Neo4j graph investment

**Success Criteria**:
- Simulation engine computes cascade impacts across 4+ module hops
- Directors can compare 2–4 scenarios side-by-side with confidence intervals
- Recommendations generated from all five module predictive outputs
- NLP queries answered with data citations and appropriate visualizations
- Healthcare guardrails block 100% of PHI-exposing NLP queries
- Outcome tracking operational: predicted vs. actual impact measured for accepted recommendations

**Dependencies & Prerequisites**:
- Phase 2 all five operational modules delivering predictive outputs
- Neo4j impact weight matrix populated from Phase 2 historical data
- Claude API integration patterns validated in Phase 2 (financial narratives, anomaly classification)
- BullMQ queue infrastructure handling 24 queue types with priority and retry

---

### Phase 4: Scale & Optimization

**Strategic Objectives**: Optimize the platform for multi-hospital deployment, operational efficiency, and advanced capabilities based on learnings from Phases 1–3.

**Key Capabilities**:
- Multi-tenant architecture for managing multiple hospital instances
- Advanced ML models trained on accumulated hospital data (replacing initial statistical methods where beneficial)
- Performance optimization: query caching, materialized view tuning, read replicas for analytical workloads
- Enhanced sandbox capabilities: industry-specific synthetic data profiles, longer demo sessions, multi-user sandbox
- Operational dashboards for platform health, API usage, and cost monitoring
- Mobile-responsive interface optimization

**Business Value & Outcomes**:
- Platform supports multiple hospital deployments without per-hospital infrastructure duplication
- ML models outperform initial statistical forecasts as training data accumulates
- Platform operational costs reduced through caching, query optimization, and compute right-sizing
- KPIs: <2-second page load for all dashboards; multi-hospital deployment supported; ML model accuracy exceeds statistical baseline by >10%

**Strategic Enablers**:
- Multi-tenancy enables SaaS revenue model at scale
- Operational dashboards ensure platform reliability as client base grows
- ML model investments sustained by accumulated training data from earlier phases

**Success Criteria**:
- Second hospital successfully onboarded using the standard implementation playbook
- Platform operational metrics (uptime, response time, error rate) meet SLA targets
- Learning loop demonstrates measurable improvement in recommendation accuracy over time

**Dependencies & Prerequisites**:
- Phases 1–3 complete and stable
- Minimum 6 months of operational data from first hospital for ML model training
- Multi-tenant infrastructure provisioned (schema isolation, tenant-aware routing)

---

## 2.4 Cross-Phase Dependencies

### Critical Path Dependencies

| Dependency | Source Phase | Target Phase | Description |
|---|---|---|---|
| Data ingestion pipeline | Phase 1 | Phase 2 | All five modules require validated, standardized data from the ingestion pipeline |
| Module configuration schema | Phase 1 | Phase 2 | Field requirements defined in Phase 1 drive what data each module expects |
| RBAC and security foundation | Phase 1 | Phase 2 | Financial module requires role-based access control before deployment |
| Neo4j graph model | Phase 1 (setup) / Phase 2 (populate) | Phase 3 | Cascade computation requires populated graph with relationship weights |
| Five module predictive outputs | Phase 2 | Phase 3 | Simulation, recommendations, and NLP queries consume predictive model outputs |
| Claude API integration patterns | Phase 2 (narratives, classification) | Phase 3 (NLP, recommendations) | Phase 2 validates Claude integration; Phase 3 expands usage |
| Historical operational data | Phase 2 (accumulation) | Phase 3 / Phase 4 | Impact weight calibration and ML training require accumulated data |

### Key Decision Points

1. **After Phase 1**: Validate sandbox demo effectiveness with prospective clients. If conversion rates are low, reassess demo UX and synthetic data realism before proceeding to Phase 2.
2. **During Phase 2**: Assess which hospital source system integrations are feasible. If a hospital cannot provide real-time ADT events, bed allocation must fall back to batch updates — this affects the Phase 2 scope.
3. **After Phase 2**: Evaluate whether statistical forecasting methods are sufficient or whether custom ML model investment (Phase 4) should be accelerated. Data volume and prediction accuracy drive this decision.
4. **During Phase 3**: Validate NLP query success rates. If the Claude API tool-use pattern produces <70% successful query decomposition, consider query templates or guided query builders as a fallback.

### Parallel Work Streams

- **Phase 1 + Phase 2 overlap**: Module 06 (Simulations) MVP frontend is already complete. Backend API development can begin in late Phase 1 while other Phase 2 modules are in progress.
- **Phase 2 module parallelism**: Modules 01–04 (staffing, beds, supply, finance) can be developed in parallel by separate teams. Module 05 (anomaly detection) should follow slightly behind because it monitors the other four.
- **Phase 3 partial overlap**: NLP query interface (REQ-010) can begin once 2–3 operational modules are delivering data, without waiting for all five.

---

## 2.5 Value Milestones

| Milestone | Phase | Description |
|---|---|---|
| **M1: Sandbox Demo Live** | Phase 1 | Self-service sandbox available for prospective client demos. First external-facing capability. |
| **M2: First Hospital Data Onboarded** | Phase 1 | Data ingestion pipeline processing real hospital data (FHIR R4). Module configuration complete. |
| **M3: Quality Baseline Established** | Phase 1 | Data quality scores computed at all four pipeline layers. Benchmarks configured. |
| **M4: Staffing & Bed Modules Live** | Phase 2 | First two operational modules delivering predictions and recommendations to hospital administrators. |
| **M5: Full Five-Module Analytics** | Phase 2 | All five core modules operational. Hospital administrators using module dashboards daily. |
| **M6: First Simulation Run** | Phase 3 | Hospital director runs first production what-if scenario with cross-module cascade. |
| **M7: NLP Queries Available** | Phase 3 | Non-technical users asking questions in plain English and receiving visualized answers. |
| **M8: Prescriptive Loop Closed** | Phase 3 | Recommendations generated, accepted, implemented, and outcomes measured. Learning loop operational. |
| **M9: Second Hospital Onboarded** | Phase 4 | Multi-tenant deployment validated with second hospital client. |
| **M10: ML Models Deployed** | Phase 4 | Custom-trained ML models outperforming initial statistical forecasting methods. |

### Stakeholder Demos

- **Post-Phase 1**: Sandbox demo walkthrough with prospective hospital leadership teams.
- **Mid-Phase 2**: Live staffing and bed allocation module demo with Farrer Park Hospital administrators using real data.
- **Post-Phase 2**: Full five-module analytical dashboard demo to hospital director and finance team.
- **Mid-Phase 3**: Foresight simulation demo — director-led scenario (e.g., "What if we close Ward C?") with live cascade results.
- **Post-Phase 3**: Executive presentation of prescriptive analytics ROI — accepted recommendations and measured outcomes.

---

*See [Data Platform Strategy](./data-platform-strategy.md) for architectural decisions and technology approach. See [Risk & Constraint Register](./risk-constraint-register.md) for risks and constraints affecting this roadmap.*
