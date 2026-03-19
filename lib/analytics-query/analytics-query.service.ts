import type {
  NLQueryResponse,
  VisualizationSpec,
  DataSourceCitation,
  ConfidenceScore,
  Conversation,
  ConversationTurn,
  SavedQuery,
  QueryFeedback,
  FeedbackRating,
  GuardrailFlag,
} from './analytics-query.types';
import { subDays, subHours, format } from 'date-fns';

const now = new Date();

// --- Pre-built Mock Responses ---

const MOCK_RESPONSES: Record<string, NLQueryResponse> = {
  revenue: {
    id: 'RESP-001',
    queryId: 'Q-001',
    answerText: `Your hospital's Q3 revenue decreased by **12% ($2.4M → $2.1M)** compared to Q2. The primary drivers are:\n\n1. **Elective surgery volume down 18%** due to OR scheduling bottleneck in Ward C — two senior surgeons were on concurrent conference leave with no backfill mechanism\n2. **Insurance claim rejection rate increased from 4% to 9%** — analysis shows 62% of rejections are due to documentation insufficiency (missing pre-authorization or incorrect procedure codes)\n3. **Outpatient visits remained stable (+2%)**, indicating the revenue decline is concentrated in inpatient surgical services\n\nThe claim rejection issue alone accounts for approximately **$380K in unrealized revenue** across 47 denied claims. Addressing the documentation root cause could recover a significant portion of this amount.\n\nThe OR scheduling gap represents approximately **$240K in lost potential revenue** over the two-week absence period, and similar concurrent absences occur 2-3 times per year.`,
    confidence: {
      overall: 92,
      dataCompleteness: 95,
      queryInterpretation: 94,
      answerGrounding: 88,
      level: 'high',
      explanation: 'High confidence based on complete financial data across Q2-Q3 with 95% data quality score.',
    },
    visualizations: [
      {
        id: 'VIZ-001',
        type: 'line_chart',
        title: 'Quarterly Revenue Trend',
        data: [
          { label: 'Q1 2024', value: 2500000 },
          { label: 'Q2 2024', value: 2400000 },
          { label: 'Q3 2024', value: 2100000 },
        ],
        config: {
          xAxisLabel: 'Quarter',
          yAxisLabel: 'Revenue',
          xAxisType: 'category',
          currency: true,
          percentage: false,
          showTrendLine: true,
          showDataLabels: true,
          colors: ['#0058be'],
        },
      },
      {
        id: 'VIZ-002',
        type: 'data_table',
        title: 'Revenue Breakdown by Category',
        data: {
          headers: ['Category', 'Q2 Revenue', 'Q3 Revenue', 'Change'],
          rows: [
            ['Surgery (Inpatient)', '$1,200,000', '$984,000', '-18%'],
            ['Outpatient Services', '$800,000', '$816,000', '+2%'],
            ['Insurance Claims', '$400,000', '$300,000', '-25%'],
          ],
          highlightRows: [0, 2],
        },
        config: {
          xAxisLabel: '',
          yAxisLabel: '',
          xAxisType: 'category',
          currency: true,
          percentage: false,
          showTrendLine: false,
          showDataLabels: false,
          colors: [],
        },
      },
    ],
    dataSources: [
      { module: 'finance', tableName: 'revenue_metrics', timeframeUsed: 'Q1-Q3 2024', recordCount: 4820, dataQualityScore: 95, description: 'Finance Module — Revenue data Q1-Q3 2024' },
      { module: 'staffing', tableName: 'or_schedules', timeframeUsed: 'Q3 2024', recordCount: 1240, dataQualityScore: 92, description: 'Staffing Module — OR scheduling data Q3 2024' },
      { module: 'finance', tableName: 'claims_data', timeframeUsed: 'Last 60 days', recordCount: 589, dataQualityScore: 88, description: 'Finance Module — Insurance claims data' },
    ],
    followUpSuggestions: [
      'What caused the claim rejection increase?',
      'Show OR scheduling details for Ward C',
      'Compare this quarter to same period last year',
    ],
    processingTimeMs: 3200,
    guardrailFlags: [],
  },
  occupancy: {
    id: 'RESP-002',
    queryId: 'Q-002',
    answerText: `Current hospital-wide bed occupancy is **83.4%** across 420 total beds (350 occupied). Here's the breakdown by department:\n\n- **ICU**: 92% occupancy (23/25 beds) — approaching capacity threshold\n- **Medical/Surgical**: 85% (170/200 beds) — within normal range\n- **Pediatrics**: 68% (34/50 beds) — below target, seasonal pattern\n- **Maternity**: 78% (39/50 beds) — stable\n- **Emergency Overflow**: 88% (44/50 beds) — elevated due to flu surge\n- **Rehabilitation**: 89% (40/45 beds) — consistent occupancy\n\nThe **ICU is the primary concern** at 92% — predictive models forecast it may reach 96% occupancy within 3 days if current admission trends continue. Ward A (Medical) has surplus capacity at 62% that could absorb overflow through temporary bed reallocation.\n\nAverage length of stay is **4.2 days**, up from 3.8 days last month, contributing to higher occupancy. Discharge bottlenecks during midday hours (11 AM - 2 PM) are the primary driver.`,
    confidence: {
      overall: 96,
      dataCompleteness: 98,
      queryInterpretation: 97,
      answerGrounding: 94,
      level: 'high',
      explanation: 'Very high confidence — real-time bed census data with 98% completeness.',
    },
    visualizations: [
      {
        id: 'VIZ-003',
        type: 'bar_chart',
        title: 'Bed Occupancy by Department',
        data: [
          { label: 'ICU', value: 92, category: 'Critical' },
          { label: 'Rehab', value: 89, category: 'High' },
          { label: 'ER Overflow', value: 88, category: 'High' },
          { label: 'Med/Surg', value: 85, category: 'Normal' },
          { label: 'Maternity', value: 78, category: 'Normal' },
          { label: 'Pediatrics', value: 68, category: 'Low' },
        ],
        config: {
          xAxisLabel: 'Department',
          yAxisLabel: 'Occupancy Rate (%)',
          xAxisType: 'category',
          currency: false,
          percentage: true,
          showTrendLine: false,
          showDataLabels: true,
          colors: ['#ba1a1a', '#f59e0b', '#f59e0b', '#0058be', '#0058be', '#009668'],
        },
      },
    ],
    dataSources: [
      { module: 'bed_allocation', tableName: 'bed_census', timeframeUsed: 'Real-time', recordCount: 420, dataQualityScore: 98, description: 'Bed Allocation Module — Real-time bed census' },
      { module: 'bed_allocation', tableName: 'admission_forecast', timeframeUsed: 'Next 7 days', recordCount: 840, dataQualityScore: 91, description: 'Bed Allocation Module — Admission forecast model' },
    ],
    followUpSuggestions: [
      'What is driving the ICU capacity increase?',
      'Show discharge bottleneck analysis',
      'When did average length of stay start increasing?',
    ],
    processingTimeMs: 2100,
    guardrailFlags: [],
  },
  staffing: {
    id: 'RESP-003',
    queryId: 'Q-003',
    answerText: `Based on current staffing data, **3 departments are overstaffed** relative to their patient census this week:\n\n1. **Pediatrics** — 12 nurses scheduled vs. 8 needed (34 patients at 1:4 ratio)\n   - Overstaffed by **4 FTEs** → potential reallocation to ER\n   - Cost impact: ~$6,400/week in excess staffing cost\n\n2. **Rehabilitation** — 10 nurses scheduled vs. 8 needed (40 patients at 1:5 ratio)\n   - Overstaffed by **2 FTEs** → could cover ICU shortage\n   - Cost impact: ~$3,200/week\n\n3. **Outpatient Clinic** — 6 nurses scheduled vs. 4 needed (low appointment volume)\n   - Overstaffed by **2 FTEs** → temporary reassignment recommended\n   - Cost impact: ~$3,200/week\n\n**Total potential weekly savings from reallocation: $12,800**\n\nNote: ER and ICU are currently **understaffed** — ER has a nurse-to-patient ratio of 1:7 (above the 1:5 target) and ICU needs 3 additional nurses for safe staffing levels.`,
    confidence: {
      overall: 85,
      dataCompleteness: 88,
      queryInterpretation: 90,
      answerGrounding: 82,
      level: 'high',
      explanation: 'High confidence based on current shift schedules and patient census data.',
    },
    visualizations: [
      {
        id: 'VIZ-004',
        type: 'bar_chart',
        title: 'Staffing Levels vs. Need by Department',
        data: [
          { label: 'Pediatrics', value: 12, category: 'Scheduled' },
          { label: 'Pediatrics', value: 8, category: 'Needed' },
          { label: 'Rehab', value: 10, category: 'Scheduled' },
          { label: 'Rehab', value: 8, category: 'Needed' },
          { label: 'Outpatient', value: 6, category: 'Scheduled' },
          { label: 'Outpatient', value: 4, category: 'Needed' },
        ],
        config: {
          xAxisLabel: 'Department',
          yAxisLabel: 'Nurse Count',
          xAxisType: 'category',
          currency: false,
          percentage: false,
          showTrendLine: false,
          showDataLabels: true,
          colors: ['#0058be', '#009668'],
        },
      },
    ],
    dataSources: [
      { module: 'staffing', tableName: 'shift_assignments', timeframeUsed: 'Current week', recordCount: 340, dataQualityScore: 92, description: 'Staffing Module — Current shift assignments' },
      { module: 'bed_allocation', tableName: 'patient_census', timeframeUsed: 'Today', recordCount: 350, dataQualityScore: 96, description: 'Bed Allocation Module — Current patient census' },
    ],
    followUpSuggestions: [
      'Show overtime trends by department for the past 90 days',
      'What is the nurse-to-patient ratio in the ER right now?',
      'How much overtime are we paying this month?',
    ],
    processingTimeMs: 2800,
    guardrailFlags: [],
  },
  overtime: {
    id: 'RESP-004',
    queryId: 'Q-004',
    answerText: `Here are the overtime trends by department over the past 90 days:\n\n**Top Overtime Departments:**\n1. **Emergency Department** — Average 284 hrs/week (+40% above baseline)\n   - Trending upward since week 6, correlates with flu surge\n2. **ICU** — Average 156 hrs/week (+22% above baseline)\n   - Spike in weeks 8-10 due to staffing vacancies\n3. **Surgery** — Average 98 hrs/week (stable, within normal range)\n\n**Total overtime cost (90 days): $487,000**\n- ER accounts for 52% ($253K)\n- ICU accounts for 28% ($136K)\n- All other departments: 20% ($98K)\n\nThe ER overtime trend shows no signs of declining, suggesting structural understaffing rather than temporary demand spike. An additional 3 FTE weekend RNs could reduce ER overtime by an estimated 44%.`,
    confidence: {
      overall: 88,
      dataCompleteness: 90,
      queryInterpretation: 92,
      answerGrounding: 84,
      level: 'high',
      explanation: 'Strong confidence from 90 days of complete overtime records.',
    },
    visualizations: [
      {
        id: 'VIZ-005',
        type: 'line_chart',
        title: 'Weekly Overtime Hours by Department (90 Days)',
        data: [
          { label: 'Week 1', value: 210, category: 'ER' },
          { label: 'Week 2', value: 225, category: 'ER' },
          { label: 'Week 3', value: 218, category: 'ER' },
          { label: 'Week 4', value: 240, category: 'ER' },
          { label: 'Week 5', value: 235, category: 'ER' },
          { label: 'Week 6', value: 260, category: 'ER' },
          { label: 'Week 7', value: 270, category: 'ER' },
          { label: 'Week 8', value: 285, category: 'ER' },
          { label: 'Week 9', value: 290, category: 'ER' },
          { label: 'Week 10', value: 300, category: 'ER' },
          { label: 'Week 11', value: 295, category: 'ER' },
          { label: 'Week 12', value: 284, category: 'ER' },
        ],
        config: {
          xAxisLabel: 'Week',
          yAxisLabel: 'Overtime Hours',
          xAxisType: 'category',
          currency: false,
          percentage: false,
          showTrendLine: true,
          showDataLabels: false,
          colors: ['#ba1a1a', '#0058be', '#009668'],
        },
      },
    ],
    dataSources: [
      { module: 'staffing', tableName: 'overtime_records', timeframeUsed: 'Last 90 days', recordCount: 8720, dataQualityScore: 90, description: 'Staffing Module — Overtime records (90 days)' },
      { module: 'finance', tableName: 'labor_costs', timeframeUsed: 'Last 90 days', recordCount: 1240, dataQualityScore: 93, description: 'Finance Module — Labor cost breakdowns' },
    ],
    followUpSuggestions: [
      'What would it cost to hire 3 additional ER weekend nurses?',
      'Show me the correlation between ER patient volume and overtime',
      'Which shifts have the highest overtime hours?',
    ],
    processingTimeMs: 3500,
    guardrailFlags: [],
  },
  supply: {
    id: 'RESP-005',
    queryId: 'Q-005',
    answerText: `Supply chain costs this month are **$420,000 — 18% above** the 6-month average of $355,000. The primary unusual patterns are:\n\n1. **Surgical kits**: Consumption up 150% due to new orthopedic program (launched 3 weeks ago). Reorder frequency changed from bi-weekly to every 4 days. Additional cost: **$45,000/month**\n\n2. **N95 respirators**: Emergency order at 15% premium from secondary supplier due to primary supplier shipment delay. Additional cost: **$4,200**\n\n3. **Medical waste disposal**: Up 28% ($34,200 vs. $26,700 average) correlating with new infectious disease protocols and higher surgical volume. Additional cost: **$7,500/month**\n\nThe surgical kit increase is expected to be permanent given the new program. I recommend renegotiating the vendor contract for volume discounts — at current consumption levels, the hospital qualifies for tier 2 pricing (est. 12-15% discount, saving ~$180K annually).`,
    confidence: {
      overall: 86,
      dataCompleteness: 92,
      queryInterpretation: 88,
      answerGrounding: 80,
      level: 'high',
      explanation: 'Good confidence from complete supply chain data with 92% quality score.',
    },
    visualizations: [
      {
        id: 'VIZ-006',
        type: 'bar_chart',
        title: 'Supply Cost Breakdown — This Month vs. Average',
        data: [
          { label: 'Surgical Kits', value: 145000, category: 'This Month' },
          { label: 'Surgical Kits', value: 85000, category: '6-Mo Avg' },
          { label: 'Pharmaceuticals', value: 120000, category: 'This Month' },
          { label: 'Pharmaceuticals', value: 118000, category: '6-Mo Avg' },
          { label: 'PPE', value: 62000, category: 'This Month' },
          { label: 'PPE', value: 58000, category: '6-Mo Avg' },
          { label: 'Waste Disposal', value: 34200, category: 'This Month' },
          { label: 'Waste Disposal', value: 26700, category: '6-Mo Avg' },
        ],
        config: {
          xAxisLabel: 'Category',
          yAxisLabel: 'Cost',
          xAxisType: 'category',
          currency: true,
          percentage: false,
          showTrendLine: false,
          showDataLabels: true,
          colors: ['#ba1a1a', '#c6c6cd'],
        },
      },
    ],
    dataSources: [
      { module: 'supply_chain', tableName: 'procurement_costs', timeframeUsed: 'Last 6 months', recordCount: 3200, dataQualityScore: 92, description: 'Supply Chain Module — Procurement costs (6 months)' },
      { module: 'supply_chain', tableName: 'inventory_transactions', timeframeUsed: 'Current month', recordCount: 890, dataQualityScore: 94, description: 'Supply Chain Module — Current inventory transactions' },
    ],
    followUpSuggestions: [
      'What are the details of the surgical kit cost increase?',
      'When does our current vendor contract expire?',
      'Show the N95 inventory level trend',
    ],
    processingTimeMs: 2900,
    guardrailFlags: [],
  },
};

// Guardrail response for clinical questions
const CLINICAL_GUARDRAIL_RESPONSE: NLQueryResponse = {
  id: 'RESP-GUARD',
  queryId: 'Q-GUARD',
  answerText: 'I can help you analyze operational, financial, and staffing data for your hospital. However, I cannot provide clinical diagnoses, treatment recommendations, or direct medical advice. For clinical questions, please consult with your medical staff or clinical decision support systems.\n\nHere are some questions I can help with:',
  confidence: {
    overall: 100,
    dataCompleteness: 100,
    queryInterpretation: 100,
    answerGrounding: 100,
    level: 'high',
    explanation: 'System guardrail response — no data query required.',
  },
  visualizations: [],
  dataSources: [],
  followUpSuggestions: [
    'What is our current bed occupancy rate?',
    'Show me overtime trends by department',
    'Why is our revenue lower this quarter?',
  ],
  processingTimeMs: 200,
  guardrailFlags: [
    { type: 'clinical_advice_blocked', message: 'This question appears to request clinical or medical advice, which is outside the scope of this analytics tool.', severity: 'warning' },
  ],
};

// Map keywords to response keys
function matchQuery(questionText: string): string {
  const q = questionText.toLowerCase();
  if (q.includes('revenue') || q.includes('financial') || q.includes('money') || q.includes('earnings')) return 'revenue';
  if (q.includes('bed') || q.includes('occupancy') || q.includes('census') || q.includes('capacity')) return 'occupancy';
  if (q.includes('staff') || q.includes('nurse') || q.includes('overstaff') || q.includes('understaff')) return 'staffing';
  if (q.includes('overtime') || q.includes('labor cost') || q.includes('shifts')) return 'overtime';
  if (q.includes('supply') || q.includes('inventory') || q.includes('procurement') || q.includes('ppe') || q.includes('surgical kit')) return 'supply';
  if (q.includes('diagnos') || q.includes('treatment') || q.includes('prescri') || q.includes('medication') || q.includes('symptom')) return 'clinical_guardrail';
  return 'revenue'; // default fallback
}

// --- Service Functions ---

/** Submit a query and get a simulated streaming response */
export async function submitNLQuery(
  questionText: string,
  _conversationId?: string,
  onStreamChunk?: (chunk: string) => void,
  onComplete?: (response: NLQueryResponse) => void,
): Promise<NLQueryResponse> {
  const matchKey = matchQuery(questionText);

  if (matchKey === 'clinical_guardrail') {
    // Simulate small delay for guardrail
    await new Promise((r) => setTimeout(r, 300));
    if (onStreamChunk) {
      const text = CLINICAL_GUARDRAIL_RESPONSE.answerText;
      for (let i = 0; i < text.length; i += 3) {
        await new Promise((r) => setTimeout(r, STREAM_INTERVAL));
        onStreamChunk(text.slice(i, i + 3));
      }
    }
    onComplete?.(CLINICAL_GUARDRAIL_RESPONSE);
    return CLINICAL_GUARDRAIL_RESPONSE;
  }

  const response = MOCK_RESPONSES[matchKey];
  if (!response) {
    throw new Error('Unable to process query');
  }

  // Simulate streaming with character-by-character output
  if (onStreamChunk) {
    const text = response.answerText;
    for (let i = 0; i < text.length; i += 4) {
      await new Promise((r) => setTimeout(r, STREAM_INTERVAL));
      onStreamChunk(text.slice(i, i + 4));
    }
  }

  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 200));
  onComplete?.(response);
  return response;
}

const STREAM_INTERVAL = 15;

/** Get suggested questions */
export async function fetchSuggestedQuestions(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [
    'Why is our revenue lower this quarter?',
    'What is our current bed occupancy rate?',
    'Which departments are overstaffed this week?',
    'Show me overtime trends by department for the past 90 days',
    'What is unusual about our supply chain costs this month?',
    'Compare staffing levels Q2 vs Q3',
  ];
}

// Mock conversation history
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'CONV-001',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    title: 'Revenue analysis Q3',
    turns: [
      {
        queryId: 'Q-001',
        questionText: 'Why is our revenue lower this quarter?',
        response: MOCK_RESPONSES.revenue,
        feedback: { rating: 'helpful', comment: null, submittedAt: subHours(now, 2).toISOString() },
        timestamp: subHours(now, 3).toISOString(),
      },
    ],
    createdAt: subHours(now, 3).toISOString(),
    lastActivityAt: subHours(now, 2).toISOString(),
    isSaved: false,
  },
  {
    id: 'CONV-002',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    title: 'Bed occupancy check',
    turns: [
      {
        queryId: 'Q-002',
        questionText: 'What is our current bed occupancy rate?',
        response: MOCK_RESPONSES.occupancy,
        feedback: null,
        timestamp: subHours(now, 6).toISOString(),
      },
    ],
    createdAt: subHours(now, 6).toISOString(),
    lastActivityAt: subHours(now, 6).toISOString(),
    isSaved: true,
  },
  {
    id: 'CONV-003',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    title: 'Overtime investigation',
    turns: [
      {
        queryId: 'Q-004',
        questionText: 'Show me overtime trends by department for the past 90 days',
        response: MOCK_RESPONSES.overtime,
        feedback: { rating: 'helpful', comment: 'Very useful breakdown!', submittedAt: subDays(now, 1).toISOString() },
        timestamp: subDays(now, 1).toISOString(),
      },
    ],
    createdAt: subDays(now, 1).toISOString(),
    lastActivityAt: subDays(now, 1).toISOString(),
    isSaved: false,
  },
  {
    id: 'CONV-004',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    title: 'Supply chain cost review',
    turns: [
      {
        queryId: 'Q-005',
        questionText: 'What is unusual about our supply chain costs this month?',
        response: MOCK_RESPONSES.supply,
        feedback: null,
        timestamp: subDays(now, 3).toISOString(),
      },
    ],
    createdAt: subDays(now, 3).toISOString(),
    lastActivityAt: subDays(now, 3).toISOString(),
    isSaved: false,
  },
];

const MOCK_SAVED_QUERIES: SavedQuery[] = [
  {
    id: 'SQ-001',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    questionText: 'What is our current bed occupancy rate?',
    label: 'Daily Occupancy Check',
    tags: ['beds', 'daily'],
    lastRunAt: subHours(now, 6).toISOString(),
    runCount: 14,
  },
  {
    id: 'SQ-002',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    questionText: 'Show me overtime trends by department for the past 90 days',
    label: 'Weekly Overtime Review',
    tags: ['staffing', 'overtime', 'weekly'],
    lastRunAt: subDays(now, 1).toISOString(),
    runCount: 8,
  },
  {
    id: 'SQ-003',
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    questionText: 'Why is our revenue lower this quarter?',
    label: 'Quarterly Revenue Analysis',
    tags: ['finance', 'quarterly'],
    lastRunAt: subDays(now, 5).toISOString(),
    runCount: 3,
  },
];

/** Fetch conversation history */
export async function fetchQueryHistory(
  search?: string,
): Promise<{ conversations: Conversation[]; total: number }> {
  await new Promise((r) => setTimeout(r, 400));
  let result = [...MOCK_CONVERSATIONS];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.turns.some((t) => t.questionText.toLowerCase().includes(q)),
    );
  }
  return { conversations: result, total: result.length };
}

/** Fetch saved queries */
export async function fetchSavedQueries(): Promise<SavedQuery[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [...MOCK_SAVED_QUERIES];
}

/** Save a query */
export async function saveQuery(
  questionText: string,
  label: string,
  tags: string[],
): Promise<SavedQuery> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    id: `SQ-${Date.now()}`,
    hospitalId: 'HOSP-001',
    userId: 'USR-001',
    questionText,
    label,
    tags,
    lastRunAt: new Date().toISOString(),
    runCount: 1,
  };
}

/** Delete a saved query */
export async function deleteSavedQuery(_queryId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
}

/** Submit feedback */
export async function submitFeedback(
  _queryId: string,
  rating: FeedbackRating,
  comment?: string,
): Promise<{ feedbackId: string }> {
  await new Promise((r) => setTimeout(r, 200));
  return { feedbackId: `FB-${Date.now()}` };
}
