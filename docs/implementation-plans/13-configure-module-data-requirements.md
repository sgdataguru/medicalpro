# 13 Configure Module-Specific Data Requirements - Implementation Planning

## Project Context
**Technical Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4
**Backend**: NestJS, PostgreSQL, Neo4j (Graph DB), Redis, BullMQ
**AI Layer**: Claude API (data processing, NLP)
**Infrastructure**: AWS (ECS/Lambda), GitHub Actions CI/CD

## User Story

As a **Medical Pro implementation consultant**, I want **to define and configure the specific data fields required for each analytics module before data collection begins**, so that **the hospital captures exactly the data needed for predictive analytics from day one, avoiding costly rework**.

## Pre-conditions

- Platform modules (staffing, bed allocation, supply chain, finance, anomaly detection) are defined with base analytical capabilities
- Predictive model requirements documented for each module (which outputs require which inputs)
- PostgreSQL schema supports dynamic field configuration with module-field-capability mapping
- Implementation consultant authenticated with `implementation_consultant` or `system_admin` role
- Hospital client profile created in the system with organization name, size, and module subscriptions
- Template field configurations (70% standard) loaded for each module as defaults
- PDF/Excel export capability available for generating data requirements documents

## Business Requirements

- **Onboarding Efficiency**: Module data configuration completed in < 4 hours per hospital (currently unbounded); produces ready-to-share data requirements document
- **Coverage Clarity**: For every hospital configuration, the system clearly indicates which analytics capabilities are fully supported, partially supported, or unavailable based on configured data fields
- **Output-First Accuracy**: 100% of required data fields are traced back to a specific predictive model output (no "nice-to-have" fields without analytical justification)
- **Hybrid Compliance**: Every module configuration has >= 70% standard fields; remaining <= 30% are hospital-customizable fields
- **Pre-Sales Support**: Configuration interface generates a professional data requirements document exportable as PDF for use in pre-sales and implementation kickoff meetings
- **Field Coverage Tracking**: System tracks field coverage percentage per module in real-time during configuration

## Technical Specifications

### Integration Points
- **Predictive Model Registry**: Internal registry mapping model outputs to required input fields (output-first / Kimball approach)
- **Data Ingestion Pipeline** (Story 09): Configured field schemas feed directly into ingestion validation rules
- **Data Quality Dashboard** (Story 08): Field configuration determines what gets measured for data quality
- **Neo4j Graph Database**: Field relationships and cross-module dependencies modeled as graph for impact analysis
- **Claude API**: AI-assisted field mapping suggestions when hospital provides partial field lists; gap analysis narrative generation
- **PDF Generation**: Server-side PDF rendering (Puppeteer or React-PDF) for data requirements document export
- **Excel Export**: CSV/XLSX export for data field specifications using xlsx library

### Security Requirements
- Field configurations contain hospital-specific data structure information; access restricted to `implementation_consultant`, `system_admin`, and `hospital_administrator` roles
- Configuration changes audited with user attribution and timestamp
- Data requirements documents may contain competitive intelligence; hospital-scoped access control
- PDF exports watermarked with hospital name and generation date
- Template field configurations (standard 70%) are read-only for non-admin users

## Design Specifications

### Visual Layout & Components

**Module Data Configuration Layout**:
```
+------------------------------------------------------------------+
| [TopNav: MedicalPro Logo | Modules | Settings | User Avatar]     |
+------------------------------------------------------------------+
| [Sidebar]     |  [ModuleConfigurator]                            |
|               |  +----------------------------------------------+|
| Configuration |  | Module Data Requirements  [Hospital: ABC v]  ||
|  > Staffing   |  +----------------------------------------------+|
|  > Beds       |                                                   |
|  > Supply     |  +----------------------------------------------+|
|  > Finance    |  | Module: Staffing              [72% Coverage] ||
|  > Anomaly    |  | +------------------------------------------+||
|               |  | | Tab: [Required] [Optional] [Custom] [Map] |||
| Actions       |  | +------------------------------------------+||
|  > Export PDF |  |                                              ||
|  > Export CSV |  | Required Fields (18/25 mapped)              ||
|  > Preview    |  | +------------------------------------------+||
|               |  | | Field Name     | Type   | Source  | Status|||
|               |  | | employee_id    | string | HIS    | [OK]  |||
|               |  | | department_id  | string | HIS    | [OK]  |||
|               |  | | role_type      | enum   | Manual | [OK]  |||
|               |  | | shift_start    | datetime| Sched | [OK]  |||
|               |  | | shift_end      | datetime| Sched | [OK]  |||
|               |  | | hourly_rate    | decimal| Payroll| [MISS]|||
|               |  | | overtime_hours | decimal| Payroll| [MISS]|||
|               |  | | ...            |        |        |       |||
|               |  | +------------------------------------------+||
|               |  |                                              ||
|               |  | Capability Impact:                           ||
|               |  | +------------------------------------------+||
|               |  | | Capability          | Status  | Fields   |||
|               |  | | Shift Optimization  | FULL    | 8/8      |||
|               |  | | Overtime Prediction | LIMITED | 5/7      |||
|               |  | | Turnover Risk       | UNAVAIL | 2/6      |||
|               |  | +------------------------------------------+||
|               |  |                                              ||
|               |  | Custom Fields (Hospital-Specific):           ||
|               |  | +------------------------------------------+||
|               |  | | [+ Add Custom Field]                     |||
|               |  | | nurse_specialty    | enum   | Manual     |||
|               |  | | language_spoken    | string | HR System  |||
|               |  | +------------------------------------------+||
|               |  +----------------------------------------------+|
|               |                                                   |
|               |  +----------------------------------------------+|
|               |  | Field Mapping Interface                      ||
|               |  | Hospital Source: [Select Source v]            ||
|               |  | +------------------------------------------+||
|               |  | | Platform Field   -> Hospital Source Field  |||
|               |  | | employee_id      -> staff_number           |||
|               |  | | department_id    -> dept_code              |||
|               |  | | role_type        -> [Unmapped - Select]   |||
|               |  | +------------------------------------------+||
|               |  | [AI Suggest Mappings]  [Apply All]           ||
|               |  +----------------------------------------------+|
+------------------------------------------------------------------+
```

### Component Hierarchy
```
<AppLayout>
  <TopNavigation />
  <Sidebar activeModule="configuration" />
  <MainContent>
    <ModuleConfigurator>
      <HospitalSelector />
      <ModuleTabBar>
        <ModuleTab module="staffing" coverage={72} />
        <ModuleTab module="bed_allocation" coverage={85} />
        <ModuleTab module="supply_chain" coverage={60} />
        <ModuleTab module="finance" coverage={91} />
        <ModuleTab module="anomaly_detection" coverage={78} />
      </ModuleTabBar>
      <ModuleFieldConfiguration>
        <FieldCategoryTabs>
          <RequiredFieldsTab />
          <OptionalFieldsTab />
          <CustomFieldsTab />
          <FieldMappingTab />
        </FieldCategoryTabs>
        <FieldTable>
          <FieldRow>
            <FieldName />
            <FieldType />
            <FieldSource />
            <FieldStatus />
            <FieldActions />
          </FieldRow>
        </FieldTable>
        <CoverageProgressBar />
      </ModuleFieldConfiguration>
      <CapabilityImpactPanel>
        <CapabilityRow>
          <CapabilityName />
          <CapabilityStatus />
          <FieldCoverageRatio />
        </CapabilityRow>
      </CapabilityImpactPanel>
      <CustomFieldEditor>
        <AddCustomFieldForm />
        <CustomFieldList />
      </CustomFieldEditor>
      <FieldMappingInterface>
        <SourceSelector />
        <MappingRow />
        <AISuggestButton />
      </FieldMappingInterface>
      <DataRequirementsExport>
        <ExportPDFButton />
        <ExportCSVButton />
        <PreviewButton />
      </DataRequirementsExport>
    </ModuleConfigurator>
  </MainContent>
</AppLayout>
```

### Design System Compliance

**Color Usage**:
```css
/* Field status colors */
--field-mapped: #28A745;                        /* Green - successfully mapped */
--field-missing: #DC3545;                       /* Red - required but unmapped */
--field-partial: #FFB74D;                       /* Amber - optional or partially mapped */
--field-custom: var(--primary-gold);            /* #C9A84A - hospital custom field */

/* Capability status colors */
--capability-full: #28A745;                     /* Green - all fields present */
--capability-limited: #FFB74D;                  /* Amber - subset of fields present */
--capability-unavailable: #DC3545;              /* Red - insufficient fields */

/* Coverage progress bar gradient */
--coverage-gradient: linear-gradient(90deg, var(--primary-teal) 0%, var(--primary-cerulean) 100%);
--coverage-bg: var(--secondary-platinum);       /* #E9ECEC - unfilled bar */

/* Module tab active state */
--tab-active-border: var(--primary-teal);       /* #007B7A */
--tab-active-bg: rgba(0, 123, 122, 0.05);
```

**Typography**:
```css
/* Module heading: Merriweather semibold */
.module-heading { font-family: var(--font-heading); font-weight: 600; font-size: var(--text-2xl); }
/* Field name: JetBrains Mono for technical accuracy */
.field-name { font-family: var(--font-mono); font-weight: 500; font-size: var(--text-sm); }
/* Field type: JetBrains Mono italic */
.field-type { font-family: var(--font-mono); font-weight: 400; font-size: var(--text-xs); font-style: italic; }
/* Capability status: Inter semibold */
.capability-status { font-family: var(--font-body); font-weight: 600; font-size: var(--text-sm); text-transform: uppercase; }
/* Coverage percentage: Inter bold */
.coverage-value { font-family: var(--font-body); font-weight: 700; font-size: var(--text-xl); }
```

### Responsive Behavior

| Breakpoint | Layout Adaptation |
|---|---|
| Desktop (>= 1280px) | Sidebar + module tabs (horizontal) + field table (full) + capability panel (side-by-side) |
| Laptop (1024-1279px) | Collapsed sidebar; field table shows essential columns only; capability panel below field table |
| Tablet (768-1023px) | Bottom nav; module selector as dropdown; field table as card list; mapping interface stacked |
| Mobile (< 768px) | Full-width cards; module carousel; field cards with swipe; export buttons fixed at bottom |

### Interaction Patterns

- **Module Selection**: Click module tab to switch context; coverage percentage badge on each tab; unsaved changes prompt confirmation before switch
- **Field Status Toggle**: Click field source cell to open source selector dropdown; selecting a source changes status from "MISS" to "OK" with green animation
- **Capability Impact**: Real-time update of capability status as fields are mapped/unmapped; limited capabilities show tooltip explaining which fields are missing
- **Custom Field Addition**: Click "+ Add Custom Field" -> inline row appears with name, type, and source inputs -> validates field name uniqueness -> saves on Enter or click
- **AI Mapping Suggestions**: Click "AI Suggest Mappings" -> loading spinner -> Claude API suggests source-to-platform field mappings based on field names and hospital source schema -> one-click accept for each suggestion
- **Coverage Progress Bar**: Animated horizontal bar showing mapped/total ratio; updates in real-time as fields are configured; color transitions from red (< 50%) to amber (50-79%) to green (>= 80%)
- **Export PDF**: Click "Export PDF" -> generates formatted data requirements document -> downloads automatically; includes hospital name, date, module configurations, capability impacts
- **Preview Mode**: Opens full-screen read-only view of the data requirements document as it would appear in PDF; useful for review before export

## Technical Architecture

### Component Structure
```
app/
├── (dashboard)/
│   └── configuration/
│       └── modules/
│           ├── page.tsx                              # Module configurator entry
│           ├── layout.tsx                            # Configuration layout
│           ├── loading.tsx                           # Loading skeleton
│           ├── error.tsx                             # Error boundary
│           ├── [moduleId]/
│           │   ├── page.tsx                          # Single module field config
│           │   └── mapping/
│           │       └── page.tsx                      # Field mapping interface
│           ├── export/
│           │   └── page.tsx                          # Export preview + generation
│           └── components/
│               ├── ModuleConfigurator.tsx             # Main configurator container
│               ├── HospitalSelector.tsx               # Hospital selection dropdown
│               ├── ModuleTabBar.tsx                    # Module selection tabs
│               ├── ModuleTab.tsx                       # Individual tab with coverage badge
│               ├── ModuleFieldConfiguration.tsx        # Field table container
│               ├── FieldCategoryTabs.tsx               # Required/Optional/Custom/Map tabs
│               ├── FieldTable.tsx                      # Sortable field table
│               ├── FieldRow.tsx                        # Individual field row
│               ├── FieldStatusBadge.tsx                # Mapped/Missing/Partial badge
│               ├── FieldSourceSelector.tsx             # Source dropdown for field mapping
│               ├── CoverageProgressBar.tsx             # Animated coverage bar
│               ├── CapabilityImpactPanel.tsx           # Capability status list
│               ├── CapabilityRow.tsx                   # Single capability status
│               ├── CapabilityTooltip.tsx               # Missing fields tooltip
│               ├── CustomFieldEditor.tsx               # Custom field CRUD
│               ├── AddCustomFieldForm.tsx              # Inline add custom field
│               ├── FieldMappingInterface.tsx           # Source-to-platform mapping
│               ├── MappingRow.tsx                      # Single mapping row
│               ├── AISuggestMappingsButton.tsx         # Claude AI suggestion trigger
│               ├── DataRequirementsExport.tsx          # Export controls
│               ├── ExportPreviewModal.tsx              # Full-screen export preview
│               ├── PDFDocumentTemplate.tsx             # PDF layout template
│               └── hooks/
│                   ├── useModuleConfiguration.ts       # Module field config CRUD
│                   ├── useFieldMappings.ts             # Field mapping state
│                   ├── useCapabilityImpact.ts          # Capability status calculation
│                   ├── useCoverageMetrics.ts           # Per-module coverage metrics
│                   ├── useCustomFields.ts              # Custom field CRUD
│                   ├── useAISuggestions.ts             # Claude field mapping suggestions
│                   ├── useExportDocument.ts            # PDF/CSV export generation
│                   └── useHospitalSelector.ts          # Hospital context switching
├── lib/
│   ├── api/
│   │   ├── module-config-api.ts                      # Module configuration REST client
│   │   ├── field-mapping-api.ts                      # Field mapping REST client
│   │   ├── capability-api.ts                         # Capability impact REST client
│   │   └── export-api.ts                             # Export generation REST client
│   ├── templates/
│   │   ├── staffing-fields.ts                        # Standard staffing field template
│   │   ├── bed-allocation-fields.ts                  # Standard bed allocation template
│   │   ├── supply-chain-fields.ts                    # Standard supply chain template
│   │   ├── finance-fields.ts                         # Standard finance template
│   │   └── anomaly-detection-fields.ts               # Standard anomaly detection template
│   └── utils/
│       ├── configuration-utils.ts                    # Config formatting helpers
│       ├── coverage-calculator.ts                    # Coverage metrics calculation
│       ├── capability-resolver.ts                    # Output-first capability resolution
│       └── export-formatter.ts                       # PDF/CSV formatting
├── types/
│   ├── module-config.types.ts                        # Core configuration types
│   ├── field-definition.types.ts                     # Field definition types
│   ├── capability.types.ts                           # Capability mapping types
│   └── export.types.ts                               # Export document types
└── services/
    └── configuration/
        ├── ModuleConfigurationService.ts             # Main config orchestrator
        ├── FieldDefinitionRegistry.ts                # Standard + custom field registry
        ├── CapabilityResolver.ts                     # Output-first capability checking
        ├── CoverageCalculator.ts                     # Real-time coverage metrics
        ├── FieldMappingSuggester.ts                  # Claude AI mapping suggestions
        └── DataRequirementsDocumentGenerator.ts      # PDF/CSV export generation
```

### State Management Architecture

```typescript
// types/module-config.types.ts

type HospitalModule = 'staffing' | 'bed_allocation' | 'supply_chain' | 'finance' | 'anomaly_detection';

/** Complete module configuration for a hospital */
interface ModuleConfiguration {
  id: string;
  hospitalId: string;
  module: HospitalModule;
  version: number;                               // Config version for change tracking

  // Fields
  standardFields: FieldDefinition[];             // 70% standard (template-derived)
  customFields: FieldDefinition[];               // 30% hospital-customizable
  fieldMappings: FieldMapping[];

  // Coverage
  coverage: CoverageMetrics;
  capabilities: CapabilityStatus[];

  // Metadata
  configuredBy: string;
  configuredAt: string;
  lastModifiedAt: string;
  isFinalized: boolean;                          // Locked after finalization
}

/** Definition of a single data field */
interface FieldDefinition {
  id: string;
  fieldName: string;                             // Technical name (snake_case)
  displayName: string;                           // Human-readable name
  description: string;                           // Explanation of field purpose
  dataType: FieldDataType;
  constraints: FieldConstraints;
  category: 'required' | 'optional';
  isStandard: boolean;                           // true = part of 70% standard; false = custom
  isCustom: boolean;                             // Hospital-added custom field

  // Output-first traceability
  requiredByCapabilities: string[];              // Which capabilities need this field
  requiredByModels: string[];                    // Which predictive models need this field

  // Mapping
  mappingStatus: 'mapped' | 'unmapped' | 'default_value';
  sourceSystem: string | null;                   // Hospital source system name
  sourceField: string | null;                    // Field name in source system
  transformationRule: string | null;             // Optional transformation expression
  defaultValue: unknown | null;                  // Fallback default value
}

type FieldDataType =
  | 'string'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'currency'
  | 'percentage'
  | 'duration'
  | 'json';

interface FieldConstraints {
  required: boolean;
  unique: boolean;
  minLength: number | null;
  maxLength: number | null;
  minValue: number | null;
  maxValue: number | null;
  pattern: string | null;                        // Regex pattern
  enumValues: string[] | null;                   // For enum type
  enumLabels: Record<string, string> | null;     // Display labels for enum values
  referenceTable: string | null;                 // Foreign key reference
}

// types/field-definition.types.ts

/** Mapping from hospital source field to platform field */
interface FieldMapping {
  id: string;
  platformFieldId: string;
  platformFieldName: string;
  sourceSystem: string;                          // e.g., "HIS", "Payroll", "Scheduling"
  sourceField: string;                           // e.g., "staff_number"
  transformationRule: string | null;             // e.g., "UPPER(value)", "DATE_FORMAT(value, 'YYYY-MM-DD')"
  isAISuggested: boolean;                        // Was this mapping AI-suggested?
  confidence: number;                            // AI suggestion confidence (0-100) or 100 for manual
  validatedBy: string | null;                    // Consultant who validated this mapping
  validatedAt: string | null;
}

// types/capability.types.ts

/** An analytical capability tied to a set of required fields */
interface AnalyticalCapability {
  id: string;
  module: HospitalModule;
  name: string;                                  // e.g., "Shift Optimization"
  description: string;
  tier: 'core' | 'advanced' | 'predictive';      // Capability tier
  requiredFields: string[];                       // Field IDs required for full capability
  minimumFields: string[];                        // Minimum field IDs for limited capability

  // Output-first traceability
  predictiveModelId: string;                      // Which model produces this output
  outputMetrics: string[];                        // What metrics this capability produces
}

/** Status of a capability given current field configuration */
interface CapabilityStatus {
  capabilityId: string;
  capabilityName: string;
  module: HospitalModule;
  status: 'full' | 'limited' | 'unavailable';
  totalRequiredFields: number;
  mappedRequiredFields: number;
  missingFields: string[];                        // Field names that are unmapped
  limitations: string[];                          // Human-readable limitations when limited
}

// Coverage metrics

interface CoverageMetrics {
  module: HospitalModule;
  totalRequiredFields: number;
  mappedRequiredFields: number;
  requiredCoveragePercentage: number;
  totalOptionalFields: number;
  mappedOptionalFields: number;
  optionalCoveragePercentage: number;
  customFieldCount: number;
  overallCoveragePercentage: number;
  standardFieldPercentage: number;                // Must be >= 70%
  customFieldPercentage: number;                  // Must be <= 30%
}

// types/export.types.ts

/** Data requirements document structure for export */
interface DataRequirementsDocument {
  hospitalName: string;
  generatedAt: string;
  generatedBy: string;
  modules: ModuleRequirementSection[];
  overallSummary: OverallSummary;
}

interface ModuleRequirementSection {
  module: HospitalModule;
  moduleName: string;
  coverage: CoverageMetrics;
  capabilities: CapabilityStatus[];
  requiredFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
  customFields: FieldDefinition[];
  mappings: FieldMapping[];
  gapAnalysis: string;                            // Claude-generated gap analysis
}

interface OverallSummary {
  totalModules: number;
  configuredModules: number;
  overallCoverage: number;
  fullCapabilities: number;
  limitedCapabilities: number;
  unavailableCapabilities: number;
  executiveSummary: string;                       // Claude-generated executive summary
}

// --- Hospital Source System ---

interface HospitalSourceSystem {
  id: string;
  hospitalId: string;
  name: string;                                   // e.g., "HIS", "Payroll System", "Scheduling System"
  type: 'ehr' | 'payroll' | 'scheduling' | 'billing' | 'inventory' | 'hr' | 'custom';
  availableFields: SourceField[];
  connectionStatus: 'connected' | 'pending' | 'not_configured';
}

interface SourceField {
  fieldName: string;
  dataType: string;
  sampleValues: string[];                         // 3-5 sample values for mapping assistance
  description: string | null;
}

// --- State Management ---

interface ModuleConfiguratorPageState {
  hospital: {
    selectedHospitalId: string | null;
    hospitals: HospitalSummary[];
    isLoading: boolean;
  };
  activeModule: HospitalModule;
  configuration: {
    current: ModuleConfiguration | null;
    isLoading: boolean;
    isDirty: boolean;                             // Unsaved changes
    error: string | null;
  };
  fields: {
    activeTab: 'required' | 'optional' | 'custom' | 'mapping';
    sortBy: 'name' | 'status' | 'type' | 'source';
    sortOrder: 'asc' | 'desc';
    searchQuery: string;
  };
  capabilities: {
    items: CapabilityStatus[];
    isLoading: boolean;
  };
  mapping: {
    selectedSource: HospitalSourceSystem | null;
    availableSources: HospitalSourceSystem[];
    aiSuggestions: FieldMapping[];
    isLoadingSuggestions: boolean;
  };
  export: {
    isGenerating: boolean;
    isPreviewOpen: boolean;
    previewData: DataRequirementsDocument | null;
  };
  customField: {
    isAddingField: boolean;
    editingFieldId: string | null;
    formData: Partial<FieldDefinition>;
    validationErrors: Record<string, string>;
  };
}

interface HospitalSummary {
  id: string;
  name: string;
  moduleSubscriptions: HospitalModule[];
  configurationStatus: 'not_started' | 'in_progress' | 'finalized';
}
```

### API Integration Schema

```typescript
// --- REST API Endpoints ---

// Get Module Configurations for Hospital
// GET /api/v1/configuration/modules?hospitalId={id}
interface GetModuleConfigurationsResponse {
  success: boolean;
  data: {
    configurations: ModuleConfiguration[];
    overallCoverage: number;
  };
}

// Get Single Module Configuration
// GET /api/v1/configuration/modules/{moduleId}?hospitalId={id}
interface GetModuleConfigurationResponse {
  success: boolean;
  data: ModuleConfiguration;
}

// Update Module Configuration
// PUT /api/v1/configuration/modules/{moduleId}
interface UpdateModuleConfigurationRequest {
  hospitalId: string;
  fieldMappings: FieldMapping[];
  customFields: FieldDefinition[];
}
interface UpdateModuleConfigurationResponse {
  success: boolean;
  data: ModuleConfiguration;
}

// Get Capability Impact
// GET /api/v1/configuration/modules/{moduleId}/capabilities?hospitalId={id}
interface GetCapabilityImpactResponse {
  success: boolean;
  data: CapabilityStatus[];
}

// Add Custom Field
// POST /api/v1/configuration/modules/{moduleId}/fields/custom
interface AddCustomFieldRequest {
  hospitalId: string;
  fieldName: string;
  displayName: string;
  description: string;
  dataType: FieldDataType;
  constraints: Partial<FieldConstraints>;
  sourceSystem: string | null;
  sourceField: string | null;
}
interface AddCustomFieldResponse {
  success: boolean;
  data: FieldDefinition;
}

// Update Custom Field
// PUT /api/v1/configuration/modules/{moduleId}/fields/custom/{fieldId}
interface UpdateCustomFieldRequest {
  displayName?: string;
  description?: string;
  constraints?: Partial<FieldConstraints>;
  sourceSystem?: string;
  sourceField?: string;
}

// Delete Custom Field
// DELETE /api/v1/configuration/modules/{moduleId}/fields/custom/{fieldId}?hospitalId={id}

// Map Field to Source
// POST /api/v1/configuration/modules/{moduleId}/fields/{fieldId}/map
interface MapFieldRequest {
  hospitalId: string;
  sourceSystem: string;
  sourceField: string;
  transformationRule: string | null;
}
interface MapFieldResponse {
  success: boolean;
  data: {
    fieldMapping: FieldMapping;
    updatedCoverage: CoverageMetrics;
    updatedCapabilities: CapabilityStatus[];
  };
}

// Unmap Field
// DELETE /api/v1/configuration/modules/{moduleId}/fields/{fieldId}/map?hospitalId={id}

// Get AI Mapping Suggestions
// POST /api/v1/configuration/modules/{moduleId}/mappings/suggest
interface GetAIMappingSuggestionsRequest {
  hospitalId: string;
  sourceSystemId: string;
  unmappedFields: string[];                       // Platform field IDs to suggest mappings for
}
interface GetAIMappingSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: AIMappingSuggestion[];
    tokensUsed: number;
  };
}

interface AIMappingSuggestion {
  platformFieldId: string;
  platformFieldName: string;
  suggestedSourceField: string;
  confidence: number;                             // 0-100
  reasoning: string;                              // Why this mapping was suggested
}

// Get Hospital Source Systems
// GET /api/v1/configuration/sources?hospitalId={id}
interface GetHospitalSourcesResponse {
  success: boolean;
  data: HospitalSourceSystem[];
}

// Register Hospital Source System
// POST /api/v1/configuration/sources
interface RegisterSourceSystemRequest {
  hospitalId: string;
  name: string;
  type: HospitalSourceSystem['type'];
  availableFields: SourceField[];
}

// Finalize Module Configuration
// POST /api/v1/configuration/modules/{moduleId}/finalize
interface FinalizeConfigurationRequest {
  hospitalId: string;
  consultantNotes: string;
}
interface FinalizeConfigurationResponse {
  success: boolean;
  data: {
    configuration: ModuleConfiguration;
    validationWarnings: string[];                 // Warnings about limited capabilities
  };
}

// Generate Export Document
// POST /api/v1/configuration/export
interface GenerateExportRequest {
  hospitalId: string;
  modules: HospitalModule[];
  format: 'pdf' | 'csv' | 'xlsx';
  includeGapAnalysis: boolean;                    // Claude-generated gap analysis per module
  includeExecutiveSummary: boolean;               // Claude-generated executive summary
}
interface GenerateExportResponse {
  success: boolean;
  data: {
    downloadUrl: string;                          // Presigned S3 URL
    expiresAt: string;
    documentMetadata: {
      pageCount: number;
      fileSize: number;
      generatedAt: string;
    };
  };
}

// Get Standard Field Templates
// GET /api/v1/configuration/templates/{moduleId}
interface GetFieldTemplateResponse {
  success: boolean;
  data: {
    module: HospitalModule;
    standardFields: FieldDefinition[];
    capabilities: AnalyticalCapability[];
  };
}

// Get Coverage Metrics
// GET /api/v1/configuration/modules/{moduleId}/coverage?hospitalId={id}
interface GetCoverageMetricsResponse {
  success: boolean;
  data: CoverageMetrics;
}
```

## Implementation Requirements

### Core Components

1. **ModuleConfigurator.tsx** - Main container rendering hospital selector, module tab bar, field configuration, capability panel, and export controls. Server component fetches hospital list and configurations; delegates field editing to client children.

2. **HospitalSelector.tsx** - Dropdown showing hospitals assigned to the current implementation consultant. Shows configuration status badge (not started / in progress / finalized) for each hospital. Changing hospital reloads all module configurations.

3. **ModuleTabBar.tsx** - Horizontal tab bar for the five analytics modules. Each tab shows module name and coverage percentage badge. Active tab highlighted with teal bottom border. Badge color: red (< 50%), amber (50-79%), green (>= 80%).

4. **ModuleFieldConfiguration.tsx** - Client component managing the field table with tabs (Required/Optional/Custom/Mapping). Handles inline field editing, source assignment, and real-time coverage calculation. Sends updated mappings to server on change.

5. **FieldTable.tsx** - Sortable table displaying field definitions with columns: Field Name (monospace), Type, Source, Status, Actions. Supports search/filter by field name. Virtualized for modules with 50+ fields.

6. **FieldRow.tsx** - Individual field row with inline source selector. Status badge (green check = mapped, red X = missing, amber circle = default value). Click source cell opens `FieldSourceSelector` dropdown.

7. **FieldStatusBadge.tsx** - Color-coded status indicator: green "Mapped" for fully mapped fields, red "Missing" for unmapped required fields, amber "Default" for fields using default values.

8. **CoverageProgressBar.tsx** - Animated horizontal progress bar showing `mappedRequiredFields / totalRequiredFields`. Color transitions: red (< 50%) -> amber (50-79%) -> green (>= 80%). Percentage label animates on change.

9. **CapabilityImpactPanel.tsx** - Panel listing all analytical capabilities for the active module with current status. Each capability shows name, status badge (FULL/LIMITED/UNAVAILABLE), and field coverage ratio. Tooltip on LIMITED/UNAVAILABLE shows missing field names.

10. **CustomFieldEditor.tsx** - Interface for managing hospital-specific custom fields (30% bucket). Add, edit, delete custom fields. Validates field name uniqueness and enforces <= 30% custom field ratio.

11. **FieldMappingInterface.tsx** - Dedicated mapping view showing platform fields on the left and hospital source fields on the right. Dropdown-based mapping with optional transformation rule. "AI Suggest Mappings" button triggers Claude API suggestions.

12. **AISuggestMappingsButton.tsx** - Triggers Claude API to analyze unmapped platform fields against hospital source schema and suggest mappings with confidence scores. Results displayed as suggestion cards with one-click accept buttons.

13. **DataRequirementsExport.tsx** - Export controls: PDF button, CSV button, and Preview button. PDF generates a branded data requirements document with hospital logo, module details, coverage, capability impacts, and gap analysis.

14. **ExportPreviewModal.tsx** - Full-screen modal showing the data requirements document as it would appear in PDF. Sections for each module, capability impact summaries, and (if enabled) Claude-generated executive summary and gap analysis.

### Custom Hooks

1. **useModuleConfiguration(hospitalId, module)** - Fetches and manages module configuration state. Returns `{ configuration, updateFieldMapping, addCustomField, removeCustomField, isDirty, save, finalize, isLoading, error }`.

2. **useFieldMappings(configurationId)** - Manages field-to-source mapping state. Returns `{ mappings, mapField, unmapField, bulkMapFields, isUpdating }`. Triggers capability impact recalculation on every mapping change.

3. **useCapabilityImpact(hospitalId, module)** - Computes capability statuses based on current field mappings. Returns `{ capabilities, isLoading, recalculate }`. Client-side optimistic calculation with server verification.

4. **useCoverageMetrics(configuration)** - Computes real-time coverage metrics from current configuration state. Returns `{ metrics, isFullCoverage, coverageLevel }`. Pure client-side calculation (no API call).

5. **useCustomFields(hospitalId, module)** - CRUD operations for custom fields. Returns `{ customFields, addField, updateField, deleteField, isAdding, validationErrors }`. Enforces 30% custom field ratio.

6. **useAISuggestions(hospitalId, module, sourceSystemId)** - Fetches Claude AI mapping suggestions for unmapped fields. Returns `{ suggestions, isLoading, requestSuggestions, acceptSuggestion, dismissSuggestion }`.

7. **useExportDocument(hospitalId)** - Generates PDF/CSV/XLSX exports. Returns `{ generateExport, isGenerating, previewDocument, isPreviewOpen, openPreview, closePreview }`.

8. **useHospitalSelector(consultantId)** - Fetches hospitals assigned to consultant. Returns `{ hospitals, selectedHospital, selectHospital, isLoading }`.

### Utility Functions

1. **coverage-calculator.ts** - `calculateCoverage(config)`: Returns `CoverageMetrics` from current field mappings. `calculateOverallCoverage(modules)`: Weighted average across all configured modules. `getCoverageLevel(percentage)`: Returns `'full' | 'limited' | 'unavailable'`.

2. **capability-resolver.ts** - `resolveCapabilities(capabilities, mappedFieldIds)`: Determines status of each capability based on mapped field IDs. `getCapabilityLimitations(capability, missingFields)`: Returns human-readable limitation descriptions. `traceFieldToOutputs(fieldId, capabilities)`: Shows which outputs depend on a field (output-first traceability).

3. **configuration-utils.ts** - `validateCustomFieldName(name, existingFields)`, `enforceStandardCustomRatio(standardCount, customCount)`, `formatFieldType(type)`, `generateFieldId(moduleName, fieldName)`.

4. **export-formatter.ts** - `formatPDFDocument(document)`: Structures data for PDF rendering. `formatCSVExport(configuration)`: Generates CSV rows for field details. `generateExcelWorkbook(configurations)`: Multi-sheet Excel with one sheet per module.

## Acceptance Criteria

### Functional Requirements

1. **Module Selection**: Consultant can switch between five analytics modules; each module displays its standard field template with coverage status.
2. **Field Listing**: Each module displays required fields (with output-first traceability), optional fields, and custom fields; fields show name, type, source system, and mapping status.
3. **Field Mapping**: Consultant can map each platform field to a hospital source system field; mapping immediately updates coverage and capability status.
4. **Source System Registration**: Consultant can register hospital source systems (EHR, Payroll, Scheduling, etc.) with their available fields.
5. **AI Mapping Suggestions**: Claude API suggests source-to-platform field mappings based on field names and sample values; suggestions shown with confidence scores and one-click accept.
6. **Coverage Tracking**: Real-time coverage percentage displayed per module; progress bar color-coded by coverage level (red/amber/green).
7. **Capability Impact**: System shows which predictive analytics capabilities are fully supported, limited, or unavailable based on current field configuration; missing fields identified.
8. **Custom Fields**: Consultant can add hospital-specific custom fields up to 30% of total field count; custom fields validated for name uniqueness and type correctness.
9. **70/30 Ratio Enforcement**: System enforces >= 70% standard fields and <= 30% customizable fields; warning shown when approaching limit.
10. **Output-First Traceability**: Each required field shows which predictive model outputs and analytical capabilities depend on it.
11. **Finalization**: Consultant can finalize module configuration; finalized configurations are locked from further editing (unless explicitly unlocked by admin).
12. **PDF Export**: System generates a branded data requirements document in PDF format with hospital name, modules, field details, coverage, capability impacts, and optional AI gap analysis.
13. **CSV/Excel Export**: System exports field specifications in CSV or multi-sheet Excel format for technical handoff.
14. **Preview Mode**: Consultant can preview the data requirements document before export.

### Non-Functional Requirements

1. **Performance**: Module configuration loads in < 2 seconds; field mapping updates reflect in < 200ms; coverage/capability recalculation client-side in < 50ms; PDF generation in < 10 seconds.
2. **Reliability**: Configuration auto-saves every 30 seconds; unsaved changes warning on navigation; configuration versioning for rollback.
3. **Scalability**: Support up to 100 fields per module (70 standard + 30 custom); up to 10 source systems per hospital.
4. **Accessibility**: WCAG 2.1 AA compliant; field table keyboard-navigable; screen reader announces coverage changes; color-vision-safe status indicators.
5. **Security**: Configuration changes audited; hospital-scoped access; export documents watermarked.
6. **Usability**: Module configuration completable in < 4 hours per hospital by an implementation consultant; intuitive field-to-source mapping with minimal training.

## Modified Files

```
app/
├── (dashboard)/
│   └── configuration/
│       └── modules/
│           ├── page.tsx                              ⬜
│           ├── layout.tsx                            ⬜
│           ├── loading.tsx                           ⬜
│           ├── error.tsx                             ⬜
│           ├── [moduleId]/
│           │   ├── page.tsx                          ⬜
│           │   └── mapping/page.tsx                  ⬜
│           ├── export/page.tsx                       ⬜
│           └── components/
│               ├── ModuleConfigurator.tsx             ⬜
│               ├── HospitalSelector.tsx               ⬜
│               ├── ModuleTabBar.tsx                    ⬜
│               ├── ModuleTab.tsx                       ⬜
│               ├── ModuleFieldConfiguration.tsx        ⬜
│               ├── FieldCategoryTabs.tsx               ⬜
│               ├── FieldTable.tsx                      ⬜
│               ├── FieldRow.tsx                        ⬜
│               ├── FieldStatusBadge.tsx                ⬜
│               ├── FieldSourceSelector.tsx             ⬜
│               ├── CoverageProgressBar.tsx             ⬜
│               ├── CapabilityImpactPanel.tsx           ⬜
│               ├── CapabilityRow.tsx                   ⬜
│               ├── CapabilityTooltip.tsx               ⬜
│               ├── CustomFieldEditor.tsx               ⬜
│               ├── AddCustomFieldForm.tsx              ⬜
│               ├── FieldMappingInterface.tsx           ⬜
│               ├── MappingRow.tsx                      ⬜
│               ├── AISuggestMappingsButton.tsx         ⬜
│               ├── DataRequirementsExport.tsx          ⬜
│               ├── ExportPreviewModal.tsx              ⬜
│               ├── PDFDocumentTemplate.tsx             ⬜
│               └── hooks/
│                   ├── useModuleConfiguration.ts       ⬜
│                   ├── useFieldMappings.ts             ⬜
│                   ├── useCapabilityImpact.ts          ⬜
│                   ├── useCoverageMetrics.ts           ⬜
│                   ├── useCustomFields.ts              ⬜
│                   ├── useAISuggestions.ts             ⬜
│                   ├── useExportDocument.ts            ⬜
│                   └── useHospitalSelector.ts          ⬜
├── lib/
│   ├── api/
│   │   ├── module-config-api.ts                      ⬜
│   │   ├── field-mapping-api.ts                      ⬜
│   │   ├── capability-api.ts                         ⬜
│   │   └── export-api.ts                             ⬜
│   ├── templates/
│   │   ├── staffing-fields.ts                        ⬜
│   │   ├── bed-allocation-fields.ts                  ⬜
│   │   ├── supply-chain-fields.ts                    ⬜
│   │   ├── finance-fields.ts                         ⬜
│   │   └── anomaly-detection-fields.ts               ⬜
│   └── utils/
│       ├── configuration-utils.ts                    ⬜
│       ├── coverage-calculator.ts                    ⬜
│       ├── capability-resolver.ts                    ⬜
│       └── export-formatter.ts                       ⬜
├── types/
│   ├── module-config.types.ts                        ⬜
│   ├── field-definition.types.ts                     ⬜
│   ├── capability.types.ts                           ⬜
│   └── export.types.ts                               ⬜
└── services/
    └── configuration/
        ├── ModuleConfigurationService.ts             ⬜
        ├── FieldDefinitionRegistry.ts                ⬜
        ├── CapabilityResolver.ts                     ⬜
        ├── CoverageCalculator.ts                     ⬜
        ├── FieldMappingSuggester.ts                  ⬜
        └── DataRequirementsDocumentGenerator.ts      ⬜
```

## Implementation Status
**OVERALL STATUS**: ⬜ NOT STARTED

### Phase 1: Data Model & Standard Field Templates (Sprint 1-2)
- [ ] Define TypeScript interfaces for module configuration, field definitions, capabilities, coverage, and export types
- [ ] Create PostgreSQL migrations for `module_configurations`, `field_definitions`, `field_mappings`, `analytical_capabilities`, `hospital_source_systems` tables
- [ ] Build `FieldDefinitionRegistry.ts` with standard field templates for all five modules
- [ ] Create staffing-fields.ts template (25 standard fields: employee_id, department_id, role_type, shift_start, shift_end, hourly_rate, etc.)
- [ ] Create bed-allocation-fields.ts template (22 standard fields: bed_id, ward_id, patient_id, admission_date, discharge_date, bed_type, etc.)
- [ ] Create supply-chain-fields.ts template (20 standard fields: item_id, category, current_stock, reorder_level, supplier_id, unit_cost, etc.)
- [ ] Create finance-fields.ts template (28 standard fields: account_id, revenue_code, cost_center, amount, claim_id, payer_type, etc.)
- [ ] Create anomaly-detection-fields.ts template (18 standard fields: metric_name, metric_value, timestamp, department_id, threshold, etc.)
- [ ] Build `CapabilityResolver.ts` with output-first capability mapping (model output -> required fields)
- [ ] Implement `CoverageCalculator.ts` for real-time coverage metrics

### Phase 2: Configuration Backend & API (Sprint 3)
- [ ] Build `ModuleConfigurationService.ts` orchestrator for configuration CRUD
- [ ] Implement all REST API endpoints (GET/PUT configurations, POST/PUT/DELETE custom fields, POST/DELETE field mappings)
- [ ] Build source system registration endpoint and management
- [ ] Implement finalization logic with configuration locking and validation warnings
- [ ] Build configuration versioning (track changes, rollback capability)
- [ ] Implement auto-save endpoint (30-second interval, deduplication)
- [ ] Build `FieldMappingSuggester.ts` with Claude API integration for AI mapping suggestions
- [ ] Create Neo4j schema for field-to-capability-to-model relationship graph

### Phase 3: Frontend Configuration UI (Sprint 4-5)
- [ ] Build `ModuleConfigurator.tsx` main container with hospital selector and module tabs
- [ ] Implement `ModuleTabBar.tsx` with coverage badges and active state management
- [ ] Build `FieldTable.tsx` with sortable columns, search filter, and inline editing
- [ ] Implement `FieldRow.tsx` with inline source selector and status badges
- [ ] Build `CoverageProgressBar.tsx` with animated color transitions
- [ ] Implement `CapabilityImpactPanel.tsx` with real-time capability status recalculation
- [ ] Build `CustomFieldEditor.tsx` with add/edit/delete and 30% ratio enforcement
- [ ] Implement `FieldMappingInterface.tsx` with source-to-platform mapping UI
- [ ] Build `AISuggestMappingsButton.tsx` with suggestion cards and one-click accept
- [ ] Implement `DataRequirementsExport.tsx` with PDF/CSV/XLSX generation
- [ ] Build `ExportPreviewModal.tsx` with full-screen document preview
- [ ] Implement `PDFDocumentTemplate.tsx` with Kairos branded layout, hospital logo, module sections

### Phase 4: Polish, Testing & Deployment (Sprint 6)
- [ ] Write unit tests for `CapabilityResolver`, `CoverageCalculator`, `coverage-calculator`, `capability-resolver`
- [ ] Write integration tests for configuration CRUD, field mapping, capability impact recalculation
- [ ] Write E2E tests (Playwright) for module configuration workflow, field mapping, custom field CRUD, export generation
- [ ] Performance testing: validate < 2 second load, < 200ms field mapping update, < 10 second PDF generation
- [ ] Accessibility audit for field table, coverage bar, capability tooltips
- [ ] user acceptance testing with implementation consultants (>= 3 sessions configuring real hospital data)
- [ ] Validate 70/30 ratio enforcement edge cases
- [ ] Cross-browser testing for PDF export download (Chrome, Firefox, Safari, Edge)

## Dependencies

### Internal Dependencies
- **Predictive Model Registry**: Model output definitions that drive the output-first field requirements
- **Story 09** (Data Ingestion): Configured field schemas feed into ingestion pipeline validation rules
- **Story 08** (Data Quality): Field configuration determines quality measurement scope
- **Story 11** (Cross-Module Impact): Field-to-capability-to-module graph used for impact analysis
- **Authentication & RBAC**: `implementation_consultant`, `system_admin`, and `hospital_administrator` roles
- **Shared UI Components**: `DataTable`, `ProgressBar`, `Badge`, `Dropdown`, `Modal` from design system

### External Dependencies
- **Claude API** (Anthropic): AI-assisted field mapping suggestions and gap analysis narrative generation
- **React-PDF** or **Puppeteer**: Server-side PDF generation for data requirements documents
- **xlsx** (SheetJS): Excel workbook generation for multi-sheet field exports
- **Redis** (v7+): Configuration auto-save caching, AI suggestion caching

## Risk Assessment

### Technical Risks

1. **Standard Field Template Accuracy**
   - Impact: High
   - Likelihood: Medium
   - Mitigation: Templates developed with healthcare domain expert input; validated against 3+ real hospital datasets; versioned for iterative improvement
   - Contingency: Allow implementation consultants to flag template issues for rapid patching; maintain template versioning for rollback

2. **AI Mapping Suggestion Quality**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Provide Claude with source field sample values and data types for better matching; confidence thresholds (only show suggestions > 60%); human validation required for all AI suggestions
   - Contingency: AI suggestions offered as optional helper; manual mapping always primary path

3. **PDF Export Formatting Across Browsers**
   - Impact: Low
   - Likelihood: Medium
   - Mitigation: Server-side PDF generation (Puppeteer) for consistent output; pre-defined templates with fixed layouts
   - Contingency: Offer HTML download as alternative to PDF

4. **70/30 Ratio Rigidity**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Clear UX explanation of why ratio exists (data model consistency, cross-hospital benchmarking); soft warning before hard block
   - Contingency: Admin override capability to increase custom field ratio for specific hospitals (logged and audited)

### Business Risks

1. **Hospital Data System Variance**
   - Impact: High
   - Likelihood: High
   - Mitigation: Flexible source system registration; AI-assisted mapping; optional transformation rules; implementation consultant guided workflow
   - Contingency: Professional services engagement for highly non-standard hospital data systems

2. **Configuration Complexity Deters Consultants**
   - Impact: Medium
   - Likelihood: Medium
   - Mitigation: Template-first approach (start with defaults, map only what exists); guided wizard mode for first-time configuration; training materials
   - Contingency: "Quick Start" mode that auto-maps based on source field name similarity

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
describe('CapabilityResolver', () => {
  it('should return FULL status when all required fields are mapped', () => {});
  it('should return LIMITED when minimum fields are mapped but not all required', () => {});
  it('should return UNAVAILABLE when below minimum field threshold', () => {});
  it('should list specific missing fields for limited capabilities', () => {});
});

describe('CoverageCalculator', () => {
  it('should calculate required coverage as mapped/total required fields', () => {});
  it('should enforce 70/30 standard/custom ratio', () => {});
  it('should update in real-time as fields are mapped/unmapped', () => {});
  it('should calculate overall coverage across all modules', () => {});
});

describe('FieldDefinitionRegistry', () => {
  it('should load staffing module template with 25 standard fields', () => {});
  it('should trace each field to at least one capability (output-first)', () => {});
  it('should validate custom field name uniqueness', () => {});
});
```

### Integration Tests
```typescript
describe('Module Configuration Pipeline', () => {
  it('should configure staffing module from template selection to finalization', () => {});
  it('should recalculate capabilities when field mappings change', () => {});
  it('should generate PDF data requirements document with all module details', () => {});
  it('should auto-save configuration at 30-second intervals', () => {});
  it('should prevent editing finalized configurations', () => {});
});
```

### E2E Tests (Playwright)
```typescript
test.describe('Module Configurator', () => {
  test('should switch between modules and display correct field templates', async ({ page }) => {});
  test('should map field to source system and update coverage bar', async ({ page }) => {});
  test('should add custom field and enforce 30% limit', async ({ page }) => {});
  test('should show capability impact update when fields are mapped/unmapped', async ({ page }) => {});
  test('should generate AI mapping suggestions and accept with one click', async ({ page }) => {});
  test('should export PDF data requirements document', async ({ page }) => {});
  test('should preview export document in full-screen modal', async ({ page }) => {});
  test('should finalize configuration and lock from editing', async ({ page }) => {});
});
```

## Performance Considerations

### Configuration Loading
- Standard field templates cached in Redis; loaded on module selection in < 100ms
- Capability impact calculation client-side (avoids API round-trip on every field change)
- Coverage metrics computed client-side from field mapping state (real-time < 50ms)
- Lazy load field mapping tab only when selected (avoids loading source system data upfront)

### Auto-Save Optimization
- Debounced auto-save: batch 30 seconds of changes into single API call
- Diff-based updates: only send changed fields/mappings, not entire configuration
- Optimistic UI: show save confirmation immediately; retry on failure
- Redis cache: keep latest unsaved state in Redis for session recovery

### Export Generation
- PDF generation runs server-side via BullMQ job (offloaded from request thread)
- Pre-generated PDF template with hospital branding (logo, colors) cached
- Claude API gap analysis generated asynchronously; PDF includes placeholder until ready
- Excel generation uses streaming writer for large field sets (100+ fields)

## Deployment Plan

### Development Phase
- Feature flag: `FEATURE_MODULE_CONFIGURATOR` controls module visibility
- Seed standard field templates for all five modules with demo data
- Mock hospital source systems with 3 pre-configured demo hospitals
- Storybook stories for FieldRow, CoverageProgressBar, CapabilityRow, FieldStatusBadge

### Staging Phase
- End-to-end test: create hospital -> configure all 5 modules -> finalize -> export PDF
- Template validation: healthcare domain expert reviews field templates for completeness
- Performance benchmark: configure 100-field module and measure load/interaction times
- Security audit: hospital-scoped access control, configuration audit trail

### Production Phase
- Canary release to implementation consultant team (internal users only initially)
- Consultant feedback loop for 2 weeks before opening to hospital administrators
- Monitor configuration completion times (target: < 4 hours per hospital)
- Gradual rollout: internal consultants -> pilot hospitals -> general availability
- Rollback trigger: configuration save failure rate > 5%

## Monitoring & Analytics

### Performance Metrics
- Module configuration page load time (p50, p95)
- Field mapping action response time (< 200ms target)
- Coverage recalculation time (client-side, < 50ms target)
- PDF export generation time (< 10 seconds target)
- AI suggestion response time (Claude API latency)

### Business Metrics
- Average configuration time per hospital per module
- Coverage percentage distribution across hospitals
- Most common unmapped fields (product improvement signal)
- Custom field creation patterns (identify commonly needed custom fields for template promotion)
- AI suggestion acceptance rate (measures AI mapping quality)
- PDF export frequency (measures pre-sales usage)
- Configuration finalization rate (started vs. completed configurations)

### Technical Metrics
- Auto-save success/failure rate
- Redis cache hit rate for field templates
- Claude API token usage for mapping suggestions and gap analysis
- PostgreSQL configuration table row count and query performance

### Alerting Rules
- Auto-save failure rate > 5% -> Critical alert (data loss risk)
- PDF export generation timeout > 30 seconds -> Warning alert
- Claude API error rate > 10% for suggestions -> Warning alert
- Configuration template load failure -> Critical alert

## Documentation Requirements

### Technical Documentation
- Standard field template specifications for all five modules (field names, types, constraints, capability mappings)
- Output-first design methodology guide (how model outputs drive field requirements)
- Capability-to-field dependency matrix documentation
- AI mapping suggestion prompt engineering guide
- PDF template customization guide (branding, layout, sections)

### User Documentation
- Implementation Consultant Guide: step-by-step module configuration workflow
- Field Mapping Guide: how to register source systems and map fields
- Custom Field Guide: adding, editing, and managing hospital-specific fields
- Data Requirements Document Guide: generating and interpreting export documents
- Pre-Sales Guide: using the configurator to scope data requirements during sales conversations

## Post-Launch Review

### Success Criteria
- Module configuration completed in < 4 hours per hospital by implementation consultants
- 100% of required fields traced to specific predictive model outputs (output-first compliance)
- 70/30 standard/custom ratio maintained across all hospital configurations
- PDF data requirements documents used in >= 80% of pre-sales conversations
- AI mapping suggestion acceptance rate >= 50%
- Zero configuration data loss incidents (auto-save reliability)
- >= 80% of consultants rate configurator as "efficient" or "very efficient" in usability survey

### Retrospective Items
- Evaluate standard field templates against real hospital data: identify fields that should be promoted from optional to required (or vice versa)
- Review custom field patterns across hospitals: determine if commonly created custom fields should become standard fields
- Assess AI mapping suggestion quality: analyze confidence scores vs. acceptance rates to tune prompt
- Gather consultant feedback on configuration workflow efficiency and pain points
- Evaluate whether 70/30 ratio is appropriate or needs adjustment based on hospital implementation experience
- Review PDF export feedback from sales team: content, formatting, and completeness
- Consider wizard-mode UX for first-time configuration vs. current tabbed interface
