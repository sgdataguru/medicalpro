# User Story: 11 - View Relationship Graph Across Entities

**As a** Relationship Manager,
**I want** to view a visual relationship graph connecting individuals, companies, sectors, and liquidity events,
**so that** I can understand the network of connections and identify indirect opportunities or impacts from a single event.

## Acceptance Criteria

*   The graph visualization maps relationships between individuals, companies, sectors, and liquidity events.
*   Clicking on a node (person, company, or event) highlights connected entities.
*   Every trigger or data change can be traced to understand its impact across companies and individuals.
*   The graph is interactive — users can zoom, pan, and explore connections.
*   The visualization clearly shows how a liquidity event at one company may affect related individuals or entities.

## Notes

*   A graph database is proposed as the underlying data store to naturally model these relationships.
*   The graph database allows mapping relationships and tracing the impact of any trigger or data change across companies and individuals.
*   This was described as a core differentiator: "graph-based insights translate into real, practical actions for Relationship Managers."
