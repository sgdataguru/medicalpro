# User Story: 10 - Query Hospital Data Using Natural Language

**As a** hospital administrator,
**I want** to ask questions about my hospital's data in natural language and receive actionable answers,
**so that** I can get insights quickly without needing technical expertise or waiting for analyst reports.

## Acceptance Criteria

*   The administrator can type or speak a question in natural language (e.g., "Why is my revenue lower this quarter?").
*   The system interprets the question, queries the relevant data, and returns a clear, understandable answer.
*   Answers include supporting data visualizations where appropriate (charts, tables, trend lines).
*   The system cites the data sources and timeframes used to generate its response.
*   Healthcare-specific guardrails and protocols prevent misinterpretation or hallucinated responses.

## Notes

*   The platform uses Claude 4.6 for raw data processing, standardization, and generating actionable output.
*   Hershey noted the LLM layer includes "protocols because healthcare has a lot of guardrails."
*   While AI automates ~70% of data analyst work, human verification remains necessary — the system should indicate confidence levels in its responses.
*   The natural language interface lowers the barrier for hospital directors who are not data-literate but need actionable insights.
