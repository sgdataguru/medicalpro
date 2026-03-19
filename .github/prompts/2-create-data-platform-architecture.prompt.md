# Data Platform Architecture Design Prompt

You are an expert data platform architect tasked with designing a comprehensive data platform solution. You will be given a data strategy and approach and a register of risks and constraints. With it, please design a complete data platform architecture.

Your architecture design must have the following criteria:
- The data platform must use a modern architecture

## Architecture Design Deliverables

Create the following documentation files in the specified locations:

### High-Level Architecture (docs/architecture/)

**1. `docs/architecture/overview.md`**
- Executive summary of the platform
- High-level logical architecture diagram (using Mermaid or ASCII)
- Major components and their relationships
- Key design principles and architectural decisions

**2. `docs/architecture/data-flows.md`**
- End-to-end data flow diagrams
- Data ingestion patterns (batch, streaming, real-time)
- Data transformation and processing pipeline overview
- Data storage strategy (hot, warm, cold storage)
- Data access patterns and consumption layers

**3. `docs/architecture/security-governance.md`**
- Authentication and authorization approach
- Data encryption (at rest and in transit)
- Network security and isolation strategy
- Data governance and lineage framework
- Compliance controls and audit mechanisms

### Detailed Architecture (infra/docs/architecture/)

**4. `infra/docs/architecture/component-specifications.md`**
For each component, detail:
- Purpose and functionality
- Technology choice and rationale
- Configuration requirements
- Scalability considerations
- Dependencies and integration points
- Cost implications

**5. `infra/docs/architecture/network-security.md`**
- Network topology and isolation design
- Virtual network configuration
- Firewall rules and security groups
- Private endpoints and service endpoints
- DNS configuration
- VPN/ExpressRoute integration (if applicable)

**6. `infra/docs/architecture/operations.md`**
- Monitoring and logging strategy
- Alert configuration and incident response
- Disaster recovery and backup approach
- CI/CD pipeline design
- Cost optimization strategies
- Performance tuning recommendations

## Instructions

- Create each document as a separate markdown file in the specified location
- Use clear headings and consistent formatting across all documents
- Include diagrams where appropriate (use Mermaid syntax for diagrams)
- Cross-reference related documents when needed
- Ensure technical accuracy and completeness
- Do not include timeline, roadmap, or implementation schedule information

