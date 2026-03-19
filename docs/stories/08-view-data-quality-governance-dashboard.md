# User Story: 8 - View Data Quality and Governance Dashboard

**As a** hospital data administrator,
**I want** to view a dashboard showing data quality metrics and governance status across all data pipeline layers,
**so that** I can trust the analytics output and quickly identify where data issues originate.

## Acceptance Criteria

*   The dashboard displays data quality scores at each pipeline stage: raw data ingestion, processing, actionable output, and simulation.
*   Issues are traceable to their origin layer (raw, processing, action, or simulation).
*   Data quality benchmarks are configurable, and the system flags when quality falls below thresholds.
*   The dashboard shows trends in data quality over time.
*   Governance audit logs record what data was processed, when, and what quality checks were applied.

## Notes

*   Mahesh stressed that "governance goes across the board" — it is not just regulation but continuous data quality monitoring.
*   He emphasized that fixing data issues early (at ingestion) is far cheaper than fixing them at the simulation or output stage.
*   The governance framework must answer: "Was the error in the raw layer? The processing layer? The action level layer? The simulation?"
*   The AI layer (Cloud 4.6) automates ~70% of data analyst work, but human verification and validation remain essential to prevent hallucination.
