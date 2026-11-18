/* ==========================================================================
   Plumbline · demo-data.js
   Content for the "How it works" console. Topics 1-3 answer from public CMS
   and state data; topic 4 is the Bid Platform on the plan's own data.
   All figures are ILLUSTRATIVE and plans are anonymized ("Competitor A").
   ========================================================================== */
(function () {
  var CHAPTERS = [
    {
      num: '01', worldName: 'Market · public data', color: '#3B3FE0',
      title: 'Know every county before you bid.',
      about: 'Every MA contract, plan and county from public CMS data: enrollment, benefits, premiums, exits and benchmarks, set against your own public footprint.',
      details: ['Monthly enrollment by contract and county', 'PBP benefits and premiums, year over year', 'Plan exits and crosswalks', 'County benchmarks and FFS cost'],
      stat: 'Free scorecard · Pro workspace',
      links: [{ label: 'Get your free scorecard', href: '#scorecard' }],
      demo: [
        {
          q: 'How did our contract do against competitors in our largest county this year?',
          acts: ['reading CMS monthly enrollment, Nov 2026', 'rolling plans up to parent organizations', 'ranking share change since January'],
          lead: 'You lost 1.9 points of share while Competitor A gained 3.4. Most of the movement came from two $0-premium PPOs.',
          block: { kind: 'rank', rows: [
            { label: 'Competitor A', val: '41.2%', frac: 0.412, delta: '▲ 3.4 pts' },
            { label: 'Your contract', val: '22.8%', frac: 0.228, delta: '▼ 1.9 pts', down: true },
            { label: 'Competitor B', val: '18.1%', frac: 0.181, delta: '▲ 0.6 pts' },
            { label: 'Competitor C', val: '9.4%', frac: 0.094, delta: '▼ 1.2 pts', down: true }
          ] },
          srcs: ['CMS monthly enrollment (CPSC)', 'Parent organization map']
        },
        {
          q: 'What did the gainers change in their 2027 benefits?',
          acts: ['diffing PBP filings 2026 to 2027', 'joining premiums and dental maximums'],
          lead: 'Lower premiums and richer dental. Both gainers sell at $0 with dental maximums at least twice yours.',
          block: { kind: 'table', cols: ['Plan', 'Premium', 'Dental max'], rows: [
            ['Competitor A PPO', '$0', '$2,500'], ['Competitor B HMO', '$0', '$2,000'], ['Your HMO', '$19', '$1,000']
          ], hi: 2 },
          srcs: ['CMS PBP benefits 2026 and 2027']
        },
        {
          q: 'So how much room does next year\'s benchmark give us?',
          acts: ['reading the county ratebook', 'applying your Star level and the QBP'],
          lead: 'The CY2027 benchmark rises in your top county. At your Star level, part of that becomes rebate you can spend on premium or dental.',
          block: { kind: 'stats', items: [
            { label: 'Benchmark change', val: '+4.8%' }, { label: 'QBP applied', val: '5%' }, { label: 'Rebate share', val: '65%' }
          ] },
          srcs: ['CMS ratebook CY2027', 'Star Ratings 2027']
        }
      ]
    },
    {
      num: '02', worldName: 'Stars and risk · public data', color: '#C2700F',
      title: 'See your rating and revenue risk first.',
      about: 'Star measures against the cut points, and what V28 does to your risk scores, from CMS data tables and the published risk model.',
      details: ['Star data tables and cut points', 'Measures closest to the next level', 'V24 vs V28 coefficients by condition', 'Revenue at stake per contract'],
      stat: 'Free V28 check · Stars simulator',
      links: [{ label: 'Run the free V28 check', href: '#v28' }],
      demo: [
        {
          q: 'Which Star measures put our 4.0 rating at risk?',
          acts: ['reading the 2027 Star data tables', 'lining measures up against the cut points'],
          lead: 'Three measures sit within a few points of dropping a level. Together they are enough to pull the contract under 4.0.',
          block: { kind: 'table', cols: ['Measure', 'Now', 'Margin'], rows: [
            ['Controlling blood pressure', '4★', '1.2 pts'], ['Medication adherence, diabetes', '4★', '0.8 pts'], ['Plan all-cause readmissions', '3★', '2.1 pts']
          ], hi: 1 },
          srcs: ['Star Ratings data tables 2027', 'Cut points 2027']
        },
        {
          q: 'How much does V28 move our revenue?',
          acts: ['applying V24 and V28 coefficients', 'weighting by your county mix'],
          lead: 'Modelled from public data, the full V28 phase-in lowers your average risk score. Bring your encounters and we show which members drive it.',
          block: { kind: 'stats', items: [
            { label: 'Risk score change', val: '−3.1%' }, { label: 'Revenue at stake', val: '$4.2M' }, { label: 'Top driver', val: 'Vascular' }
          ] },
          srcs: ['CMS-HCC V24 and V28 models', 'County risk scores']
        }
      ]
    },
    {
      num: '03', worldName: 'Medicaid · public data', color: '#1F9D74',
      title: 'Every state, read the same way.',
      about: 'Managed care enrollment, rate certifications, MLR, quality and procurements across states, so you can see the next contract before the RFP drops.',
      details: ['MCO enrollment by state and plan', 'Rate certifications, read by AI', 'Core Set quality and DQ Atlas', 'RFP and re-procurement calendar'],
      stat: 'Free RFP calendar · Medicaid workspace',
      links: [{ label: 'See the RFP calendar', href: '#rfp' }],
      demo: [
        {
          q: 'Which Medicaid managed care contracts come up for procurement in the next 12 months?',
          acts: ['reading state procurement portals', 'matching contracts to incumbent MCOs'],
          lead: 'Three states in your region re-procure within a year. You are an incumbent in one and a challenger in two.',
          block: { kind: 'table', cols: ['State', 'Expected RFP', 'You'], rows: [
            ['State A', 'Q1 2027', 'Incumbent'], ['State B', 'Q2 2027', 'Challenger'], ['State C', 'Q4 2027', 'Challenger']
          ], hi: 0 },
          srcs: ['State procurement notices', 'Medicaid managed care enrollment']
        },
        {
          q: 'How did State A\'s rates move in the last certification?',
          acts: ['reading the actuarial rate certification PDF', 'extracting rate cell tables, page-referenced'],
          lead: 'Rates rose on average, but the expansion adult cell fell. The certification cites lower utilization in the base data, which is where encounter completeness matters.',
          block: { kind: 'stats', items: [
            { label: 'Average change', val: '+2.6%' }, { label: 'Expansion adult', val: '−1.4%' }, { label: 'Source page', val: 'p. 37' }
          ] },
          srcs: ['State A rate certification', 'Page-level citation']
        }
      ]
    },
    {
      num: '04', worldName: 'Your data · Bid Platform', color: '#D9467A',
      title: 'Then bring your own data.',
      about: 'Load claims, encounters and last year\'s BPT. The same model puts your actual cost next to what you bid, by service category and cost component.',
      details: ['Actual vs bid by service category', 'Operational to regulatory cost walk', 'Variance traced to the claim line', 'Next bid built on what really happened'],
      stat: 'Bid Platform · enterprise',
      links: [{ label: 'Scope a pilot', href: '#contact', program: 'pilot' }, { label: 'How the cost walk works', href: '#cost-walk' }],
      demo: [
        {
          q: 'Where did actual cost run over the bid this year?',
          acts: ['joining claims to BPT service categories', 'completing with lag factors', 'comparing to bid PMPM'],
          lead: 'Part B drugs and inpatient ran over. Supplemental benefits came in under, mostly because dental use was lower than priced.',
          block: { kind: 'rank', rows: [
            { label: 'Part B drugs', val: '+9.8%', frac: 0.98, delta: 'over bid', down: true },
            { label: 'Inpatient', val: '+4.1%', frac: 0.41, delta: 'over bid', down: true },
            { label: 'Outpatient', val: '+2.3%', frac: 0.23, delta: 'over bid', down: true },
            { label: 'Supplemental', val: '−3.0%', frac: 0.30, delta: 'under bid' }
          ] },
          srcs: ['Your claims', 'Your CY2026 BPT', 'Lag triangles']
        },
        {
          q: 'Which of those should change the CY2029 bid?',
          acts: ['separating trend from one-off cost', 'checking against public FFS trend'],
          lead: 'Part B drug trend is structural and belongs in the bid. Most of the inpatient overrun came from a few high-cost cases and should be smoothed, not trended.',
          srcs: ['Your claims', 'Medicare FFS geographic variation']
        }
      ]
    }
  ];
  window.PLUMB_CHAPTERS = CHAPTERS;
})();
