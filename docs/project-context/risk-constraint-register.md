# Risk & Constraint Register

## 3.1 Overview

This register captures the risk landscape, assumptions, and boundary conditions for the MedicalPro Clinical Analytics OS initiative at Farrer Park Hospital. It should be read alongside the [Data Platform Strategy](./data-platform-strategy.md) and [Value Delivery Roadmap](./value-delivery-roadmap.md).

**Risk management approach**:
- Risks reviewed bi-weekly during sprint retrospectives
- High/Critical impact risks reviewed weekly by project lead
- Risk owners responsible for monitoring and executing mitigation strategies
- Risks retired when likelihood drops to negligible or when the associated phase completes without the risk materializing

---

## 3.2 Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Owner Role | Phase Affected |
|---------|-----------------|------------|--------|---------------------|------------|----------------|
| R-001 | Hospital source system APIs (EHR, HR, procurement) are unavailable, undocumented, or rate-limited, delaying data ingestion | High | Critical | Build multi-format ingestion pipeline (FHIR R4, HL7v2, CSV, JSON) to accommodate varied integration maturity. Use synthetic data in Phase 1 sandbox while negotiating API access. Design ingestion to be format-agnostic. | Data Engineer | Phase 1–2 |
| R-002 | Healthcare data fragmentation — inconsistent units (mmHg vs. kPa), coding systems, and field names across hospital departments | High | High | Standardization engine converts units at ingestion. JSONLogic validation rules catch format inconsistencies. Quarantine-first design isolates invalid records without blocking pipeline. | Data Engineer | Phase 1 |
| R-003 | Claude API availability, latency, or pricing changes disrupt AI-powered features (narratives, classification, NLP, recommendations) | Medium | High | Abstract AI interactions behind a service interface that can be retargeted to alternative LLM providers. Cache AI responses where appropriate (narrative caching with 24-hour TTL, query caching with 5-minute TTL). Maintain statistical fallback methods for anomaly detection. | Platform Architect | Phase 2–3 |
| R-004 | Neo4j graph model complexity — cascade traversal becomes expensive as relationship density grows, causing simulation timeouts | Medium | High | Cascade depth limited to 4 hops. Impact weights pruned (low-weight edges excluded from traversal). Pre-materialized paths for common transfer routes. Server-side graph layout computation with Redis caching. Monitor query performance and set timeout at 30 seconds. | Backend Engineer | Phase 3 |
| R-005 | Low user adoption — hospital administrators unfamiliar with predictive/prescriptive analytics do not use the platform | Medium | Critical | Natural language query interface removes technical barriers. Guided tour in sandbox demos introduces concepts gradually. Prescriptive recommendations proactively surface insights. Executive dashboard provides familiar summary view as entry point. | Product Manager | Phase 2–3 |
| R-006 | Data quality insufficient for meaningful predictions — hospitals provide incomplete or inaccurate data | High | High | Output-first configuration (Module 13) makes required fields explicit before data collection begins. Capability resolver shows which analytics are limited when fields are missing. 70/30 standard/custom ratio accommodates partial data. Quality dashboard tracks scores over time. | Implementation Consultant | Phase 1–2 |
| R-007 | Scope creep — 13 modules with 100+ API endpoints and 200+ frontend components exceeds development capacity | High | High | Phased delivery with clear Phase 1/2/3 boundaries. Phase 1 prioritizes sandbox (pre-sales) and ingestion (foundation). Each phase delivers end-to-end vertical slices rather than partial horizontal layers. Feature scope locked per phase; additions deferred to next phase. | Project Lead | All Phases |
| R-008 | Healthcare regulatory compliance (PDPA Singapore, data residency, audit requirements) misunderstood or underestimated | Medium | Critical | Hash-chained append-only audit log with 7-year retention designed from Phase 1. RBAC with role-based data access. Column-level encryption for sensitive financial data. Export watermarking. AWS Singapore region for data residency. Legal review of PDPA requirements before Phase 2 (real data). | Compliance Lead | Phase 1–2 |
| R-009 | Prediction accuracy below stakeholder expectations, eroding trust in the platform | Medium | High | Confidence intervals displayed on all predictions and simulations. Statistical methods (Z-score, IQR, moving average) used for initial forecasting — well-understood and interpretable. Learning loop (Module 12) adjusts recommendation weights based on outcome tracking. Monthly accuracy reporting. | Data Scientist | Phase 2–3 |
| R-010 | Sandbox demo fails to convert prospects — synthetic data feels unrealistic or demo UX is confusing | Medium | High | Deterministic synthetic data per session seed for reproducibility. Guided tour (5 steps) introduces platform concepts. Feature exploration tracking shows progress. Demo request form with CRM integration captures warm leads. Post-demo survey to identify UX friction. | Product Manager | Phase 1 |
| R-011 | BullMQ queue saturation under load — 24 queue types processing concurrent jobs may overwhelm Redis | Low | High | Queue-specific concurrency limits. Priority queues for critical workloads (anomaly detection, simulation). Exponential backoff retry with dead-letter queues for failed jobs. Redis memory monitoring with alerts. Horizontal scaling of queue workers if needed. | DevOps Engineer | Phase 2–3 |
| R-012 | NLP query decomposition produces incorrect SQL/Cypher, returning wrong answers or failing silently | Medium | High | Healthcare guardrails block harmful queries. Confidence scoring on all NLP responses. Data citations trace every answer back to source data. User feedback mechanism for incorrect answers. Redis query cache prevents repeated bad queries. Rate limiting (30 queries/user/hour). | AI Engineer | Phase 3 |
| R-013 | Neo4j and PostgreSQL data synchronization drift — graph database reflects stale or inconsistent state relative to primary database | Medium | Medium | Event-driven sync: PostgreSQL changes trigger Neo4j updates via BullMQ jobs. Periodic reconciliation job validates graph consistency. Neo4j scoped strictly to relationship data — all authoritative operational data remains in PostgreSQL. | Backend Engineer | Phase 2–3 |

---

## 3.3 Assumptions

**A-001**: Farrer Park Hospital (and target clients) can provide data in at least one supported format: FHIR R4, HL7v2, CSV, or JSON. Custom format adapters may be required but are not budgeted.

**A-002**: AWS infrastructure (ECS, RDS PostgreSQL, ElastiCache Redis, Neo4j) will be provisioned and accessible before Phase 1 development begins.

**A-003**: Hospital stakeholders (administrators, directors, finance team) are available for bi-weekly feedback sessions during Phase 2 module development to validate analytical outputs.

**A-004**: Claude API (Anthropic) remains available and commercially viable throughout the project. Pricing does not become prohibitive for the expected query volume (~1,000–5,000 AI-augmented interactions per day per hospital).

**A-005**: The team has sufficient TypeScript/NestJS/React skills to execute the implementation plan. Neo4j and Claude API integration will require learning investment.

**A-006**: A single-hospital deployment model is sufficient for Phase 1–3. Multi-tenant architecture (Phase 4) is not required until the second hospital client is onboarded.

**A-007**: Synthetic data generated for the sandbox is sufficiently realistic to demonstrate meaningful predictions and simulations. Validation against real hospital data patterns will occur during Phase 1.

**A-008**: Hospital IT departments will cooperate with API access requests for source systems (EHR, HR, procurement, finance) within the Phase 2 timeline.

**A-009**: Singapore PDPA (Personal Data Protection Act) requirements can be met through the platform's existing security design (encryption, RBAC, audit logging, data residency). No unique healthcare-specific regulatory framework beyond PDPA applies.

**A-010**: The Kimball (output-first) approach to data requirements will be accepted by hospital implementation teams. Hospitals accustomed to providing "everything they have" may need change management support.

---

## 3.4 Constraints

**C-001**: Data must remain within the Singapore AWS region to comply with healthcare data residency expectations and PDPA requirements.

**C-002**: All AI-generated content (narratives, recommendations, NLP answers) must pass through healthcare-specific guardrails before being surfaced to users. No raw LLM output is presented directly.

**C-003**: The platform must operate without requiring hospitals to install on-premises software. All integrations must work through standard APIs (FHIR R4, HL7v2, REST) or file-based transfer (CSV, SFTP).

**C-004**: Financial data requires strict role-based access control. Only users with DIRECTOR, CFO, or FINANCE_ANALYST roles may access revenue/cost analytics (Module 04). No exceptions.

**C-005**: The 70/30 standard/custom field ratio for module configuration must be maintained. Custom fields exceeding 30% of total fields will trigger a configuration review to prevent model accuracy degradation.

**C-006**: Sandbox demo sessions are time-limited (4 hours, maximum 1 extension of 1 hour) and simulation-limited (10 simulations per session) to manage compute costs and encourage demo-to-sales conversion.

**C-007**: The platform's frontend must use the established design system: MD3 color tokens, Manrope (headlines) + Inter (body) typography, Material Symbols Outlined icons, and Tailwind CSS 4 utility classes. No alternative design systems or component libraries.

**C-008**: All background job processing uses BullMQ backed by Redis. No additional job processing infrastructure (Kafka, SQS, Celery) is introduced before Phase 4.

**C-009**: Audit logs are immutable — no UPDATE or DELETE operations permitted on the audit log table. Hash-chained entries provide tamper evidence. Monthly partitioning with 7-year retention.

**C-010**: Maximum concurrent sandbox sessions limited to 50 globally. Each session consumes isolated database schema, Redis namespace, and Neo4j partition resources.

---

## 3.5 Risk Monitoring & Review

### Review Cadence

| Review Type | Frequency | Participants | Scope |
|---|---|---|---|
| Sprint risk review | Bi-weekly | Engineering team, project lead | Active risks in current phase; new risks identified |
| High-impact risk review | Weekly | Project lead, platform architect | R-005 (adoption), R-007 (scope creep), R-008 (compliance) |
| Phase gate review | Per phase completion | Full team, stakeholders | Retire resolved risks; assess emerging risks for next phase |
| Quarterly strategic review | Quarterly | Leadership, product manager | Cross-phase risks, assumption validation, constraint reassessment |

### Risk Ownership

- **Project Lead**: Scope management (R-007), resource allocation, phase gate decisions
- **Platform Architect**: Technology risks (R-003, R-004, R-011, R-013), architecture decisions
- **Data Engineer**: Data integration (R-001, R-002), ingestion pipeline risks
- **Implementation Consultant**: Hospital onboarding (R-006, A-008, A-010), data requirements
- **Product Manager**: Adoption (R-005), sandbox conversion (R-010), stakeholder alignment
- **AI Engineer**: Claude API integration (R-003, R-012), guardrail effectiveness
- **Compliance Lead**: Regulatory (R-008), data residency (C-001), audit requirements (C-009)

### Escalation Process

1. **Risk owner** identifies likelihood or impact increase → updates register and notifies project lead
2. **Project lead** assesses whether mitigation strategy is sufficient → if not, escalates to phase gate review
3. **Phase gate review** decides: adjust scope, allocate additional resources, or accept risk with documented rationale
4. **Critical impact risks** (R-001, R-005, R-008) escalate directly to leadership if mitigation fails

### Risk Retirement Criteria

A risk is retired (removed from active monitoring) when:
- The associated phase completes without the risk materializing
- The mitigation strategy has been fully implemented and proven effective
- The underlying condition changes (e.g., API access granted, regulatory requirement clarified)
- The risk is superseded by a more specific risk that better captures the threat

Retired risks are moved to an appendix with the date and reason for retirement, preserving the audit trail.

---

*See [Data Platform Strategy](./data-platform-strategy.md) for the architectural decisions and technology approach that inform these risks. See [Value Delivery Roadmap](./value-delivery-roadmap.md) for the phased implementation plan referenced in risk phase assignments.*
