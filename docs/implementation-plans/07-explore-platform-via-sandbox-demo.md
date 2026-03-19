# 07 Explore Platform via Sandbox Demo - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story
As a **prospective hospital client**, I want to **interact with a sandbox environment populated with realistic synthetic data**, so that I can **evaluate the platform's predictive and simulation capabilities before committing to a purchase**.

## Pre-conditions
- All five operational modules (staffing, bed allocation, supply chain, finance, anomaly detection) have functional UI components and API endpoints
- Foresight Simulation engine (Story 06) is operational and can produce meaningful results from synthetic data
- Multi-tenant infrastructure is configured to support isolated sandbox environments alongside production
- Synthetic data generation pipeline is built and validated to produce realistic hospital operational data
- Session management supports temporary, expirable sandbox accounts with no persistent PII
- CloudFront or equivalent CDN is configured for low-latency global delivery (relevant for Southeast Asian market demos)
- Email/notification system can send sandbox access links to prospective clients

## Business Requirements
- **Enable pre-sales demonstrations** that convert prospective hospital clients
  - Success Metric: 60% of sandbox demo recipients request follow-up sales meeting
- **Reduce sales cycle length** by allowing self-service exploration
  - Success Metric: Average sales cycle reduced by 30% for clients who used sandbox
- **Demonstrate platform ROI** through realistic scenario simulation with synthetic data
  - Success Metric: 80% of demo users run at least 2 what-if simulations during session
- **Overcome client skepticism** by providing hands-on experience with predictive capabilities
  - Success Metric: 90% of sandbox users rate demo as "convincing" or "very convincing"
- **Scale sales outreach** across Southeast Asian market without requiring live demos for every prospect
  - Success Metric: Support 50 concurrent sandbox sessions without performance degradation

## Technical Specifications

### Integration Points
- **Staffing Module Sandbox**: Pre-populated with 200+ synthetic staff records across departments (nurses, doctors, admin, specialists)
- **Bed Allocation Module Sandbox**: Synthetic ward configurations with 500 beds across ICU, general, maternity, surgical, pediatric wards
- **Supply Chain Module Sandbox**: 300+ synthetic supply items with suppliers, contracts, inventory levels, and historical consumption
- **Finance Module Sandbox**: 24 months of synthetic revenue, cost, and budget data with realistic seasonal patterns
- **Anomaly Detection Sandbox**: Pre-seeded anomalies with mix of active, acknowledged, and resolved states across severity levels
- **Simulation Engine**: Full simulation capability operating on sandboxed data store; results do not persist beyond session
- **Neo4j Sandbox Instance**: Isolated graph database pre-loaded with cross-module dependency relationships
- **Redis Sandbox Namespace**: Isolated Redis keyspace per sandbox session for caching and real-time features
- **Claude API**: Shared Claude API access with sandbox-specific system prompts identifying synthetic data context

### Security Requirements
- **Data Isolation**: Each sandbox session operates on a dedicated PostgreSQL schema or tenant partition; no cross-session data leakage
- **No PII Exposure**: Synthetic data must not contain real patient, staff, or financial data; generated using faker libraries with healthcare domain rules
- **Session Expiry**: Sandbox sessions auto-expire after configurable TTL (default: 4 hours); all session data purged on expiry
- **Rate Limiting**: Sandbox API endpoints rate-limited (100 requests/min) to prevent abuse; simulation runs capped at 10 per session
- **Access Tokens**: Sandbox access via single-use, time-limited tokens (JWT with 4-hour expiry); no persistent accounts
- **Network Isolation**: Sandbox instances cannot access production databases, internal APIs, or other sandbox instances
- **Audit Logging**: Log sandbox creation, feature usage, simulation runs, and session duration for sales analytics (no user PII in logs)
- **IP Throttling**: Maximum 5 sandbox sessions per IP address per 24 hours to prevent resource exhaustion

## Design Specifications

### Visual Layout & Components
```
+------------------------------------------------------------------+
|  SANDBOX LANDING PAGE                                              |
+------------------------------------------------------------------+
|                                                                    |
|  +--HERO SECTION----------------------------------------------+  |
|  |                                                              |  |
|  |           Medical Pro - Experience the Platform              |  |
|  |                                                              |  |
|  |    Explore hospital analytics with realistic sample data.    |  |
|  |    No commitment required.                                   |  |
|  |                                                              |  |
|  |    [Launch Sandbox Demo]                                     |  |
|  |                                                              |  |
|  |    Or enter your access code: [____________] [Go]            |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--FEATURE PREVIEW CARDS (3-col)------------------------------+  |
|  |                                                              |  |
|  | +--CARD 1--------+ +--CARD 2--------+ +--CARD 3--------+   |  |
|  | | Predictive      | | What-If         | | Anomaly        |   |  |
|  | | Analytics       | | Simulations     | | Detection      |   |  |
|  | |                 | |                  | |                |   |  |
|  | | See staffing    | | Run scenarios    | | Auto-detect    |   |  |
|  | | & bed forecasts | | before deciding  | | data issues    |   |  |
|  | +-----------------+ +------------------+ +----------------+   |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|  SANDBOX DASHBOARD (after launch)                                  |
+------------------------------------------------------------------+
|                                                                    |
|  +--SANDBOX BANNER (persistent)--------------------------------+  |
|  | [!] SANDBOX MODE - Synthetic data | Time: 3:42:18 | [Reset] |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--GUIDED TOUR OVERLAY (first visit)-------------------------+   |
|  |  Step 1 of 5: Welcome to Medical Pro                        |   |
|  |  This dashboard shows hospital-wide KPIs.                   |   |
|  |  [Next] [Skip Tour]                                         |   |
|  +-------------------------------------------------------------+   |
|                                                                    |
|  +--MODULE NAVIGATION CARDS-----------------------------------+   |
|  |                                                              |   |
|  | +--Staffing------+ +--Beds---------+ +--Supply------+       |   |
|  | | 203 Staff      | | 487/500 Beds   | | 312 Items   |       |   |
|  | | 12 on OT       | | 97.4% Occupancy| | 5 Low Stock |       |   |
|  | | [Explore ->]   | | [Explore ->]   | | [Explore ->]|       |   |
|  | +-----------------+ +----------------+ +-------------+       |   |
|  |                                                              |   |
|  | +--Finance-------+ +--Anomalies----+ +--Simulate----+       |   |
|  | | $2.1M Revenue  | | 3 Critical     | | Run What-If |       |   |
|  | | 23% Margin     | | 12 Warning     | | Scenarios   |       |   |
|  | | [Explore ->]   | | [Explore ->]   | | [Try It ->] |       |   |
|  | +-----------------+ +----------------+ +-------------+       |   |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--QUICK SIMULATION PROMPT-----------------------------------+   |
|  |  Try a simulation:                                           |   |
|  |  "What if we reduce nursing staff by 20 in December?"        |   |
|  |  [Type your scenario...___________________________] [Run]    |   |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--SESSION INFO----------------------------------------------+   |
|  |  Session expires in: 3:42:18 | Features explored: 2/5       |   |
|  |  Simulations run: 1/10       | [Request Full Demo]           |   |
|  +--------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Component Hierarchy
```
SandboxLandingPage
├── SandboxHeroSection
│   ├── PlatformLogo
│   ├── HeroHeadline
│   ├── HeroSubtext
│   ├── LaunchSandboxButton
│   └── AccessCodeInput
│       ├── CodeTextField
│       └── GoButton
├── FeaturePreviewCards
│   └── FeaturePreviewCard (repeating)
│       ├── FeatureIcon
│       ├── FeatureTitle
│       └── FeatureDescription
└── SandboxFooter

SandboxDashboardLayout
├── SandboxBanner
│   ├── SandboxModeIndicator
│   ├── SessionCountdownTimer
│   └── ResetSandboxButton
├── GuidedTourOverlay
│   ├── TourStepCard
│   │   ├── TourStepCounter
│   │   ├── TourStepContent
│   │   └── TourHighlightPointer
│   ├── TourNextButton
│   └── TourSkipButton
├── SandboxDashboardPage
│   ├── SandboxPageHeader
│   ├── ModuleNavigationGrid
│   │   └── ModuleNavigationCard (repeating)
│   │       ├── ModuleIcon
│   │       ├── ModuleKpiSummary
│   │       └── ExploreModuleLink
│   ├── QuickSimulationPrompt
│   │   ├── SuggestionChips
│   │   ├── SimulationInput
│   │   └── RunSimulationButton
│   └── SessionInfoBar
│       ├── SessionTimer
│       ├── ExplorationProgress
│       ├── SimulationCounter
│       └── RequestFullDemoButton
├── SandboxModuleWrapper (wraps each module page)
│   ├── SandboxContextProvider
│   └── ModulePage (existing module components)
└── SandboxResetConfirmDialog
    ├── ResetWarning
    └── ResetConfirmButton
```

### Design System Compliance
- **Landing Page Background**: Gradient from `ink` (#031926) to `ink-deep` (#020F18) with subtle grid pattern overlay
- **Hero Section**: Merriweather heading at 48px, `white`, Inter subtext at 18px, `#94A3B8`
- **Launch Button**: Prominent gradient `teal` (#007B7A) to `cerulean` (#00B3C6) with `hover:brightness-110`, 16px padding, rounded-xl
- **Feature Preview Cards**: Glassmorphism `bg-white/5 backdrop-blur-md` with `border border-white/10`, hover lift effect `hover:-translate-y-1 hover:border-teal/30`
- **Sandbox Banner**: `bg-gold/10 border-b border-gold/30` with `gold` (#C9A84A) text for sandbox mode indicator, persistent at top
- **Module Navigation Cards**: `ink-light` (#0A2A3C) background, module-specific accent colors matching design system (staffing=cerulean, beds=teal, supply=gold, finance=purple, anomalies=red, simulate=gradient)
- **Guided Tour**: Semi-transparent overlay `bg-black/60`, tour card `bg-ink-light border border-cerulean/30` with `cerulean` accent step counter
- **Session Timer**: `gold` (#C9A84A) when >1hr remaining, `#DC2626` when <15min remaining, pulsing animation when <5min
- **Quick Simulation Input**: `bg-white/5 border border-teal/20 focus:border-teal/60` with `cerulean` suggestion chips
- **Body Text**: Inter, 400 weight, `#E2E8F0` primary, `#94A3B8` secondary
- **Headings**: Merriweather, 600 weight, `white` for primary, `cerulean` for section

### Responsive Behavior
- **Desktop (xl: 1280px+)**: Landing with centered hero, 3-column feature cards; Dashboard with 3x2 module grid, full-width simulation prompt
- **Large Tablet (lg: 1024px)**: Feature cards 3-column, module grid 3x2
- **Tablet (md: 768px)**: Feature cards 2-column with third wrapping, module grid 2x3, guided tour positions adjusted to avoid edge overflow
- **Mobile (sm: 640px)**: Feature cards single column stacked, module grid single column, sandbox banner condensed (timer only), guided tour as bottom sheet instead of overlay
- **Breakpoint Classes**: Module grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, feature cards `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Interaction Patterns
- **Sandbox Launch**: Click "Launch Sandbox" -> 3-5s provisioning with animated loading (spinning Medical Pro logo) -> redirect to sandbox dashboard with guided tour auto-start
- **Access Code Entry**: Paste/type 8-character alphanumeric code -> validate -> redirect to sandbox with pre-configured demo state
- **Guided Tour**: 5-step walkthrough highlighting dashboard, module navigation, simulation prompt, anomaly alerts, and reset button; spotlight effect (dimmed background, highlighted element); arrow pointer to target; next/skip/previous controls
- **Module Navigation**: Click module card -> navigate to full module page wrapped in `SandboxModuleWrapper` (which adds banner and sandbox context)
- **Quick Simulation**: Click suggestion chip (pre-written scenario) or type custom -> parse via Claude NLP -> redirect to simulation builder with pre-filled variables
- **Session Timer**: Countdown from 4:00:00; visual warnings at 30min, 15min, 5min; final 60s shows modal with extend option (adds 1 hour, max 1 extension)
- **Reset Sandbox**: Confirmation dialog -> all data restored to initial synthetic state -> page refresh -> guided tour offered again
- **Request Full Demo**: Opens modal with contact form (name, email, hospital, role) -> submits to CRM integration -> confirmation with "Sales team will contact within 24 hours"
- **Loading States**: Landing page: shimmer on feature cards; Dashboard: skeleton cards with module outlines; Tour: step-by-step animation
- **Error States**: Sandbox provisioning failure shows retry button; session expired shows "Session ended" with option to launch new sandbox
- **Sandbox Context**: All API calls within sandbox include `X-Sandbox-Session-Id` header; data writes scoped to sandbox partition

## Technical Architecture

### Component Structure
```
app/
├── sandbox/
│   ├── page.tsx                                  # SandboxLandingPage (public, no auth)
│   ├── loading.tsx                               # Landing page skeleton
│   ├── error.tsx                                 # Error boundary
│   ├── layout.tsx                                # Sandbox root layout (minimal chrome)
│   ├── [sessionId]/
│   │   ├── layout.tsx                            # SandboxDashboardLayout with banner & timer
│   │   ├── page.tsx                              # SandboxDashboardPage (module grid + prompt)
│   │   ├── staffing/
│   │   │   └── page.tsx                          # Staffing module in sandbox context
│   │   ├── beds/
│   │   │   └── page.tsx                          # Bed allocation in sandbox context
│   │   ├── supply-chain/
│   │   │   └── page.tsx                          # Supply chain in sandbox context
│   │   ├── finance/
│   │   │   └── page.tsx                          # Finance in sandbox context
│   │   ├── anomalies/
│   │   │   └── page.tsx                          # Anomaly detection in sandbox context
│   │   ├── simulations/
│   │   │   ├── page.tsx                          # Simulation engine in sandbox context
│   │   │   └── [scenarioId]/
│   │   │       └── page.tsx                      # Scenario detail in sandbox
│   │   └── governance/
│   │       └── page.tsx                          # Data governance in sandbox context
│   ├── _components/
│   │   ├── SandboxHeroSection.tsx                # Landing hero with launch CTA
│   │   ├── LaunchSandboxButton.tsx               # Primary launch CTA with provisioning
│   │   ├── AccessCodeInput.tsx                   # Access code entry form
│   │   ├── FeaturePreviewCards.tsx                # Feature showcase grid
│   │   ├── FeaturePreviewCard.tsx                 # Individual feature card
│   │   ├── SandboxBanner.tsx                      # Persistent sandbox mode indicator
│   │   ├── SandboxModeIndicator.tsx               # "SANDBOX MODE" label with icon
│   │   ├── SessionCountdownTimer.tsx              # Live countdown with warnings
│   │   ├── ResetSandboxButton.tsx                 # Reset trigger button
│   │   ├── SandboxResetConfirmDialog.tsx          # Reset confirmation modal
│   │   ├── GuidedTourOverlay.tsx                  # Tour controller and overlay
│   │   ├── TourStepCard.tsx                       # Individual tour step content
│   │   ├── TourHighlightPointer.tsx               # Arrow/spotlight pointing to element
│   │   ├── ModuleNavigationGrid.tsx               # Module card grid layout
│   │   ├── ModuleNavigationCard.tsx               # Individual module card
│   │   ├── QuickSimulationPrompt.tsx              # NLP simulation input with suggestions
│   │   ├── SuggestionChips.tsx                    # Pre-written scenario suggestions
│   │   ├── SessionInfoBar.tsx                     # Session metadata footer
│   │   ├── ExplorationProgress.tsx                # Feature exploration tracker
│   │   ├── RequestFullDemoButton.tsx              # CTA to contact sales
│   │   ├── RequestDemoModal.tsx                   # Contact form modal
│   │   ├── SandboxModuleWrapper.tsx               # HOC wrapping module pages with sandbox context
│   │   ├── SandboxContextProvider.tsx             # React context for sandbox state
│   │   ├── SandboxProvisioningLoader.tsx          # Animated loader during sandbox creation
│   │   └── SessionExpiredModal.tsx                # Session expiry notification
│   ├── _hooks/
│   │   ├── useSandboxSession.ts                   # Sandbox session lifecycle management
│   │   ├── useSandboxTimer.ts                     # Countdown timer with warning thresholds
│   │   ├── useGuidedTour.ts                       # Tour step state and navigation
│   │   ├── useSandboxReset.ts                     # Reset sandbox data to defaults
│   │   ├── useSandboxAnalytics.ts                 # Track feature usage for sales analytics
│   │   └── useSandboxProvisioning.ts              # Handle sandbox creation and setup
│   └── _utils/
│       ├── sandbox-types.ts                       # TypeScript type definitions
│       ├── sandbox-config.ts                      # Sandbox configuration constants
│       ├── synthetic-data-manifest.ts             # Defines synthetic data structure
│       └── tour-steps.ts                          # Guided tour step definitions
├── api/
│   └── v1/
│       └── sandbox/
│           ├── route.ts                           # POST create sandbox session
│           ├── [sessionId]/
│           │   ├── route.ts                       # GET session status / DELETE terminate
│           │   ├── reset/
│           │   │   └── route.ts                   # POST reset sandbox data
│           │   ├── extend/
│           │   │   └── route.ts                   # POST extend session TTL
│           │   └── analytics/
│           │       └── route.ts                   # POST track feature usage
│           ├── validate-code/
│           │   └── route.ts                       # POST validate access code
│           ├── request-demo/
│           │   └── route.ts                       # POST submit demo request form
│           └── provision/
│               └── route.ts                       # POST provision sandbox resources
lib/
├── sandbox/
│   ├── sandbox-manager.ts                         # Core sandbox lifecycle manager
│   ├── sandbox-types.ts                           # Shared type definitions
│   ├── sandbox-provisioner.ts                     # Creates DB schema, seeds data
│   ├── sandbox-cleanup.ts                         # TTL expiry and resource cleanup
│   ├── synthetic-data/
│   │   ├── data-generator.ts                      # Main synthetic data orchestrator
│   │   ├── staffing-generator.ts                  # Generate staffing records
│   │   ├── bed-generator.ts                       # Generate bed/ward data
│   │   ├── supply-chain-generator.ts              # Generate supply chain data
│   │   ├── finance-generator.ts                   # Generate financial records
│   │   ├── anomaly-generator.ts                   # Generate pre-seeded anomalies
│   │   ├── patient-generator.ts                   # Generate synthetic patient census
│   │   └── relationship-generator.ts              # Generate Neo4j relationships
│   └── access-codes.ts                            # Access code generation/validation
```

### State Management Architecture
```typescript
// ===== Sandbox Session State (React Context) =====

interface SandboxSessionState {
  sessionId: string;
  status: SandboxStatus;
  createdAt: string;
  expiresAt: string;
  timeRemainingMs: number;
  extensionsUsed: number;
  maxExtensions: number;
  features: SandboxFeatureUsage;
  simulationsRun: number;
  maxSimulations: number;
  tourCompleted: boolean;
  tourStep: number;
}

type SandboxStatus =
  | 'provisioning'
  | 'active'
  | 'expiring_soon'                          // <15 min remaining
  | 'expired'
  | 'resetting'
  | 'error';

interface SandboxFeatureUsage {
  staffing: FeatureExplorationStatus;
  bedAllocation: FeatureExplorationStatus;
  supplyChain: FeatureExplorationStatus;
  finance: FeatureExplorationStatus;
  anomalyDetection: FeatureExplorationStatus;
  simulation: FeatureExplorationStatus;
  governance: FeatureExplorationStatus;
}

type FeatureExplorationStatus = 'not_visited' | 'visited' | 'explored';

// ===== Sandbox Configuration =====

interface SandboxConfig {
  sessionTtlMs: number;                      // default: 4 hours (14400000ms)
  maxExtensions: number;                     // default: 1
  extensionDurationMs: number;               // default: 1 hour (3600000ms)
  maxSimulationsPerSession: number;           // default: 10
  apiRateLimitPerMinute: number;             // default: 100
  maxConcurrentSessions: number;             // default: 50
  cleanupIntervalMs: number;                 // default: 5 minutes
}

// ===== Synthetic Data Manifest =====

interface SyntheticDataManifest {
  hospital: SyntheticHospital;
  staffing: SyntheticStaffingData;
  beds: SyntheticBedData;
  supplyChain: SyntheticSupplyData;
  finance: SyntheticFinanceData;
  anomalies: SyntheticAnomalyData;
  graph: SyntheticGraphData;
}

interface SyntheticHospital {
  name: string;                              // "Metro General Hospital"
  location: string;                          // "Bangkok, Thailand"
  bedCapacity: number;                       // 500
  departments: SyntheticDepartment[];
  operationalSince: string;                  // ISO date
}

interface SyntheticDepartment {
  id: string;
  name: string;                              // "Emergency", "ICU", "General Medicine"
  type: 'clinical' | 'surgical' | 'support';
  headCount: number;
  bedCount: number;
  annualBudget: number;
}

interface SyntheticStaffingData {
  totalStaff: number;                        // 203
  records: SyntheticStaffRecord[];
  shifts: SyntheticShiftRecord[];
  overtimeRecords: SyntheticOvertimeRecord[];
}

interface SyntheticStaffRecord {
  id: string;
  firstName: string;
  lastName: string;
  role: 'nurse' | 'doctor' | 'specialist' | 'admin' | 'technician';
  department: string;
  hireDate: string;
  salary: number;
  certifications: string[];
  shiftPattern: 'day' | 'night' | 'rotating';
  isActive: boolean;
}

interface SyntheticBedData {
  totalBeds: number;                         // 500
  wards: SyntheticWard[];
  occupancyHistory: SyntheticOccupancyRecord[];
}

interface SyntheticWard {
  id: string;
  name: string;                              // "ICU Ward A", "General Ward 3B"
  type: 'icu' | 'general' | 'maternity' | 'surgical' | 'pediatric' | 'psychiatric';
  bedCount: number;
  currentOccupancy: number;
  nurseToPatientRatio: number;
}

interface SyntheticSupplyData {
  totalItems: number;                        // 312
  items: SyntheticSupplyItem[];
  suppliers: SyntheticSupplier[];
  purchaseOrders: SyntheticPurchaseOrder[];
}

interface SyntheticSupplyItem {
  id: string;
  name: string;                              // "Surgical Gloves (L)", "IV Saline 500ml"
  category: 'consumable' | 'pharmaceutical' | 'equipment' | 'ppe';
  currentStock: number;
  reorderPoint: number;
  unitCost: number;
  supplierId: string;
  avgDailyConsumption: number;
}

interface SyntheticFinanceData {
  monthlyRecords: SyntheticFinanceMonth[];
  costCenters: SyntheticCostCenter[];
  revenueStreams: SyntheticRevenueStream[];
}

interface SyntheticFinanceMonth {
  month: string;                             // "2024-01"
  revenue: number;
  totalCosts: number;
  operatingMargin: number;
  staffingCost: number;
  supplyCost: number;
  facilityCost: number;
}

interface SyntheticAnomalyData {
  preSeededAnomalies: PreSeededAnomaly[];
}

interface PreSeededAnomaly {
  title: string;
  severity: 'critical' | 'warning' | 'informational';
  status: 'active' | 'acknowledged' | 'resolved';
  module: string;
  detectedAt: string;
  description: string;
}

// ===== Guided Tour =====

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;                    // CSS selector for highlight target
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
}

// ===== Access Code =====

interface SandboxAccessCode {
  code: string;                              // 8-char alphanumeric
  createdBy: string;                         // sales rep userId
  createdAt: string;
  expiresAt: string;
  maxUses: number;
  currentUses: number;
  presetConfiguration: string | null;        // optional preset demo state
  clientName: string;
  clientOrganization: string;
}

// ===== Demo Request =====

interface DemoRequest {
  name: string;
  email: string;
  hospitalName: string;
  role: string;
  phoneNumber?: string;
  numberOfBeds?: number;
  interestedModules: string[];
  message?: string;
  sandboxSessionId: string;
  featuresExplored: string[];
  simulationsRun: number;
}
```

### API Integration Schema
```typescript
// ===== POST /api/v1/sandbox =====
// Create a new sandbox session

interface CreateSandboxRequest {
  accessCode?: string;                       // optional pre-generated access code
}

interface CreateSandboxResponse {
  success: boolean;
  sessionId: string;
  expiresAt: string;
  redirectUrl: string;                       // /sandbox/[sessionId]
  config: SandboxConfig;
}

// ===== GET /api/v1/sandbox/:sessionId =====
// Get session status

interface GetSandboxSessionResponse {
  data: {
    sessionId: string;
    status: SandboxStatus;
    createdAt: string;
    expiresAt: string;
    timeRemainingMs: number;
    features: SandboxFeatureUsage;
    simulationsRun: number;
    maxSimulations: number;
    extensionsUsed: number;
  };
}

// ===== DELETE /api/v1/sandbox/:sessionId =====
// Terminate sandbox session

interface TerminateSandboxResponse {
  success: boolean;
  message: string;
}

// ===== POST /api/v1/sandbox/:sessionId/reset =====
// Reset sandbox to initial state

interface ResetSandboxResponse {
  success: boolean;
  resetAt: string;
  message: string;
}

// ===== POST /api/v1/sandbox/:sessionId/extend =====
// Extend session TTL

interface ExtendSandboxRequest {
  durationMs?: number;                       // default: 3600000 (1 hour)
}

interface ExtendSandboxResponse {
  success: boolean;
  newExpiresAt: string;
  extensionsRemaining: number;
}

// ===== POST /api/v1/sandbox/:sessionId/analytics =====
// Track feature usage event

interface TrackSandboxAnalyticsRequest {
  eventType: 'feature_visited' | 'feature_explored' | 'simulation_run' | 'tour_step' | 'tour_completed' | 'tour_skipped';
  feature?: string;
  metadata?: Record<string, string | number>;
}

interface TrackSandboxAnalyticsResponse {
  success: boolean;
}

// ===== POST /api/v1/sandbox/validate-code =====
// Validate access code

interface ValidateAccessCodeRequest {
  code: string;
}

interface ValidateAccessCodeResponse {
  valid: boolean;
  sessionId?: string;                        // if code auto-creates session
  clientName?: string;
  presetConfiguration?: string;
  error?: string;
}

// ===== POST /api/v1/sandbox/request-demo =====
// Submit demo request form

interface RequestDemoRequest {
  name: string;
  email: string;
  hospitalName: string;
  role: string;
  phoneNumber?: string;
  numberOfBeds?: number;
  interestedModules: string[];
  message?: string;
  sandboxSessionId?: string;
}

interface RequestDemoResponse {
  success: boolean;
  message: string;
  referenceId: string;
}

// ===== POST /api/v1/sandbox/provision =====
// Internal: Provision sandbox resources (called by sandbox-manager)

interface ProvisionSandboxRequest {
  sessionId: string;
  configuration?: string;                    // preset configuration name
}

interface ProvisionSandboxResponse {
  success: boolean;
  dbSchema: string;
  redisNamespace: string;
  neo4jDatabase: string;
  dataSeeded: boolean;
  provisionTimeMs: number;
}
```

## Implementation Requirements

### Core Components

| Component | Description | Props |
|---|---|---|
| `SandboxLandingPage` | Public-facing landing page with launch CTA and access code input | None (server) |
| `SandboxHeroSection` | Hero block with headline, description, and launch button | None |
| `LaunchSandboxButton` | Primary CTA that triggers sandbox provisioning | `onLaunched: (sessionId) => void` |
| `AccessCodeInput` | Text field + validate button for pre-generated access codes | `onValidated: (sessionId) => void` |
| `FeaturePreviewCards` | Grid of feature preview cards | None |
| `FeaturePreviewCard` | Individual feature card with icon, title, description | `icon: ReactNode, title: string, description: string` |
| `SandboxBanner` | Persistent top banner showing sandbox mode and timer | `session: SandboxSessionState` |
| `SessionCountdownTimer` | Live countdown with warning color transitions | `expiresAt: string, onExpired: () => void` |
| `ResetSandboxButton` | Trigger for sandbox reset with confirmation | `sessionId: string, onReset: () => void` |
| `SandboxResetConfirmDialog` | Modal confirming data reset | `onConfirm: () => void, onCancel: () => void` |
| `GuidedTourOverlay` | Tour controller with step navigation and spotlights | `steps: TourStep[], onComplete: () => void` |
| `TourStepCard` | Individual tour step with title, description, navigation | `step: TourStep, current: number, total: number` |
| `ModuleNavigationGrid` | Grid layout for module navigation cards | `modules: ModuleNavItem[]` |
| `ModuleNavigationCard` | Module card with KPI summary and explore link | `module: ModuleNavItem` |
| `QuickSimulationPrompt` | NLP simulation input with suggestion chips | `sessionId: string, onSimulate: (scenarioId) => void` |
| `SuggestionChips` | Pre-written scenario suggestions as clickable chips | `suggestions: string[], onSelect: (text) => void` |
| `SessionInfoBar` | Footer bar with session metadata and exploration progress | `session: SandboxSessionState` |
| `ExplorationProgress` | Visual tracker of features explored | `features: SandboxFeatureUsage` |
| `RequestDemoModal` | Contact form for requesting full demo | `sessionId: string, onSubmit: () => void` |
| `SandboxModuleWrapper` | HOC that wraps module pages with sandbox context | `sessionId: string, children: ReactNode` |
| `SandboxContextProvider` | React context provider for sandbox session state | `session: SandboxSessionState, children: ReactNode` |
| `SandboxProvisioningLoader` | Animated loader during sandbox creation | `status: string` |
| `SessionExpiredModal` | Modal shown when session expires | `onNewSession: () => void` |

### Custom Hooks

| Hook | Purpose | Return Type |
|---|---|---|
| `useSandboxSession` | Manages sandbox session lifecycle (create, status, terminate) | `{ session, isActive, isExpired, extend, terminate }` |
| `useSandboxTimer` | Countdown timer with configurable warning thresholds | `{ timeRemaining, formattedTime, warningLevel, isExpired }` |
| `useGuidedTour` | Tour step state navigation with completion tracking | `{ currentStep, totalSteps, next, previous, skip, isComplete }` |
| `useSandboxReset` | Reset sandbox data to initial synthetic state | `{ reset, isResetting, error }` |
| `useSandboxAnalytics` | Track feature usage events for sales analytics | `{ trackEvent, featuresExplored, simulationsRun }` |
| `useSandboxProvisioning` | Handle sandbox creation with polling for readiness | `{ provision, status, progress, sessionId, error }` |

### Utility Functions

| Function | Purpose | Signature |
|---|---|---|
| `generateSyntheticHospital` | Generate complete synthetic hospital dataset | `(config: SyntheticDataConfig) => SyntheticDataManifest` |
| `generateStaffingRecords` | Generate realistic staffing records | `(departmentCount: number, staffPerDept: number) => SyntheticStaffRecord[]` |
| `generateBedOccupancy` | Generate bed occupancy history with realistic patterns | `(wards: SyntheticWard[], months: number) => SyntheticOccupancyRecord[]` |
| `generateFinancialHistory` | Generate 24 months of financial data with seasonal variance | `(hospital: SyntheticHospital) => SyntheticFinanceMonth[]` |
| `generatePreSeededAnomalies` | Generate realistic anomalies at various lifecycle stages | `(modules: string[]) => PreSeededAnomaly[]` |
| `formatCountdownTime` | Format milliseconds to HH:MM:SS display | `(ms: number) => string` |
| `validateAccessCode` | Validate access code format and checksum | `(code: string) => boolean` |
| `calculateExplorationProgress` | Compute percentage of features explored | `(features: SandboxFeatureUsage) => number` |
| `buildSandboxApiUrl` | Prefix API calls with sandbox session context | `(sessionId: string, path: string) => string` |

## Acceptance Criteria

### Functional Requirements
- [ ] Prospective client can launch sandbox from landing page without authentication or account creation
- [ ] Sandbox provisions in under 10 seconds with animated loading feedback
- [ ] Sandbox pre-loaded with synthetic hospital data for all five modules (staffing: 200+ staff, beds: 500 beds, supply: 300+ items, finance: 24 months, anomalies: 15+ pre-seeded)
- [ ] Synthetic data is realistic: staff have valid roles, certifications, departments; bed occupancy follows realistic patterns; financial data shows seasonal trends
- [ ] Sandbox mirrors full product UI and functionality across all modules
- [ ] Guided tour activates on first visit with 5 steps highlighting key features
- [ ] Tour can be skipped, resumed, or dismissed permanently for the session
- [ ] Client can navigate to any module and interact with data (view dashboards, filter, sort, drill down)
- [ ] Client can run what-if simulations using the scenario builder or natural language input
- [ ] Simulation results show meaningful cascading impacts derived from synthetic data
- [ ] Quick simulation prompt provides suggestion chips for common scenarios
- [ ] Sandbox session displays countdown timer, exploration progress, and simulation counter
- [ ] Timer shows visual warnings at 30min, 15min, and 5min before expiry
- [ ] Session can be extended once (1 additional hour) via prompt at low-time warning
- [ ] Sandbox can be reset to default state at any time via reset button with confirmation
- [ ] "Request Full Demo" button opens contact form that submits to CRM
- [ ] Access codes generated by sales team allow direct entry with optional pre-configured demo state
- [ ] Expired sessions show clear expiry message with option to launch new sandbox
- [ ] No production data is accessible or affected by sandbox operations

### Non-Functional Requirements
- [ ] Sandbox provisioning completes within 10 seconds (including DB schema creation and data seeding)
- [ ] Landing page loads in under 1.5 seconds (LCP) globally via CDN
- [ ] Sandbox dashboard loads in under 2 seconds after provisioning
- [ ] Support 50 concurrent sandbox sessions without performance degradation
- [ ] Sandbox data isolation verified: no cross-session data leakage under concurrent load
- [ ] Session cleanup runs within 5 minutes of expiry; all session data purged completely
- [ ] API rate limiting enforced at 100 req/min per sandbox session
- [ ] Synthetic data generation is deterministic (same seed produces same data for reproducible demos)
- [ ] Sandbox pages achieve 90+ Lighthouse performance score
- [ ] WCAG 2.1 AA compliance for landing page and all sandbox UI

## Modified Files
```
app/
├── sandbox/
│   ├── page.tsx                                  [+] NEW - Landing page
│   ├── loading.tsx                               [+] NEW - Landing skeleton
│   ├── error.tsx                                 [+] NEW - Error boundary
│   ├── layout.tsx                                [+] NEW - Sandbox root layout
│   ├── [sessionId]/
│   │   ├── layout.tsx                            [+] NEW - Dashboard layout with banner
│   │   ├── page.tsx                              [+] NEW - Dashboard page
│   │   ├── staffing/page.tsx                     [+] NEW - Staffing in sandbox
│   │   ├── beds/page.tsx                         [+] NEW - Beds in sandbox
│   │   ├── supply-chain/page.tsx                 [+] NEW - Supply chain in sandbox
│   │   ├── finance/page.tsx                      [+] NEW - Finance in sandbox
│   │   ├── anomalies/page.tsx                    [+] NEW - Anomalies in sandbox
│   │   ├── simulations/page.tsx                  [+] NEW - Simulations in sandbox
│   │   ├── simulations/[scenarioId]/page.tsx     [+] NEW - Scenario detail
│   │   └── governance/page.tsx                   [+] NEW - Governance in sandbox
│   └── _components/
│       ├── SandboxHeroSection.tsx                [+] NEW
│       ├── LaunchSandboxButton.tsx               [+] NEW
│       ├── AccessCodeInput.tsx                   [+] NEW
│       ├── FeaturePreviewCards.tsx               [+] NEW
│       ├── FeaturePreviewCard.tsx                [+] NEW
│       ├── SandboxBanner.tsx                     [+] NEW
│       ├── SandboxModeIndicator.tsx              [+] NEW
│       ├── SessionCountdownTimer.tsx             [+] NEW
│       ├── ResetSandboxButton.tsx                [+] NEW
│       ├── SandboxResetConfirmDialog.tsx         [+] NEW
│       ├── GuidedTourOverlay.tsx                 [+] NEW
│       ├── TourStepCard.tsx                      [+] NEW
│       ├── TourHighlightPointer.tsx              [+] NEW
│       ├── ModuleNavigationGrid.tsx              [+] NEW
│       ├── ModuleNavigationCard.tsx              [+] NEW
│       ├── QuickSimulationPrompt.tsx             [+] NEW
│       ├── SuggestionChips.tsx                   [+] NEW
│       ├── SessionInfoBar.tsx                    [+] NEW
│       ├── ExplorationProgress.tsx               [+] NEW
│       ├── RequestFullDemoButton.tsx             [+] NEW
│       ├── RequestDemoModal.tsx                  [+] NEW
│       ├── SandboxModuleWrapper.tsx              [+] NEW
│       ├── SandboxContextProvider.tsx            [+] NEW
│       ├── SandboxProvisioningLoader.tsx         [+] NEW
│       └── SessionExpiredModal.tsx               [+] NEW
├── api/v1/sandbox/
│   ├── route.ts                                  [+] NEW - Create session
│   ├── [sessionId]/route.ts                      [+] NEW - Session status/terminate
│   ├── [sessionId]/reset/route.ts                [+] NEW - Reset data
│   ├── [sessionId]/extend/route.ts               [+] NEW - Extend TTL
│   ├── [sessionId]/analytics/route.ts            [+] NEW - Track usage
│   ├── validate-code/route.ts                    [+] NEW - Validate access code
│   ├── request-demo/route.ts                     [+] NEW - Demo request form
│   └── provision/route.ts                        [+] NEW - Provision resources
lib/
├── sandbox/
│   ├── sandbox-manager.ts                        [+] NEW - Lifecycle manager
│   ├── sandbox-types.ts                          [+] NEW - Type definitions
│   ├── sandbox-provisioner.ts                    [+] NEW - DB/data provisioning
│   ├── sandbox-cleanup.ts                        [+] NEW - TTL cleanup worker
│   ├── access-codes.ts                           [+] NEW - Code gen/validation
│   └── synthetic-data/
│       ├── data-generator.ts                     [+] NEW - Main orchestrator
│       ├── staffing-generator.ts                 [+] NEW
│       ├── bed-generator.ts                      [+] NEW
│       ├── supply-chain-generator.ts             [+] NEW
│       ├── finance-generator.ts                  [+] NEW
│       ├── anomaly-generator.ts                  [+] NEW
│       ├── patient-generator.ts                  [+] NEW
│       └── relationship-generator.ts             [+] NEW
├── db/schema/
│   ├── sandbox-sessions.ts                       [+] NEW - Session table
│   ├── sandbox-access-codes.ts                   [+] NEW - Access codes table
│   └── demo-requests.ts                          [+] NEW - Demo requests table
```

## Implementation Status
**OVERALL STATUS**: :white_large_square: NOT STARTED

### Phase 1: Synthetic Data Generation (Week 1-3)
| Task | Status |
|---|---|
| Design synthetic data manifest schema matching all five module data structures | :white_large_square: Not Started |
| Build `staffing-generator.ts` with realistic staff, shift, and overtime records | :white_large_square: Not Started |
| Build `bed-generator.ts` with ward configurations and occupancy history | :white_large_square: Not Started |
| Build `supply-chain-generator.ts` with items, suppliers, and purchase orders | :white_large_square: Not Started |
| Build `finance-generator.ts` with 24-month financial history with seasonal patterns | :white_large_square: Not Started |
| Build `anomaly-generator.ts` with pre-seeded anomalies across severity and status | :white_large_square: Not Started |
| Build `relationship-generator.ts` for Neo4j cross-module dependency graph | :white_large_square: Not Started |
| Build `data-generator.ts` orchestrator with deterministic seeding | :white_large_square: Not Started |
| Validate synthetic data quality against real hospital data field structures | :white_large_square: Not Started |

### Phase 2: Sandbox Infrastructure (Week 4-5)
| Task | Status |
|---|---|
| Implement `sandbox-manager.ts` session lifecycle (create, status, terminate, cleanup) | :white_large_square: Not Started |
| Build `sandbox-provisioner.ts` for database schema creation and data seeding per session | :white_large_square: Not Started |
| Implement session isolation (PostgreSQL schema-per-session, Redis namespace, Neo4j partition) | :white_large_square: Not Started |
| Build `sandbox-cleanup.ts` BullMQ worker for TTL-based session cleanup | :white_large_square: Not Started |
| Implement `access-codes.ts` generation and validation | :white_large_square: Not Started |
| Build all sandbox API endpoints (create, status, reset, extend, analytics, validate-code, request-demo) | :white_large_square: Not Started |
| Configure rate limiting and IP throttling for sandbox endpoints | :white_large_square: Not Started |

### Phase 3: Landing Page & Sandbox UI (Week 6-8)
| Task | Status |
|---|---|
| Build `SandboxLandingPage` with hero, feature cards, and launch CTA | :white_large_square: Not Started |
| Implement `LaunchSandboxButton` with provisioning flow and `SandboxProvisioningLoader` | :white_large_square: Not Started |
| Build `AccessCodeInput` with validation | :white_large_square: Not Started |
| Implement `SandboxDashboardLayout` with `SandboxBanner` and `SessionCountdownTimer` | :white_large_square: Not Started |
| Build `ModuleNavigationGrid` and `ModuleNavigationCard` components | :white_large_square: Not Started |
| Implement `QuickSimulationPrompt` with `SuggestionChips` | :white_large_square: Not Started |
| Build `GuidedTourOverlay` with `TourStepCard` and spotlight highlighting | :white_large_square: Not Started |
| Implement `SandboxModuleWrapper` and `SandboxContextProvider` for module page wrapping | :white_large_square: Not Started |
| Build sandbox-scoped module pages (staffing, beds, supply, finance, anomalies, simulations, governance) | :white_large_square: Not Started |

### Phase 4: Polish, Analytics & Sales Integration (Week 9-10)
| Task | Status |
|---|---|
| Build `RequestDemoModal` with contact form and CRM submission | :white_large_square: Not Started |
| Implement `useSandboxAnalytics` for feature usage tracking | :white_large_square: Not Started |
| Build `SessionInfoBar` with `ExplorationProgress` and simulation counter | :white_large_square: Not Started |
| Implement session extension flow with `SessionExpiredModal` | :white_large_square: Not Started |
| Responsive design implementation across all breakpoints | :white_large_square: Not Started |
| Performance optimization (CDN configuration, lazy loading, image optimization) | :white_large_square: Not Started |
| End-to-end testing of full sandbox lifecycle and module interactions | :white_large_square: Not Started |
| Load testing with 50 concurrent sandbox sessions | :white_large_square: Not Started |

## Dependencies
| Dependency | Type | Status | Notes |
|---|---|---|---|
| Staffing Module UI (Story 01) | Component Source | Required | Module components reused within sandbox wrapper |
| Bed Allocation Module UI (Story 02) | Component Source | Required | Module components reused within sandbox wrapper |
| Supply Chain Module UI (Story 03) | Component Source | Required | Module components reused within sandbox wrapper |
| Finance Module UI (Story 04) | Component Source | Required | Module components reused within sandbox wrapper |
| Anomaly Detection UI (Story 05) | Component Source | Required | Module components reused within sandbox wrapper |
| Simulation Engine (Story 06) | Feature Dependency | Required | What-if simulation must work on synthetic data |
| Data Governance Dashboard (Story 08) | Component Source | Recommended | Optional module for sandbox exploration |
| Claude API Access | External Service | Required | NLP parsing for quick simulation prompt |
| Faker.js or similar | NPM Package | Required | Synthetic data generation library |
| PostgreSQL Multi-Schema | Infrastructure | Required | Schema-per-session isolation |
| Redis Namespacing | Infrastructure | Required | Isolated cache per sandbox session |
| CRM Integration (HubSpot/Salesforce) | External Service | Recommended | Demo request form submission |

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Synthetic Data Unrealism**: Demo data doesn't feel believable to hospital administrators | High | Critical | Consult domain experts for realistic ranges, patterns, names; use actual Southeast Asian hospital benchmarks; iterative validation with sales team |
| **Provisioning Latency**: Sandbox creation exceeds 10s target causing user drop-off | Medium | High | Pre-provision warm pool of sandbox instances (5 ready at all times), lazy-load Neo4j data, seed in parallel |
| **Resource Exhaustion**: Large number of concurrent sandboxes overwhelms infrastructure | Medium | High | Hard cap at 50 concurrent sessions, queuing for excess, auto-cleanup on expiry, right-size ECS task definitions |
| **Module Dependency**: Sandbox blocked by incomplete module implementations | High | Critical | Build sandbox wrapper as abstraction layer; stub incomplete modules with static dashboards; prioritize module-by-module completion |
| **Cross-Session Data Leakage**: Bug causes one sandbox to access another's data | Low | Critical | Schema-level PostgreSQL isolation, automated integration tests for isolation, security audit pre-launch |
| **Session Cleanup Failures**: Orphaned sandbox resources consume storage/memory | Medium | Medium | Redundant cleanup: BullMQ scheduled job + daily cron sweep; monitoring dashboard for orphaned sessions; manual purge CLI tool |

## Testing Strategy
- **Unit Tests**: Synthetic data generators produce valid records matching schema; access code generation/validation; countdown timer calculations; exploration progress computation
- **Integration Tests**: Full sandbox lifecycle: provision -> seed -> interact -> reset -> cleanup; session isolation: two concurrent sessions cannot access each other's data; API rate limiting enforcement; access code flow from generation to sandbox creation
- **Component Tests**: `SandboxLandingPage` renders hero, features, and launch button; `SessionCountdownTimer` shows correct time and warning colors; `GuidedTourOverlay` navigates steps correctly; `SandboxBanner` displays mode and timer; `ModuleNavigationCard` shows correct KPIs from synthetic data
- **End-to-End Tests**: Full prospect flow: land -> launch -> tour -> explore modules -> run simulation -> request demo; Access code flow: enter code -> validate -> enter sandbox with preset; Reset flow: explore -> reset -> verify all data restored to defaults; Expiry flow: session expires -> modal shown -> launch new session
- **Load Tests**: 50 concurrent sandbox sessions: provision latency, query response times, memory consumption; 100 rapid sandbox creations: queue handling, cleanup worker throughput
- **Security Tests**: Cross-session data access attempts; SQL injection on sandbox API endpoints; Rate limit bypass attempts; Session token forgery

## Performance Considerations
- **Warm Pool**: Maintain 5 pre-provisioned sandbox instances ready for instant assignment (provision new ones to backfill pool asynchronously)
- **Parallel Data Seeding**: Seed staffing, beds, supply, finance, and anomaly data in parallel during provisioning (`Promise.allSettled`)
- **Lightweight Neo4j Seeding**: Use Cypher batch imports instead of individual node creation for graph seeding (10x faster)
- **CDN Landing Page**: Landing page statically generated at build time (`generateStaticParams`), served from CloudFront edge
- **Lazy Module Loading**: Sandbox module pages use `next/dynamic` to code-split each module independently
- **Redis Session State**: Store sandbox session state in Redis (not PostgreSQL) for sub-millisecond reads on every API call
- **Compressed Synthetic Data Templates**: Pre-compute synthetic data as compressed JSON fixtures; hydrate into database rather than generating on-the-fly
- **Image Optimization**: All landing page images served via `next/image` with WebP format and responsive sizes

## Deployment Plan
1. **Synthetic Data Validation**: Generate and review synthetic dataset with domain experts; iterate until deemed realistic
2. **Infrastructure Setup**: Configure PostgreSQL multi-schema support, Redis namespacing, Neo4j database partitioning
3. **Backend Deploy**: Deploy sandbox manager, provisioner, cleanup worker, and API endpoints to ECS
4. **Warm Pool Bootstrap**: Initialize 5 pre-provisioned sandbox instances in staging
5. **Landing Page Deploy**: Deploy static landing page to CloudFront distribution
6. **Internal Dog-fooding**: Sales team tests full sandbox flow; collects feedback on data realism and UX
7. **Guided Tour Calibration**: Refine tour steps based on internal testing; adjust spotlight positions and descriptions
8. **Production Launch**: Deploy to production with monitoring; announce to sales team for prospect engagement
9. **CRM Integration**: Connect demo request form to sales CRM; configure notification workflows
10. **Post-Launch Monitoring**: Monitor concurrent sessions, provisioning latency, cleanup success rates

## Monitoring & Analytics
- **Sandbox Provisioning Time**: Track P50/P95 provisioning latency (target: P95 <10s)
- **Concurrent Session Count**: Real-time gauge of active sandbox sessions (alert if >45 of 50 max)
- **Session Duration**: Track average and median session duration (engagement metric)
- **Exploration Depth**: Track percentage of features explored per session
- **Simulation Engagement**: Track number of simulations run per session (target: average >2)
- **Tour Completion Rate**: Track percentage of users who complete guided tour vs. skip
- **Demo Request Rate**: Track percentage of sandbox sessions that result in demo request form submission
- **Landing Page Conversion**: Track percentage of landing page visitors who launch sandbox
- **Access Code Redemption**: Track percentage of generated access codes redeemed
- **Session Cleanup Health**: Monitor cleanup worker success rate and orphaned session count
- **Error Rate**: Track sandbox creation failures, session errors, and module loading errors
- **Geographic Distribution**: Track sandbox usage by region for sales territory insights

## Documentation Requirements
- **Sales Team Guide**: How to generate access codes, configure demo presets, interpret sandbox analytics
- **Sandbox Setup Guide**: Infrastructure requirements, configuration parameters, scaling guidelines
- **Synthetic Data Specification**: Data schemas, generation rules, customization options for different hospital sizes
- **Guided Tour Authoring Guide**: How to modify tour steps, add new features to the tour
- **Troubleshooting Runbook**: Common sandbox issues (provisioning failures, session stuck, cleanup backlog)
- **CRM Integration Guide**: How demo requests flow to CRM, notification configuration, lead scoring integration

## Post-Launch Review
- **Week 1 Review**: Monitor sandbox completion rates and drop-off points; identify UX friction in provisioning and tour; verify data cleanup is running reliably
- **Week 2 Review**: Gather sales team feedback on prospect reactions; adjust synthetic data if specific modules feel unrealistic; tune guided tour content
- **Week 4 Review**: Analyze demo request conversion funnel; identify most-explored and least-explored features; A/B test different suggestion chips for quick simulation
- **Month 2 Review**: Correlate sandbox engagement metrics with sales outcomes; identify which features most influence purchase decisions; create customized demo presets per hospital size/type
- **Quarter 1 Review**: Full retrospective on sandbox ROI (sandbox sessions vs. closed deals); plan regional customizations for Thai, Malaysian, Indonesian markets; evaluate self-service purchase pathway from sandbox
