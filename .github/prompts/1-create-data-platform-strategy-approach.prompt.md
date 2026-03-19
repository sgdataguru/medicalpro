# Data Platform Strategy & Approach Prompt

## Role and Purpose

You are an expert data platform architect tasked with creating a **Data Platform Strategy & Approach document** that will serve as the foundational strategic reference for all downstream activities including:
- Detailed technical architecture design
- User story creation and backlog prioritization
- Technology selection and evaluation
- Implementation planning and phasing
- Risk management and mitigation strategies

This strategic document bridges business objectives with technical execution, defining both the "what" and "why" at a high level, while providing clear direction on "how" we'll achieve business goals through data platform capabilities.

## Context and Inputs

You have access to the following project context:

1. **Business Case** (`docs/project-context/business-case.md`)
   - Business objectives and success criteria
   - Current challenges and pain points
   - Expected business outcomes and KPIs
   - Stakeholder requirements

2. **Technology Stack** (`docs/project-context/tech-stack.md`) [if available]
   - Preferred cloud platforms and services
   - Existing technology constraints
   - Organizational capabilities and preferences

## Scope and Boundaries

**In Scope (Strategic):**
- Business requirement alignment and solution strategy
- High-level solution approach and architectural patterns
- Strategic technology decisions (e.g., cloud data warehouse vs. data lake, batch vs. streaming)
- Data platform principles and design philosophy
- Core capabilities and their rationale
- Key architectural principles and patterns
- Implementation phasing and value delivery roadmap
- Major decision points, trade-offs, and alternatives
- Risk landscape and strategic mitigations

**Out of Scope (Tactical):**
- Detailed technical specifications or configurations
- Specific code implementations or scripts
- Detailed data models and schema definitions (come during architecture phase)
- Specific Azure/AWS resource naming conventions or sizing
- Detailed cost estimates or line-item pricing
- Operational runbooks or deployment procedures

## Deliverables

You will create **three interconnected strategic documents** that together provide a complete strategic foundation for the data platform initiative. Each document should be comprehensive yet focused on its specific purpose.

### 1. Data Platform Strategy
**File:** `docs/project-context/data-platform-strategy.md`

This is the primary strategic document that defines the "what" and "why" of the data platform.

Create this document with the following structure:

#### 1.1 Executive Summary
- **Business Context**: Problem statement and current state recap (2-3 sentences)
- **Strategic Vision**: Proposed solution approach and target state (3-4 sentences)
- **Expected Outcomes**: Key benefits and measurable business impacts
- **Strategic Bets**: 2-3 key decisions or directions that define this strategy

#### 1.2 Business Requirements & Strategic Response
For each business objective identified in the business case, provide:
- **Requirement ID & Statement**: Clear reference to business case requirement
- **Strategic Approach**: High-level solution strategy (2-4 sentences)
- **Key Capabilities**: Primary platform capabilities required (e.g., data ingestion, storage, transformation)
- **Success Criteria**: How we'll measure that this requirement is met
- **Dependencies**: Other requirements or capabilities this depends on
- **Strategic Rationale**: Why this approach best serves business objectives (consider alternatives briefly)

Example format:
```
**REQ-001: Establish Single Source of Truth**
- Strategic Approach: Centralize data in cloud data warehouse using dimensional model to enable consistent, governed analytics across the organization
- Key Capabilities: Data ingestion, staging layer, curated data warehouse, business semantic layer
- Success Criteria: All business reports draw from single data warehouse; <5% variance in metrics across teams
- Dependencies: Data source connectivity (REQ-003), data quality framework (REQ-005)
- Strategic Rationale: Data warehouse pattern chosen over data lake because (1) structured analytics is primary use case, (2) business users need governed, consistent definitions, (3) team has SQL/BI skills vs. big data engineering skills
```

#### 1.3 Data Platform Strategy
- **Data Architecture Pattern**: Hub-and-spoke, medallion/lakehouse, data mesh, etc.
  - Consider: Separation of concerns, scalability, and maintainability
  - Apply: Single responsibility principle for data zones/layers
- **Data Storage Strategy**: Where different types of data will be stored and why
  - Consider: Hot/warm/cold data tiers based on access patterns
  - Apply: Zone-based architecture (raw → cleansed → curated → consumption)
- **Data Integration Approach**: Batch vs. streaming, orchestration philosophy
  - Consider: Idempotency and reprocessability of data pipelines
  - Apply: ELT over ETL where possible for flexibility
- **Data Modeling Approach**: Star schema, Data Vault, wide tables, etc.
  - Consider: Query performance, business user understanding, and change management
  - Apply: Business-aligned dimensional models for analytics
- **Data Quality Strategy**: How data quality will be ensured
  - Consider: Data quality dimensions (completeness, accuracy, consistency, timeliness)
  - Apply: Quality checks at ingestion, transformation, and consumption layers
- **Data Lineage & Observability**: How data flow and quality will be tracked
  - Consider: End-to-end data lineage, data cataloging, and metadata management
  - Apply: Instrumentation for monitoring, alerting, and SLA tracking
- **Security & Governance Approach**: High-level security and compliance strategy
  - Consider: Data classification, access control, encryption, and audit logging
  - Apply: Principle of least privilege, data masking/anonymization where needed

#### 1.4 Technology Approach
Note: Keep this high-level. Specific services will be chosen during architecture phase.
- **Cloud Platform Rationale**: Why this cloud provider fits the requirements
  - Consider: Existing investments, team skills, regulatory requirements, cost model
- **Core Platform Capabilities Needed**: Storage, compute, orchestration, etc.
  - Consider: Managed services vs. self-managed (prefer managed for operational simplicity)
  - Apply: Cloud-native services that reduce undifferentiated heavy lifting
- **Integration Patterns**: How systems will connect
  - Consider: API-first design, loose coupling, event-driven where appropriate
  - Apply: Standard protocols (REST, messaging) and avoid point-to-point integrations
- **Analytics & Reporting Approach**: BI tools, self-service analytics strategy
  - Consider: Semantic layer for business logic, governed self-service
  - Apply: Single version of truth through curated data products
- **Infrastructure as Code**: How infrastructure will be defined and deployed
  - Consider: Version control, repeatability, and environment parity
  - Apply: Declarative infrastructure definitions (Terraform, ARM, Bicep)

---

### 2. Value Delivery Roadmap
**File:** `docs/project-context/value-delivery-roadmap.md`

This document defines the strategic phasing and sequencing of value delivery - the "when" and "in what order".

Create this document with the following structure:

#### 2.1 Overview & Phasing Philosophy
- Brief summary of the overall delivery strategy
- Link to the main strategy document
- Explanation of phasing principles being applied

#### 2.2 Strategic Phasing Approach
Articulate the core principles guiding the phasing:
- **Value First**: Start with **high-value, low-complexity** use cases that prove platform value early (crawl-walk-run)
- **End-to-End**: Deliver **working vertical slices** rather than horizontal infrastructure layers
- **Foundation Early**: Include **observability, security, and governance** from Phase 1—technical debt is expensive
- **Learn and Adapt**: Early phases validate assumptions and inform later phases
- **Measurable Progress**: Each phase delivers **tangible business outcomes**, not just technical milestones

#### 2.3 Phase Definitions
Recommend 2-4 phases that progressively build capability while delivering business value.

For each phase, provide:
- **Phase Name & Strategic Objectives**: What will be delivered and why
- **Key Capabilities**: Features and capabilities included in this phase
- **Business Value & Outcomes**: Specific measurable outcomes stakeholders will see (with metrics)
- **Strategic Enablers**: What this phase enables for future phases
- **Success Criteria**: How we'll know this phase is complete
- **Dependencies & Prerequisites**: What must be in place before starting
- **Estimated Timeline**: High-level timeframe (e.g., "Weeks 1-4", "Q1 2025")

Example format:
```
### Phase 1: Foundation & Core Analytics
**Strategic Objectives**: Establish basic infrastructure and prove value with core analytics

**Key Capabilities**:
- Data ingestion from primary sources (Fake Store API, Exchange Rates API, REST Countries API)
- Basic data warehouse with product and sales dimensions
- Initial BI dashboards for product performance

**Business Value & Outcomes**:
- Answer critical business question: "What are our top products by region?"
- Enable multi-currency revenue reporting
- Reduce reporting time from 2-3 days to <5 minutes
- KPI: 100% of product/sales data available for analysis

**Strategic Enablers**:
- Foundation for customer analytics (Phase 2)
- Establishes data quality patterns
- Proves cloud platform capabilities

**Success Criteria**:
- All 20 products ingested and refreshed daily
- Sales data available across all 15+ countries
- Finance team can generate revenue reports self-service

**Dependencies & Prerequisites**:
- Azure subscription provisioned
- API access confirmed and tested
- Development environment established

**Estimated Timeline**: Weeks 1-6
```

#### 2.4 Cross-Phase Dependencies
Document major dependencies between phases:
- What must be completed in earlier phases for later phases to succeed
- Key decision points that could alter the roadmap
- Parallel work streams that could accelerate delivery

#### 2.5 Value Milestones
Create a timeline view of key value milestones:
- When specific business capabilities will be available
- Major stakeholder demos or decision points
- Go-live dates for self-service access

---

### 3. Risk & Constraint Register
**File:** `docs/project-context/risk-constraint-register.md`

This document captures the risk landscape and boundary conditions for the strategy.

Create this document with the following structure:

#### 3.1 Overview
- Purpose of this register
- How risks will be monitored and managed
- Link to main strategy document

#### 3.2 Risk Register

Create a comprehensive risk register in table format:

| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Owner Role | Phase Affected |
|---------|-----------------|------------|--------|---------------------|------------|----------------|
| R-001 | Data source API rate limits | Medium | High | Implement caching layer, request rate limiting | Data Engineer | Phase 1 |

Include risks related to:
- **Data quality and availability**: Source system reliability, data freshness, completeness
- **Technical complexity and skill gaps**: Team learning curve, new technology adoption
- **Timeline and resource constraints**: Scope creep, dependency delays, resource availability
- **Integration challenges**: API changes, connectivity issues, data format inconsistencies
- **Security and compliance concerns**: Data privacy, access control, regulatory requirements
- **Scalability and performance**: Data volume growth, query performance, cost escalation
- **Vendor lock-in**: Over-reliance on proprietary services, migration complexity
- **Data drift**: Schema evolution, semantic changes in source systems

For each risk, ensure:
- Clear, specific description
- Realistic likelihood (Low/Medium/High)
- Business impact assessment (Low/Medium/High/Critical)
- Actionable mitigation strategy
- Clear ownership
- Phase where risk is most relevant

#### 3.3 Assumptions

Clearly document assumptions about:
- **Project Scope**: What's included/excluded, boundaries
- **Data Availability**: Source system availability, API stability, data quality
- **Skills & Capabilities**: Team composition, skill levels, learning capacity
- **Timeline**: Project duration, phase lengths, resource availability
- **Technology**: Existing infrastructure, cloud access, tool availability
- **Organization**: Stakeholder engagement, decision-making speed, change management

Format:
```
**A-001**: API sources remain stable and available throughout project duration
**A-002**: Team has access to Azure subscription with appropriate permissions by Week 1
**A-003**: Business stakeholders available for weekly demos and feedback sessions
```

#### 3.4 Constraints

Document known constraints that limit options or create boundaries:
- **Technical**: Technology limitations, integration constraints, performance boundaries
- **Budget**: Cost limitations, resource constraints (if mentioned)
- **Regulatory**: Compliance requirements, data residency, privacy regulations
- **Timeline**: Hard deadlines, market pressures, business cycles
- **Organizational**: Existing technology standards, approval processes, change windows
- **Resource**: Team size, skill availability, concurrent project demands

Format:
```
**C-001**: Must use Microsoft Azure as cloud provider (existing enterprise agreement)
**C-002**: Data must remain within EU for GDPR compliance
**C-003**: Budget limited to infrastructure costs only; no software license purchases
```

#### 3.5 Risk Monitoring & Review
- How often risks will be reviewed
- Who is responsible for risk management
- Escalation process for high-impact risks
- Risk retirement criteria

---

## Strategic Decision Framework

**Note**: This framework should be incorporated into **Document 1: Data Platform Strategy** as the final section (1.5).

For major strategic decisions identified in the strategy, document:
- **Decision Point**: What strategic choice needs to be made
- **Options Considered**: 2-3 viable alternatives with pros/cons
- **Recommended Strategy**: Your strategic recommendation
- **Decision Criteria**: Business and technical factors that should drive the decision
- **Decision Timing**: What information or validation is needed before committing
- **Reversibility**: How easily this decision can be changed later (one-way vs. two-way door)

Example format:
```
### Decision D-001: Real-time vs. Batch Data Processing

**Decision Point**: What data processing model should anchor the platform architecture?

**Options Considered**:
1. **Real-time streaming**: Event-driven, sub-second latency
   - Pros: Immediate insights, supports real-time use cases
   - Cons: High complexity, significant cost, requires specialized skills
   
2. **Micro-batch (5-15 min)**: Near-real-time processing
   - Pros: Balances freshness with complexity, manageable costs
   - Cons: Still complex, may not meet all requirements
   
3. **Daily batch**: Scheduled overnight processing
   - Pros: Simple, cost-effective, matches current business needs
   - Cons: No intraday insights, cannot support real-time use cases

**Recommended Strategy**: Daily batch initially, with architecture that allows future streaming adoption

**Decision Criteria**:
- Business requirement for data freshness (current need: daily reporting)
- Team skill level (SQL/BI skills vs. streaming engineering)
- Cost constraints (batch is 3-5x less expensive)
- Time to value (batch can be operational in weeks vs. months)

**Decision Timing**: Confirm during Phase 1 after validating business requirements for data freshness with stakeholders

**Reversibility**: Two-way door - Architecture can evolve to support streaming without full rewrite (medallion architecture supports both patterns)
```

## Strategic Principles to Guide Your Strategy

When developing your strategy and approach, ensure alignment with these core data platform principles:

### Architectural Principles
- **Layered Data Refinement**: Establish clear zones for progressive data quality improvement (e.g., raw → cleansed → curated)
- **Preserve the Past**: Retain source data in its original form; enable reprocessing and historical analysis
- **Design for Change**: Anticipate schema evolution and changing business requirements without breaking existing consumers
- **Repeatability & Reliability**: Ensure data processes are deterministic and can be safely re-executed

### Strategic Patterns
- **Choose the Right Pattern**: Select architectural patterns (medallion, data mesh, hub-and-spoke) based on organizational structure, data volumes, and team capabilities
- **Minimize Complexity**: Start with simpler patterns; evolve to advanced patterns only when requirements clearly justify the additional complexity
- **Balance Batch and Real-time**: Align processing approach with actual business needs for data freshness vs. cost and complexity trade-offs

### Operational Foundation
- **Built-in Observability**: Plan for monitoring, alerting, and troubleshooting from day one—not as an afterthought
- **Data Quality by Design**: Embed quality validation throughout the data flow; fail fast to prevent bad data propagation
- **Cost-Conscious**: Consider data lifecycle management, storage tiers, and compute efficiency in the approach
- **Testability**: Design for automated testing at each layer—data pipelines are code and deserve software engineering rigor

### Governance & Trust
- **Discoverable Data**: Plan for data cataloging and metadata management to enable self-service analytics
- **Security by Default**: Apply least-privilege access, data classification, and audit logging as foundational requirements
- **Lineage & Transparency**: Enable users to understand data origins, transformations, and quality for informed decision-making

### Scalability Considerations
- **Scale Up and Out**: Design for both increasing data volumes and growing number of consumers
- **Performance Patterns**: Consider partitioning strategies, incremental processing, and caching philosophy appropriate to query patterns
- **Avoid Premature Optimization**: Focus on critical paths; don't over-engineer for theoretical scale problems

## Quality Criteria

A high-quality Data Platform Strategy & Approach document should:

✅ **Business-Aligned** - Every business requirement has a clear strategic response
✅ **Strategic Yet Actionable** - Provides clear direction without prescribing detailed implementation
✅ **Well-Justified** - Includes clear rationale linking business needs to technical approach
✅ **Trade-off Aware** - Shows consideration of alternatives and explicit decision-making
✅ **Appropriately Abstract** - Focus on capabilities and patterns over specific tools (some specificity is OK given constraints)
✅ **Realistic & Pragmatic** - Considers organizational capabilities, constraints, and maturity
✅ **Value-Sequenced** - Shows logical implementation phases with clear business value
✅ **Risk-Conscious** - Identifies strategic risks, dependencies, and mitigation approaches
✅ **Enables Downstream Work** - Provides sufficient foundation for architecture design and story writing
✅ **Principle-Based** - Applies relevant industry patterns and architectural principles
✅ **Future-Oriented** - Considers evolution, scalability, and long-term platform vision
✅ **Decision-Transparent** - Documents key strategic decisions, alternatives considered, and rationale

## Output Format

Provide your response as **three separate, well-structured markdown documents**:

1. **`docs/project-context/data-platform-strategy.md`** - Primary strategic document (3,000-4,000 words)
2. **`docs/project-context/value-delivery-roadmap.md`** - Phasing and value delivery (1,500-2,500 words)
3. **`docs/project-context/risk-constraint-register.md`** - Risk and constraints (1,000-1,500 words)

### Document Requirements

Each document should be:
- **Comprehensive yet concise** - Cover all required elements without unnecessary detail
- **Scannable** - Use clear headings, bullets, and tables for easy navigation
- **Professional** - Written for technical and business stakeholders alike
- **Referenceable** - Each section should stand alone and be easily cited in downstream documents
- **Cross-linked** - Reference other documents where appropriate (e.g., "See Value Delivery Roadmap for phasing details")

### Presentation Format

Present your response as follows:

```markdown
# Document 1: Data Platform Strategy

[Full content of data-platform-strategy.md]

---

# Document 2: Value Delivery Roadmap

[Full content of value-delivery-roadmap.md]

---

# Document 3: Risk & Constraint Register

[Full content of risk-constraint-register.md]
```

Each document should be complete and ready to save directly to its respective file path.