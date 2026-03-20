# Component Specifications

This document provides detailed specifications for every major component in the MedicalPro platform architecture. For the high-level overview and architectural diagrams, see [Architecture Overview](../../../docs/architecture/overview.md).

---

## 1. PostgreSQL — Primary Relational Database

### Purpose and Functionality

PostgreSQL serves as the authoritative store for all operational, analytical, and audit data. It hosts dimensional models (Kimball methodology) for the five core modules, stores quality assessment results, configuration versions, recommendation lifecycle data, and the tamper-evident audit log.

### Technology Choice and Rationale

**AWS RDS PostgreSQL 16+** — chosen for:
- Mature OLTP/OLAP capability in a single engine (no separate analytical database needed at current scale).
- Materialized views for pre-computed aggregations (consumption trends, financial summaries, quality scores).
- Table partitioning for audit log retention (monthly partitions, 7-year lifecycle).
- Native JSON/JSONB support for semi-structured data (validation rule expressions, configuration snapshots).
- `pgcrypto` extension for column-level encryption of sensitive financial figures.

### Configuration Requirements

| Parameter | Value | Rationale |
|---|---|---|
| Instance class | `db.r6g.xlarge` (production) / `db.t4g.medium` (dev) | 4 vCPU / 32 GB RAM handles concurrent analytical queries |
| Storage | gp3, 500 GB initial, auto-scaling to 2 TB | gp3 provides consistent IOPS without provisioned pricing |
| Multi-AZ | Enabled (production) | Automatic failover for high availability |
| Read replicas | 1 (production) | Offload analytical queries and report generation |
| Backup retention | 35 days with point-in-time recovery | Supports audit compliance and disaster recovery |
| Parameter group tuning | `work_mem=256MB`, `shared_buffers=8GB`, `effective_cache_size=24GB` | Optimized for analytical query patterns |

### Database Organization

```
medicalpro_db/
├── public/                          # Core operational tables
│   ├── staff_members                # HR records, roles, availability
│   ├── shift_assignments            # Shift schedules and actuals
│   ├── staffing_recommendations     # Predictive allocation outputs
│   ├── beds                         # Bed inventory and status
│   ├── wards                        # Ward configurations
│   ├── occupancy_snapshots          # 15-minute occupancy aggregations
│   ├── bed_forecasts                # 7-day demand predictions
│   ├── supply_items                 # Inventory catalog
│   ├── inventory_levels             # Current stock levels
│   ├── consumption_records          # Usage tracking
│   ├── financial_periods            # Fiscal period definitions
│   ├── revenue_lines                # Revenue by department/category
│   ├── cost_lines                   # Expenses by department/category
│   ├── budget_lines                 # Budget targets
│   ├── anomaly_alerts               # Detected anomalies
│   ├── scenarios                    # Simulation scenario definitions
│   ├── simulation_results           # Completed simulation outputs
│   ├── recommendations              # Prescriptive action items
│   ├── recommendation_outcomes      # Post-implementation tracking
│   ├── nl_queries                   # NLP query logs
│   ├── conversations                # Multi-turn NLP sessions
│   ├── module_configurations        # Per-hospital field definitions
│   ├── quality_scores               # Per-module quality assessments
│   ├── quality_issues               # Data quality issue tracker
│   ├── quality_benchmarks           # Configurable thresholds
│   ├── ingestion_jobs               # Pipeline job records
│   ├── quarantine_records           # Failed validation records
│   └── validation_rules             # JSONLogic rule definitions
├── audit/                           # Immutable audit schema
│   └── governance_audit_log         # Hash-chained, append-only, monthly partitions
└── sandbox_{sessionId}/             # Per-session isolation schemas
    └── (mirrors public schema with synthetic data)
```

### Key Indexes

```sql
-- Staffing module
CREATE INDEX idx_shift_dept_date ON shift_assignments (department_id, shift_date);
CREATE INDEX idx_staff_assignment ON shift_assignments (staff_id, assignment_date);

-- Bed allocation
CREATE INDEX idx_occupancy_ward_ts ON occupancy_snapshots (ward_id, snapshot_timestamp);
CREATE INDEX idx_bed_type_status ON beds (department_id, bed_type, status);

-- Supply chain
CREATE INDEX idx_inventory_item_loc ON inventory_levels (item_id, location_id, measurement_date);
CREATE INDEX idx_item_category_status ON supply_items (category_id, stock_status);
CREATE INDEX idx_expiration ON supply_items (expiration_date, item_id);

-- Finance
CREATE INDEX idx_financial_period ON revenue_lines (hospital_id, period_id, line_type);
CREATE INDEX idx_cost_category ON cost_lines (category_id, period_id);

-- Anomaly
CREATE INDEX idx_anomaly_status ON anomaly_alerts (hospital_id, status, severity);
CREATE INDEX idx_anomaly_module ON anomaly_alerts (module, detected_at);

-- Audit (partitioned table)
CREATE INDEX idx_audit_timestamp ON audit.governance_audit_log (created_at);
```

### Materialized Views

| View | Refresh Schedule | Purpose |
|---|---|---|
| `mv_consumption_hourly` | Every hour | Supply consumption aggregation |
| `mv_financial_summary` | On demand (finance report) | Period-level financial summaries |
| `mv_quality_latest` | Every 5 minutes | Current quality scores per module |
| `mv_occupancy_trends` | Every 15 minutes | Department-level occupancy trends |

### Scalability Considerations

- **Read replica**: Analytical queries (variance analysis, trend computation, report generation) routed to read replica to avoid OLTP contention.
- **Table partitioning**: Audit log partitioned by month, with automated partition creation and old partition compression. Occupancy snapshots partitioned by month.
- **Connection pooling**: PgBouncer (or RDS Proxy) for connection management. NestJS pool size: 20 connections (writer), 10 connections (reader).
- **Upgrade path**: If analytical query volume exceeds single-node capacity, consider Amazon Redshift or PostgreSQL with Citus extension for horizontal scaling.

### Cost Implications

- `db.r6g.xlarge` Multi-AZ: ~$700/month (Singapore region)
- 500 GB gp3 storage: ~$50/month
- Read replica: ~$350/month
- Estimated total: ~$1,100/month (production)

---

## 2. Neo4j — Graph Database

### Purpose and Functionality

Neo4j stores and traverses relationship-heavy data structures that would be prohibitively expensive to query in PostgreSQL. Specific use cases:
- **Module dependency graph**: Cross-module IMPACTS, DEPENDS_ON, FEEDS_INTO, SHARES_RESOURCE relationships for cascade simulation.
- **Department adjacency**: ADJACENT_TO relationships with transfer_time properties for bed overflow routing.
- **Patient flow paths**: FLOWS_TO relationships tracking admission-to-discharge pathways.
- **Supplier networks**: SUPPLIES, SUBSTITUTES_FOR (with compatibility_score), MANUFACTURED_BY for supply chain resilience.
- **Orphan detection**: Identifying records that reference non-existent entities after ingestion.

### Technology Choice and Rationale

**Neo4j Community Edition on ECS** (or **Neo4j AuraDB** managed service) — chosen for:
- Native graph storage with index-free adjacency — O(1) relationship traversal regardless of graph size.
- Cypher query language for expressive pattern matching: `MATCH path = (source:Module)-[:IMPACTS*1..4]->(target:Module)`.
- Sub-millisecond traversal at depth 4 — PostgreSQL recursive CTEs cannot achieve this with expected relationship density.

### Graph Model

```
Nodes:
  (:Module {id, name, type})
  (:Department {id, name, hospitalId})
  (:Ward {id, name, departmentId, capacity})
  (:Metric {id, name, moduleId, type})
  (:Supplier {id, name, reliability_score})
  (:SupplyItem {id, name, category})
  (:BedType {id, name})
  (:Process {id, name, moduleId})

Relationships:
  (:Module)-[:IMPACTS {weight, direction, timeframe}]->(:Module)
  (:Module)-[:DEPENDS_ON]->(:Module)
  (:Module)-[:FEEDS_INTO]->(:Module)
  (:Department)-[:ADJACENT_TO {transfer_time}]->(:Department)
  (:Department)-[:SHARES_RESOURCE]->(:Department)
  (:Ward)-[:FLOWS_TO {avg_transfer_hours}]->(:Ward)
  (:Supplier)-[:SUPPLIES {unit_cost, lead_time}]->(:SupplyItem)
  (:SupplyItem)-[:SUBSTITUTES_FOR {compatibility_score}]->(:SupplyItem)
  (:SupplyItem)-[:MANUFACTURED_BY]->(:Supplier)
```

### Configuration Requirements

| Parameter | Value | Rationale |
|---|---|---|
| Instance | ECS task: 2 vCPU, 8 GB RAM | Graph fits in memory for single hospital |
| Storage | EBS gp3, 50 GB | Graph data is compact; relationships are lightweight |
| Heap | 4 GB | Sufficient for graph traversal caching |
| Page cache | 2 GB | Keeps hot graph data in memory |
| Bolt TLS | Enabled | Encrypted client connections |

### Performance Considerations

- Cascade traversal depth limited to 4 hops to prevent exponential explosion.
- Pre-materialized paths for common transfer routes cached in Redis (30-minute TTL).
- Impact weights pruned — edges with weight < 0.05 excluded from traversal.
- Server-side graph layout computation (D3.js force simulation) results cached.
- Impact weight matrix recalculated weekly via BullMQ scheduled job.

### Data Synchronization

Neo4j is NOT the authoritative source — PostgreSQL is. Sync strategy:
- **Event-driven**: PostgreSQL changes (new modules, updated relationships) trigger Neo4j updates via BullMQ sync jobs.
- **Periodic reconciliation**: Scheduled job validates PostgreSQL and Neo4j consistency every 6 hours.
- **Scope**: Neo4j stores relationships only — no transactional entity data duplicated.

### Dependencies and Integration Points

- **Simulation Engine**: Primary consumer — cascade calculator queries Neo4j for cross-module impact paths.
- **Anomaly Detection**: Traverses dependency graph to identify cascading anomalies.
- **Bed Allocation**: Queries department adjacency for overflow routing.
- **Supply Chain**: Queries substitution networks during stockout scenarios.
- **Data Ingestion**: Orphan detection queries Neo4j for disconnected nodes.
- **NLP Query**: Cypher sub-queries routed to Neo4j for relationship-based questions.

### Cost Implications

- ECS task (2 vCPU, 8 GB): ~$150/month
- EBS storage 50 GB: ~$5/month
- Alternative: Neo4j AuraDB Professional: ~$250–400/month (managed)
- Estimated total: ~$155–400/month

---

## 3. Redis — Cache and Queue Backing Store

### Purpose and Functionality

Redis serves three distinct roles:
1. **Application cache**: Hot data with module-specific TTLs (staffing state, occupancy, inventory levels, financial drivers, AI narrative results, NLP query cache).
2. **Session management**: JWT token storage, sandbox session state, user preferences.
3. **BullMQ backing**: Persistent queue storage for 24 job queue types with priority, retry, and dead-letter handling.

### Technology Choice and Rationale

**AWS ElastiCache for Redis 7+** — chosen for:
- Sub-millisecond read latency for cache hits.
- Native integration with BullMQ (Node.js job queue library).
- Built-in TTL management for cache expiration.
- Pub/Sub capability for real-time event fan-out (used by SSE endpoints).

### Configuration Requirements

| Parameter | Value | Rationale |
|---|---|---|
| Node type | `cache.r7g.large` (production) / `cache.t4g.micro` (dev) | 2 vCPU, 13 GB RAM handles queue + cache workload |
| Cluster mode | Disabled (single-node with replica) | Data fits in single node; cluster complexity not justified |
| Replica | 1 (production) | Automatic failover |
| Encryption in transit | TLS enabled | Security requirement |
| Maxmemory policy | `allkeys-lru` | Evict least-recently-used keys when memory limit reached |
| Persistence | AOF (append-only file) | BullMQ requires persistence for job durability |

### Cache Key Strategy

```
Namespace pattern: {module}:{entity}:{identifier}

staffing:state:{departmentId}          TTL: 5 min
beds:occupancy:{wardId}                TTL: 15 min
supply:inventory:{itemId}              TTL: 10 min
finance:drivers:{periodId}             TTL: 1 hr
ai:narrative:{periodId}:{hospitalId}   TTL: 24 hr
nlp:query:{queryHash}                  TTL: 5 min
session:{sessionId}                    TTL: 4 hr (sandbox) / 24 hr (user)

sandbox:{sessionId}:*                  Namespace isolation for sandbox sessions
bullmq:*                               BullMQ internal keys

anomaly:dedup:{anomalyHash}            TTL: 30 min (deduplication window)
```

### Scalability Considerations

- Memory monitoring with CloudWatch alerts at 80% and 90% utilization.
- If cache size exceeds single-node capacity: migrate to Redis Cluster mode with hash-slot based sharding.
- BullMQ queues can be split across dedicated Redis instances if queue contention impacts cache performance.

### Cost Implications

- `cache.r7g.large` with replica: ~$400/month (Singapore region)
- Estimated total: ~$400/month (production)

---

## 4. NestJS — API Framework

### Purpose and Functionality

NestJS is the backend API framework providing:
- RESTful API endpoints for all 13 modules (100+ routes).
- RBAC enforcement via custom decorators and guards.
- DTO-based request validation (class-validator, class-transformer).
- Auto-generated Swagger/OpenAPI documentation.
- SSE and WebSocket endpoints for real-time event delivery.
- BullMQ job producers — enqueue background work.
- Claude API client — service abstraction for all AI interactions.

### Technology Choice and Rationale

**NestJS 10+ with TypeScript** — chosen for:
- Full-stack TypeScript consistency with Next.js frontend — shared type definitions.
- Decorator-based architecture for clean RBAC, validation, and Swagger generation.
- First-class BullMQ integration via `@nestjs/bullmq`.
- Modular design aligns with 13-module platform structure — each module is a NestJS module.

### Configuration Requirements

| Parameter | Value | Rationale |
|---|---|---|
| Runtime | Node.js 20 LTS on ECS Fargate | Managed containers, no EC2 instance management |
| CPU/Memory | 2 vCPU / 4 GB (API), 1 vCPU / 2 GB (worker) | API handles HTTP; workers handle BullMQ jobs |
| Instances | 2 API tasks, 2 worker tasks (production) | Minimum availability across AZs |
| Auto-scaling | Target CPU 60%, min 2, max 8 (API) | Scale for peak query and ingestion load |
| Health check | `/api/v1/health` — checks PG, Redis, Neo4j | ALB routes traffic only to healthy tasks |

### Module Structure

```
src/
├── app.module.ts                    # Root module
├── common/                          # Shared utilities
│   ├── guards/                      # AuthGuard, RolesGuard
│   ├── decorators/                  # @Roles(), @CurrentUser()
│   ├── interceptors/                # LoggingInterceptor, TransformInterceptor
│   ├── filters/                     # HttpExceptionFilter
│   ├── pipes/                       # ValidationPipe
│   └── middleware/                   # RateLimitMiddleware
├── auth/                            # JWT auth module
├── staff-allocation/                # Module 01
├── bed-allocation/                  # Module 02
├── supply-chain/                    # Module 03
├── revenue-cost/                    # Module 04
├── anomaly-detection/               # Module 05
├── simulations/                     # Module 06
├── sandbox/                         # Module 07
├── governance/                      # Module 08
├── ingestion/                       # Module 09
├── analytics-query/                 # Module 10
├── impact-analysis/                 # Module 11
├── recommendations/                 # Module 12
├── configuration/                   # Module 13
└── ai/                              # Claude API service + guardrails
    ├── claude.service.ts
    ├── healthcare-guardrails.ts
    └── ai.module.ts
```

### Dependencies and Integration Points

- **PostgreSQL**: TypeORM or Prisma for ORM, raw SQL for materialized view queries.
- **Neo4j**: `neo4j-driver` for Cypher queries, dedicated NeoService.
- **Redis**: `ioredis` for cache, `@nestjs/bullmq` for queues.
- **Claude API**: `@anthropic-ai/sdk` wrapped in `ClaudeService` with guardrail middleware.
- **Next.js Frontend**: REST API consumed via `fetch()` and React Query.

### Cost Implications

- 2 API tasks (2 vCPU/4 GB): ~$180/month
- 2 Worker tasks (1 vCPU/2 GB): ~$90/month
- Auto-scaling headroom (peak): ~$180/month additional
- ALB: ~$25/month
- Estimated total: ~$475/month

---

## 5. Next.js — Frontend Application

### Purpose and Functionality

Next.js 16 with App Router delivers the user-facing interface — 13 module dashboards, executive overview, sandbox demo, and NLP query interface. Uses React 19 with server components (default) for performance and client components for interactivity.

### Technology Choice and Rationale

**Next.js 16 (App Router) + React 19** — chosen for:
- Server components reduce client-side JavaScript bundle for data-heavy dashboards.
- App Router provides file-system-based routing that maps cleanly to 13 module pages.
- Streaming SSR for progressive page rendering.
- Full TypeScript for shared type safety with NestJS backend.

### Configuration Requirements

| Parameter | Value | Rationale |
|---|---|---|
| Deployment | Static export to S3 + CloudFront OR ECS (SSR) | CloudFront for performance; ECS if SSR is essential |
| CDN | CloudFront with Singapore edge | Low-latency asset delivery for SEA users |
| Build | `next build` via GitHub Actions | Zero-downtime blue/green deployment |
| Environment | `NEXT_PUBLIC_API_URL` pointing to NestJS ALB | API endpoint configuration |

### Design System

| Token | Value | Usage |
|---|---|---|
| `--color-surface` | `#faf8ff` | Page backgrounds |
| `--color-secondary` | `#0058be` | Primary accent, chart bars, buttons |
| `--color-on-surface` | `#131b2e` | Body text |
| `--color-error` | `#ba1a1a` | Error states, anomaly alerts |
| `--color-tertiary-fixed-dim` | `#4edea3` | Success indicators |
| `font-headline` | Manrope | Headlines, section titles |
| `font-body` | Inter | Body text, labels, descriptions |
| Icons | Material Symbols Outlined | All UI icons |

### Key Libraries

| Library | Purpose |
|---|---|
| Recharts | Standard charts (bar, line, pie, area) |
| D3.js | Force-directed graph (cross-module impact), custom SVG |
| @tanstack/react-query | Client-side data fetching, caching, revalidation |
| @tanstack/react-table | Sortable/filterable data tables (supply chain inventory) |
| @tanstack/react-virtual | Virtualized lists (anomaly feed — 1000+ items) |
| fuse.js | Fuzzy search (inventory search bar) |
| @react-pdf/renderer | Server-side PDF generation for exports |
| SheetJS | Excel export generation |

### Cost Implications

- CloudFront distribution: ~$50/month (SEA traffic)
- S3 hosting: ~$5/month
- OR ECS (if SSR): ~$90/month
- Estimated total: ~$55–95/month

---

## 6. Claude API — AI Intelligence Layer

### Purpose and Functionality

Claude API (Anthropic) provides language intelligence capabilities:
- **Financial Narratives** (Module 04): Plain-English explanations of revenue/cost variance ("Revenue declined 8% driven by reduced surgical volume in Ward B").
- **Anomaly Classification** (Module 05): Severity assessment, root cause hypothesis, recommended actions for detected anomalies.
- **NLP Query Decomposition** (Module 10): Converts natural language questions into SQL and Cypher sub-queries via tool-use pattern.
- **Recommendation Narrative** (Module 12): Generates prescriptive action text with reasoning and expected outcomes.
- **Field Mapping Suggestions** (Module 13): Suggests mappings from hospital source fields to standard platform fields.
- **Quality Issue Analysis** (Module 08): Root cause analysis for data quality issues.

### Technology Choice and Rationale

**Claude API (Anthropic)** — chosen for:
- Tool-use capability enables structured NLP query decomposition into SQL/Cypher.
- State-of-the-art language understanding for medical and financial terminology.
- No training data required — works with prompts and tool definitions.
- Streaming response support for progressive NLP answer rendering.

### Configuration Requirements

| Parameter | Value | Rationale |
|---|---|---|
| Model | claude-sonnet (default), claude-opus (complex analysis) | Cost/quality balance; opus for financial narratives |
| Max tokens | 4,096 (NLP answers), 2,048 (classification), 8,192 (recommendations) | Sized per task complexity |
| Temperature | 0.0–0.3 (classification, SQL), 0.5 (narratives, recommendations) | Lower for structured; higher for creative |
| Rate limit | Anthropic tier-based; application-enforced: 30/user/hr, 200/hospital/hr | Prevent cost overrun |
| Timeout | 30 seconds per request | Fail fast for user-facing queries |

### Healthcare Guardrails

Every Claude API response passes through a guardrail pipeline:

1. **Input filter**: Strips potential PHI from prompts before sending to API.
2. **Output filter**: Scans response for PHI patterns, statistical hallucination, and unsupported claims.
3. **Confidence gate**: Responses below confidence threshold are flagged rather than surfaced directly.
4. **Citation enforcer**: NLP answers must cite source data (table, column, time period).
5. **Audit logger**: All AI interactions logged with prompt hash, response hash, confidence score.

### Cost Implications

- Estimated volume: 1,000–5,000 AI interactions/day/hospital.
- Claude Sonnet: ~$3/million input tokens, ~$15/million output tokens.
- Estimated monthly: $200–800/hospital (depends on query volume and caching effectiveness).
- Caching reduces cost: narrative 24hr TTL, query 5min TTL.

---

## 7. BullMQ — Job Processing Framework

### Purpose and Functionality

BullMQ provides asynchronous background job processing for all batch workloads — predictions, quality assessments, report generation, simulation execution, recommendation generation, and data synchronization. Backed by Redis for persistence and atomic queue operations.

### Technology Choice and Rationale

**BullMQ 5+** — chosen for:
- Native Node.js/TypeScript integration with NestJS (`@nestjs/bullmq`).
- Redis-backed persistence — jobs survive worker restarts.
- Priority queues, delayed jobs, rate limiting, and repeatable jobs (cron scheduling).
- Dead-letter queue support for failed job investigation.

### Queue Configuration

| Queue | Concurrency | Priority | Retry | Notes |
|---|---|---|---|---|
| `anomaly-detection` | 5 | High | 3x expo backoff | Scans 10,000 data points per batch |
| `anomaly-classification` | 3 | High | 3x expo backoff | Claude API calls (priority: critical first) |
| `anomaly-notification` | 10 | High | 3x expo backoff | Alert delivery |
| `simulation-execution` | 2 | Medium | 2x | 30-second timeout per simulation |
| `simulation-cascade` | 2 | Medium | 2x | Neo4j cascade traversal |
| `simulation-report` | 1 | Low | 3x | PDF export generation |
| `staff-prediction` | 2 | Medium | 3x expo backoff | 120-second timeout |
| `bed-forecast` | 2 | Medium | 3x expo backoff | 7-day demand forecast |
| `supply-demand-forecast` | 2 | Medium | 3x expo backoff | Consumption trend forecast |
| `order-optimization` | 1 | Medium | 3x | Procurement batch |
| `financial-analysis` | 2 | Medium | 3x | Driver analysis + narrative |
| `report-generation` | 1 | Low | 3x | PDF/Excel generation (30s max) |
| `quality-assessment` | 2 | Low | 3x | Per-module quality scoring |
| `quality-report` | 1 | Low | 3x | Quality trend report |
| `audit-log` | 5 | Low | 5x | Hash-chained log writes |
| `ingestion-job` | 3 | Medium | 3x expo backoff | 500-record chunks |
| `generate-recommendations` | 2 | Medium | 3x | Claude API prescriptive |
| `evaluate-outcome` | 1 | Low | 3x | Monthly outcome tracking |
| `update-learning-model` | 1 | Low | 3x | Monthly weight adjustment |
| `recalculate-impact-weights` | 1 | Low | 2x | Weekly Neo4j weight refresh |
| `neo4j-sync` | 3 | Medium | 5x | PostgreSQL → Neo4j sync |
| `expiration-scanner` | 1 | Low | 3x | Daily 2 AM scan |
| `sandbox-cleanup` | 1 | Low | 3x | Expired session teardown |
| `configuration-export` | 1 | Low | 3x | PDF/CSV/XLSX export |

### Scalability Considerations

- Worker processes run as separate ECS tasks from API tasks — independently scalable.
- Queue-specific concurrency limits prevent Redis memory saturation.
- Dead-letter queues capture failed jobs for investigation without blocking main queues.
- Redis memory monitoring alerts trigger when BullMQ keys exceed 4 GB.

### Cost Implications

- No separate cost — BullMQ runs within NestJS worker ECS tasks.
- Redis memory consumption is the cost driver (included in Redis estimate above).

---

## 8. AWS Infrastructure Components

### Amazon ECS (Fargate) — Container Orchestration

- **API Service**: 2–8 tasks (auto-scaling), 2 vCPU / 4 GB each.
- **Worker Service**: 2–4 tasks (auto-scaling), 1 vCPU / 2 GB each.
- **Neo4j**: 1 task, 2 vCPU / 8 GB (or managed AuraDB).
- Fargate eliminates EC2 instance management. Tasks run in private subnets.

### Application Load Balancer (ALB)

- Routes HTTPS traffic to NestJS API tasks.
- Health check: `/api/v1/health` every 30 seconds.
- SSL termination with ACM certificate.
- Path-based routing: `/api/*` → NestJS, `/ws/*` → WebSocket target group.

### Amazon CloudFront — CDN

- Distributes Next.js static assets from S3 origin.
- Singapore edge location for low-latency SEA delivery.
- Custom domain with ACM certificate.
- Cache invalidation on deployment.

### Amazon S3 — Object Storage

- **Raw archive bucket**: Stores original ingestion files (FHIR R4, HL7v2, CSV). Lifecycle policy: Standard → IA after 30 days → Glacier after 1 year.
- **Export bucket**: Temporary storage for generated PDF/Excel reports. Lifecycle: delete after 7 days.
- **Frontend bucket**: Next.js static build output. Served via CloudFront.
- Server-side encryption (SSE-S3) on all buckets.

### AWS KMS — Key Management

- Customer-managed key for PostgreSQL column-level encryption.
- S3 SSE-KMS encryption for raw data archives.
- Key rotation every 365 days (automatic).

### Amazon CloudWatch — Monitoring

- Custom metrics: queue depth, API latency, cache hit rate, ingestion throughput.
- Log groups for API, worker, Neo4j containers.
- Alarms for: Redis memory >80%, API latency p99 >5s, queue depth >1000, error rate >5%.
- Dashboard: unified view of all platform health metrics.

### Cost Summary

| Component | Monthly Estimate |
|---|---|
| RDS PostgreSQL (Multi-AZ + replica) | $1,100 |
| ElastiCache Redis (with replica) | $400 |
| ECS Fargate (API + Workers + Neo4j) | $625 |
| ALB | $25 |
| CloudFront + S3 | $55 |
| Claude API | $200–800 |
| KMS, CloudWatch, misc | $50 |
| **Total (production)** | **$2,455–3,055/month** |

Development environment (single-AZ, smaller instances): ~$500–700/month.

---

## Cross-References

- [Architecture Overview](../../../docs/architecture/overview.md) — High-level architecture and design principles.
- [Data Flows](../../../docs/architecture/data-flows.md) — End-to-end data flow diagrams.
- [Security & Governance](../../../docs/architecture/security-governance.md) — Authentication, encryption, and compliance.
- [Network Security](./network-security.md) — VPC topology, firewall rules, and private endpoints.
- [Operations](./operations.md) — Monitoring, DR, CI/CD, and cost optimization.
