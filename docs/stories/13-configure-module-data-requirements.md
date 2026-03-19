# User Story: 13 - Configure Module-Specific Data Requirements

**As a** Medical Pro implementation consultant,
**I want** to define and configure the specific data fields required for each analytics module before data collection begins,
**so that** the hospital captures exactly the data needed for predictive analytics from day one, avoiding costly rework.

## Acceptance Criteria

*   Each of the five modules (staffing, bed allocation, supply chain, finance, anomaly detection) has a defined set of required and optional data fields.
*   The system provides a configuration interface to map hospital-specific data sources to the required fields.
*   When a hospital can only provide a subset of required fields (e.g., 7 out of 10), the system indicates which analytics capabilities will be limited.
*   Data field requirements are derived from the predictive model needs (output-first design).
*   The configuration produces a data requirements document that can be shared with the hospital client.

## Notes

*   This embodies Hershey's core philosophy: "Starting from the last — what is the output that I want to achieve? — and then going backward to define what data we need."
*   She contrasted this with the typical approach where analysts collect data first and later discover it's insufficient for predictive models: "Later on, what we capture doesn't serve the output that we want to achieve."
*   Mahesh referenced the Kimball approach (output-first) as aligned with this strategy, versus the Inmon approach (data-first).
*   The hybrid SaaS model is 70% standardized fields and 30% customizable to accommodate hospital-specific data availability.
*   This feature is critical for the pre-sales process: defining data needs upfront "smooths implementation post-sale."
