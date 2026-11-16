export const CORPORATE_OVERVIEW = {
  referenceDate: '16/11/2026',
  kpis2025: [
    { label: 'Receita consolidada · 2025', eurMillions: 36272, foot: '−9,5% vs. 2024' },
    { label: 'Resultado operacional · 2025', eurMillions: 413, foot: 'Margem operacional: 1,1%' },
    { label: 'Lucro após impostos · 2025', eurMillions: 310, foot: '2024: € 3.595 mi' },
    { label: 'Vendas consolidadas · 2025', units: 265663, foot: '−15,0% vs. 2024' },
  ],
  annualComparison: [
    { year: '2025', revenueEurM: 36272, netProfitEurM: 310 },
    { year: '2024', revenueEurM: 40083, netProfitEurM: 3595 },
  ],
  nineMonths2026: {
    cutoff: 'Até 30/09/2026',
    revenueEurM: 25280,
    operatingResultEurM: 1740,
    autoNetCashFlowEurM: 2500,
    foot: 'Margem operacional 6,9% · EBITDA automotivo 17,3% · margem de caixa 11,3%',
  },
  operationalIndicators: [
    { label: 'Entregas · 2025', value: '279.449', foot: '−10,1% vs. 2024', negative: false },
    { label: 'Produção · 2025', value: '261.341', foot: 'Unidades produzidas', negative: false },
    { label: 'Entregas · 9M 2026', value: '178.532', foot: '−16,0% vs. 9M 2025', negative: true },
  ],
};

export const INCOME_STATEMENT_IFRS = [
  { item: 'Receita líquida', y2025: 36272, y2024: 40083, variation: '-9,5%' },
  { item: 'Custo das vendas', y2025: -31221, y2024: -29756, variation: '+4,9%' },
  { item: 'Lucro bruto', y2025: 5051, y2024: 10327, variation: '-51,1%' },
  { item: 'Despesas de distribuição', y2025: -2796, y2024: -3099, variation: '-9,8%' },
  { item: 'Despesas administrativas', y2025: -1899, y2024: -1859, variation: '+2,2%' },
  { item: 'Resultado operacional', y2025: 413, y2024: 5637, variation: '-92,7%' },
  { item: 'Resultado financeiro', y2025: 32, y2024: -409, variation: '-107,8%' },
  { item: 'Lucro antes dos impostos', y2025: 445, y2024: 5227, variation: '-91,5%' },
  { item: 'Imposto sobre o lucro', y2025: -135, y2024: -1632, variation: '-91,7%' },
  { item: 'Lucro após impostos', y2025: 310, y2024: 3595, variation: '-91,4%' },
];

export const CORPORATE_SALES_BY_MODEL = [
  { model: '911', y2025: 52208, y2024: 50761, variation: '+2,9%' },
  { model: '718 Boxster/Cayman', y2025: 17315, y2024: 25165, variation: '-31,2%' },
  { model: 'Macan', y2025: 79769, y2024: 82872, variation: '-3,7%' },
  { model: 'Cayenne', y2025: 76917, y2024: 100469, variation: '-23,4%' },
  { model: 'Panamera', y2025: 25876, y2024: 30657, variation: '-15,6%' },
  { model: 'Taycan', y2025: 13578, y2024: 22696, variation: '-40,2%' },
];

export const CORPORATE_DELIVERIES_BY_MODEL = [
  { model: '911', y2025: 51583, y2024: 50941, y9m2026: 42217 },
  { model: '718 Boxster/Cayman', y2025: 18583, y2024: 23670, y9m2026: 3291 },
  { model: 'Macan', y2025: 84328, y2024: 82795, y9m2026: 51025 },
  { model: 'Cayenne', y2025: 80886, y2024: 102889, y9m2026: 59586 },
  { model: 'Panamera', y2025: 27701, y2024: 29587, y9m2026: 13714 },
  { model: 'Taycan', y2025: 16339, y2024: 20836, y9m2026: 8699 },
];

export const REGIONAL_DELIVERIES = [
  { region: 'América do Norte (excl. México)', share2025: 30.9, units9m2026: 56088 },
  { region: 'Europa (excl. Alemanha)', share2025: 23.7, units9m2026: 44949 },
  { region: 'Mercados Ultramarinos e Emergentes', share2025: 19.7, units9m2026: 35048 },
  { region: 'China (incl. Hong Kong)', share2025: 15.0, units9m2026: 21493 },
  { region: 'Alemanha', share2025: 10.7, units9m2026: 20954 },
];

export const CORPORATE_ENTITIES = [
  { entity: 'Porsche Engineering', activity: 'Engenharia e desenvolvimento', classification: 'Ecossistema Porsche; validar entidade jurídica e consolidação' },
  { entity: 'Porsche Consulting', activity: 'Consultoria de gestão', classification: 'Ecossistema Porsche; validar entidade jurídica e consolidação' },
  { entity: 'Porsche Financial Services', activity: 'Financiamento e serviços financeiros', classification: 'Atividade/entidades financeiras do grupo' },
  { entity: 'Porsche Deutschland', activity: 'Distribuição e operações comerciais', classification: 'Operação comercial' },
  { entity: 'Porsche Leipzig', activity: 'Produção e experiência de marca', classification: 'Unidade/operação' },
  { entity: 'Porsche Digital', activity: 'Tecnologia e serviços digitais', classification: 'Estrutura digital; validar situação societária' },
  { entity: 'Porsche Design', activity: 'Design e lifestyle', classification: 'Marca/estrutura própria; não presumir consolidação integral' },
  { entity: 'Porsche Motorsport', activity: 'Competição e performance', classification: 'Divisão/atividade' },
  { entity: 'Porsche Exclusive Manufaktur', activity: 'Personalização de veículos', classification: 'Marca/atividade' },
];

export const CORPORATE_PLANTS = [
  { unit: 'Zuffenhausen', country: 'Alemanha', activity: 'Sede; 911 e Taycan' },
  { unit: 'Leipzig', country: 'Alemanha', activity: 'Macan e Panamera' },
  { unit: 'Weissach', country: 'Alemanha', activity: 'Pesquisa e desenvolvimento' },
  { unit: 'Bratislava', country: 'Eslováquia', activity: 'Produção do Cayenne na rede industrial do Grupo Volkswagen' },
  { unit: 'Kulim', country: 'Malásia', activity: 'Montagem local para mercados específicos' },
  { unit: 'Osnabrück', country: 'Alemanha', activity: 'Produção contratada/histórico 718; validar programa vigente' },
];

export const ESG_PILLARS = [
  { title: 'Eletrificação', desc: 'BEV, híbridos plug-in e T-Hybrid.' },
  { title: 'Engenharia', desc: 'Weissach e Porsche Engineering.' },
  { title: 'Motorsport', desc: 'Competição e engenharia de performance.' },
  { title: 'Emissões', desc: 'Escopos 1, 2 e 3.' },
  { title: 'Economia circular', desc: 'Materiais, reciclagem e ciclo de vida.' },
  { title: 'Governança', desc: 'Compliance, riscos e transparência.' },
];
