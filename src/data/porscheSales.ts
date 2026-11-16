export type CurrencyCode = 'BRL' | 'EUR' | 'USD';

export interface SaleRecord {
  id: string;
  modelo: string;
  cidade: string;
  estado: string;
  ano: number;
  mes: number;
  preco: number; // Always sanitized numeric BRL
  metodoPagamento: string;
}

export interface ImportDiagnostics {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  invalidReasons: { row: number; raw: string; reason: string }[];
  records: SaleRecord[];
}

export const CURRENCY_META: Record<
  CurrencyCode,
  { label: string; symbol: string; rateFromBrl: number; locale: string }
> = {
  BRL: { label: 'Real (R$)', symbol: 'R$', rateFromBrl: 1, locale: 'pt-BR' },
  EUR: { label: 'Euro (€)', symbol: '€', rateFromBrl: 1 / 6.2838, locale: 'pt-BR' },
  USD: { label: 'Dólar (US$)', symbol: 'US$', rateFromBrl: 1.1014 / 6.2838, locale: 'pt-BR' },
};

export function formatMoney(valueInBrl: number, currency: CurrencyCode, compact = false): string {
  const { symbol, rateFromBrl, locale } = CURRENCY_META[currency];
  const converted = valueInBrl * rateFromBrl;
  if (compact) {
    if (Math.abs(converted) >= 1_000_000) {
      return `${symbol} ${(converted / 1_000_000).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} mi`;
    }
    if (Math.abs(converted) >= 1_000) {
      return `${symbol} ${(converted / 1_000).toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} mil`;
    }
  }
  return `${symbol} ${converted.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// 100 sanitized sales records reflecting realistic Porsche Brasil portfolio mix
const MODEL_TEMPLATES: { modelo: string; basePrice: number; spread: number; weight: number }[] = [
  { modelo: 'Macan', basePrice: 545000, spread: 145000, weight: 28 },
  { modelo: 'Cayenne', basePrice: 780000, spread: 290000, weight: 24 },
  { modelo: '911', basePrice: 1050000, spread: 580000, weight: 21 },
  { modelo: 'Panamera', basePrice: 860000, spread: 240000, weight: 10 },
  { modelo: 'Taycan', basePrice: 690000, spread: 260000, weight: 9 },
  { modelo: '718 Boxster/Cayman', basePrice: 565000, spread: 155000, weight: 8 },
];

const LOCATION_POOL: { cidade: string; estado: string }[] = [
  { cidade: 'São Paulo', estado: 'SP' },
  { cidade: 'São Paulo', estado: 'SP' },
  { cidade: 'São Paulo', estado: 'SP' },
  { cidade: 'Campinas', estado: 'SP' },
  { cidade: 'Ribeirão Preto', estado: 'SP' },
  { cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cidade: 'Rio de Janeiro', estado: 'RJ' },
  { cidade: 'Belo Horizonte', estado: 'MG' },
  { cidade: 'Curitiba', estado: 'PR' },
  { cidade: 'Curitiba', estado: 'PR' },
  { cidade: 'Florianópolis', estado: 'SC' },
  { cidade: 'Balneário Camboriú', estado: 'SC' },
  { cidade: 'Porto Alegre', estado: 'RS' },
  { cidade: 'Brasília', estado: 'DF' },
  { cidade: 'Goiânia', estado: 'GO' },
  { cidade: 'Salvador', estado: 'BA' },
  { cidade: 'Fortaleza', estado: 'CE' },
  { cidade: 'Recife', estado: 'PE' },
];

const YEAR_POOL = [2022, 2023, 2023, 2024, 2024, 2024, 2025, 2025, 2025, 2026];

function createInitialDataset(): SaleRecord[] {
  const expandedModels: typeof MODEL_TEMPLATES = [];
  for (const m of MODEL_TEMPLATES) {
    for (let i = 0; i < m.weight; i++) expandedModels.push(m);
  }

  const records: SaleRecord[] = [];
  for (let i = 0; i < 100; i++) {
    // Deterministic pseudo-random distribution for clean, realistic spread
    const modelIdx = (i * 17 + 5) % expandedModels.length;
    const locIdx = (i * 11 + 3) % LOCATION_POOL.length;
    const yearIdx = (i * 7 + 2) % YEAR_POOL.length;
    const model = expandedModels[modelIdx];
    const loc = LOCATION_POOL[locIdx];
    const ano = YEAR_POOL[yearIdx];
    const mes =
      ano === 2026
        ? ((Math.floor(i / 10) * 2 + 2) % 11) + 1
        : ((i * 7 + Math.floor(i / 10)) % 12) + 1;

    // Price varies by model + year inflation + trim tier
    const yearFactor = 1 + (ano - 2022) * 0.035;
    const trimRatio = ((i * 29 + 13) % 100) / 100;
    const rawPrice = (model.basePrice + model.spread * trimRatio) * yearFactor;
    const preco = Math.round(rawPrice / 1000) * 1000;

    // Higher-ticket cars lean more toward À Vista / PIX or Leasing; entry SUVs lean more toward Financiamento/Consórcio
    const paySeed = (i * 19 + (model.modelo === '911' ? 1 : 4)) % 10;
    let metodoPagamento = 'À Vista / PIX';
    if (preco >= 1_100_000) {
      metodoPagamento = paySeed < 6 ? 'À Vista / PIX' : paySeed < 8 ? 'Leasing' : 'Financiamento';
    } else if (preco >= 780_000) {
      metodoPagamento =
        paySeed < 4 ? 'À Vista / PIX' : paySeed < 7 ? 'Financiamento' : paySeed < 9 ? 'Leasing' : 'Consórcio';
    } else {
      metodoPagamento =
        paySeed < 3 ? 'À Vista / PIX' : paySeed < 7 ? 'Financiamento' : paySeed < 9 ? 'Consórcio' : 'Leasing';
    }

    records.push({
      id: `POR-${String(i + 1).padStart(3, '0')}`,
      modelo: model.modelo,
      cidade: loc.cidade,
      estado: loc.estado,
      ano,
      mes,
      preco,
      metodoPagamento,
    });
  }
  return records;
}

export const INITIAL_SALES_DATA: SaleRecord[] = createInitialDataset();

function parseFlexibleNumber(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned || /invalid|n\/a|null|erro/i.test(cleaned)) return null;
  // Remove currency symbols and spaces
  let numStr = cleaned.replace(/[R$€US\s]/gi, '');
  // Detect Brazilian format (e.g. 850.000,00 or 850.000) vs US format (850,000.00)
  if (numStr.includes(',') && numStr.includes('.')) {
    if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
      numStr = numStr.replace(/\./g, '').replace(',', '.');
    } else {
      numStr = numStr.replace(/,/g, '');
    }
  } else if (numStr.includes(',')) {
    const parts = numStr.split(',');
    if (parts[1] && parts[1].length <= 2) {
      numStr = numStr.replace(',', '.');
    } else {
      numStr = numStr.replace(/,/g, '');
    }
  } else if ((numStr.match(/\./g) || []).length > 1) {
    numStr = numStr.replace(/\./g, '');
  } else if (numStr.includes('.')) {
    const parts = numStr.split('.');
    if (parts[1] && parts[1].length === 3) {
      numStr = numStr.replace('.', '');
    }
  }
  const parsed = Number(numStr);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseSalesImport(inputText: string): ImportDiagnostics {
  const trimmed = inputText.trim();
  if (!trimmed) {
    return { totalRows: 0, validRows: 0, invalidRows: 0, invalidReasons: [], records: [] };
  }

  // Try JSON array first
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        const records: SaleRecord[] = [];
        const invalidReasons: ImportDiagnostics['invalidReasons'] = [];
        arr.forEach((item, idx) => {
          const modelo = String(item.modelo ?? item.model ?? '').trim();
          const cidade = String(item.cidade ?? item.city ?? '').trim();
          const estado = String(item.estado ?? item.uf ?? item.state ?? '').trim().toUpperCase();
          const ano = Number(item.ano ?? item.year);
          const preco =
            typeof item.preco === 'number'
              ? item.preco
              : parseFlexibleNumber(String(item.preco ?? item.price ?? ''));
          const metodoPagamento = String(
            item.metodoPagamento ?? item.metodo_pagamento ?? item.pagamento ?? item.payment ?? ''
          ).trim();

          if (
            !modelo ||
            !cidade ||
            !estado ||
            !Number.isFinite(ano) ||
            ano < 1990 ||
            !preco ||
            !metodoPagamento ||
            [modelo, cidade, estado, metodoPagamento].some((v) => /invalid/i.test(v))
          ) {
            invalidReasons.push({
              row: idx + 1,
              raw: JSON.stringify(item).slice(0, 90),
              reason: 'Campo inválido, ausente ou marcado como INVALID',
            });
          } else {
            const rawMes = Number(item.mes ?? item.month);
            const mes =
              Number.isFinite(rawMes) && rawMes >= 1 && rawMes <= 12
                ? Math.trunc(rawMes)
                : ((records.length * 7) % 12) + 1;
            records.push({
              id: `IMP-${String(records.length + 1).padStart(3, '0')}`,
              modelo,
              cidade,
              estado,
              ano: Math.trunc(ano),
              mes,
              preco,
              metodoPagamento,
            });
          }
        });
        return {
          totalRows: arr.length,
          validRows: records.length,
          invalidRows: invalidReasons.length,
          invalidReasons,
          records,
        };
      }
    } catch {
      // Fall through to CSV/TSV parser
    }
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return {
      totalRows: lines.length,
      validRows: 0,
      invalidRows: lines.length,
      invalidReasons: [{ row: 1, raw: trimmed.slice(0, 90), reason: 'Cabeçalho + linhas de dados necessários' }],
      records: [],
    };
  }

  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t')
    ? '\t'
    : firstLine.includes(';')
      ? ';'
      : ',';

  const headers = splitCsvLine(firstLine, delimiter).map((h) =>
    h
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_')
  );

  // Prefer sanitized columns if raw + sanitized exist side-by-side
  const findCol = (candidates: string[]) => {
    const sanitizedIdx = headers.findIndex(
      (h) =>
        (h.includes('sanitiz') || h.includes('limp') || h.includes('tratad')) &&
        candidates.some((c) => h.includes(c))
    );
    if (sanitizedIdx !== -1) return sanitizedIdx;
    return headers.findIndex((h) => candidates.some((c) => h.includes(c)));
  };

  const idxModel = findCol(['modelo', 'model', 'veiculo']);
  const idxCity = findCol(['cidade', 'city', 'municipio']);
  const idxState = findCol(['estado', 'uf', 'state']);
  const idxYear = findCol(['ano', 'year']);
  const idxMonth = findCol(['mes', 'month']);
  const idxPrice = findCol(['preco', 'price', 'valor', 'receita']);
  const idxPay = findCol(['metodo', 'pagamento', 'payment']);

  if ([idxModel, idxCity, idxState, idxYear, idxPrice, idxPay].some((idx) => idx === -1)) {
    return {
      totalRows: lines.length - 1,
      validRows: 0,
      invalidRows: lines.length - 1,
      invalidReasons: [
        {
          row: 1,
          raw: firstLine.slice(0, 90),
          reason:
            'Colunas obrigatórias não detectadas. Esperado: modelo, cidade, estado, ano, preco, metodo_pagamento.',
        },
      ],
      records: [],
    };
  }

  const records: SaleRecord[] = [];
  const invalidReasons: ImportDiagnostics['invalidReasons'] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], delimiter);
    const modelo = (cols[idxModel] ?? '').trim();
    const cidade = (cols[idxCity] ?? '').trim();
    const estado = (cols[idxState] ?? '').trim().toUpperCase();
    const anoNum = Number((cols[idxYear] ?? '').replace(/[^0-9]/g, ''));
    const precoNum = parseFlexibleNumber(cols[idxPrice] ?? '');
    const metodoPagamento = (cols[idxPay] ?? '').trim();

    const hasInvalidFlag = [modelo, cidade, estado, metodoPagamento].some(
      (v) => !v || /^invalid$/i.test(v) || /invalid/i.test(v)
    );

    if (hasInvalidFlag || !Number.isFinite(anoNum) || anoNum < 1990 || anoNum > 2030 || !precoNum) {
      invalidReasons.push({
        row: i + 1,
        raw: lines[i].slice(0, 90),
        reason: hasInvalidFlag
          ? 'Registro contém marcador INVALID ou campo vazio'
          : 'Ano ou preço não pôde ser convertido em número válido',
      });
      continue;
    }

    const rawMes = idxMonth !== -1 ? Number((cols[idxMonth] ?? '').replace(/[^0-9]/g, '')) : NaN;
    const mes =
      Number.isFinite(rawMes) && rawMes >= 1 && rawMes <= 12
        ? rawMes
        : ((records.length * 7) % 12) + 1;

    records.push({
      id: `IMP-${String(records.length + 1).padStart(3, '0')}`,
      modelo,
      cidade,
      estado,
      ano: anoNum,
      mes,
      preco: precoNum,
      metodoPagamento,
    });
  }

  return {
    totalRows: lines.length - 1,
    validRows: records.length,
    invalidRows: invalidReasons.length,
    invalidReasons,
    records,
  };
}
