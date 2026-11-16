import React, { useMemo } from 'react';
import { CalendarRange, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { CurrencyCode, formatMoney, SaleRecord } from '../data/porscheSales';

interface MonthlyPerformanceKpiProps {
  filteredRecords: SaleRecord[];
  currency: CurrencyCode;
}

interface MonthlyBucket {
  ano: number;
  mes: number;
  periodKey: number;
  label: string;
  units: number;
  revenue: number;
  avgTicket: number;
}

const MONTH_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function formatMonthLabel(ano: number, mes: number): string {
  const name = MONTH_SHORT[mes - 1] ?? String(mes).padStart(2, '0');
  return `${name}/${ano}`;
}

export const MonthlyPerformanceKpi: React.FC<MonthlyPerformanceKpiProps> = ({
  filteredRecords,
  currency,
}) => {
  const metrics = useMemo(() => {
    const totalUnits = filteredRecords.length;
    const totalRevenue = filteredRecords.reduce((sum, r) => sum + r.preco, 0);
    const filteredAvgTicket = totalUnits > 0 ? totalRevenue / totalUnits : 0;

    const bucketMap = new Map<number, { ano: number; mes: number; units: number; revenue: number }>();
    for (const r of filteredRecords) {
      const periodKey = r.ano * 100 + r.mes;
      const curr = bucketMap.get(periodKey) ?? {
        ano: r.ano,
        mes: r.mes,
        units: 0,
        revenue: 0,
      };
      curr.units += 1;
      curr.revenue += r.preco;
      bucketMap.set(periodKey, curr);
    }

    const buckets: MonthlyBucket[] = Array.from(bucketMap.entries())
      .map(([periodKey, b]) => ({
        ano: b.ano,
        mes: b.mes,
        periodKey,
        label: formatMonthLabel(b.ano, b.mes),
        units: b.units,
        revenue: b.revenue,
        avgTicket: b.units > 0 ? b.revenue / b.units : 0,
      }))
      .sort((a, b) => a.periodKey - b.periodKey);

    const currentMonth = buckets.length > 0 ? buckets[buckets.length - 1] : null;
    let previousMonth: MonthlyBucket | null = null;
    let isConsecutiveMonth = false;

    if (currentMonth) {
      const prevCalAno = currentMonth.mes === 1 ? currentMonth.ano - 1 : currentMonth.ano;
      const prevCalMes = currentMonth.mes === 1 ? 12 : currentMonth.mes - 1;
      const prevCalKey = prevCalAno * 100 + prevCalMes;
      const exactPrev = buckets.find((b) => b.periodKey === prevCalKey);
      if (exactPrev) {
        previousMonth = exactPrev;
        isConsecutiveMonth = true;
      } else if (buckets.length >= 2) {
        previousMonth = buckets[buckets.length - 2];
        isConsecutiveMonth = false;
      }
    }

    const variationPct =
      currentMonth && previousMonth && previousMonth.avgTicket > 0
        ? ((currentMonth.avgTicket - previousMonth.avgTicket) / previousMonth.avgTicket) * 100
        : null;

    const recentMonths = buckets.slice(-6);
    const maxRecentTicket = Math.max(...recentMonths.map((m) => m.avgTicket), 1);

    return {
      totalUnits,
      filteredAvgTicket,
      currentMonth,
      previousMonth,
      isConsecutiveMonth,
      variationPct,
      recentMonths,
      maxRecentTicket,
    };
  }, [filteredRecords]);

  const isPositive = metrics.variationPct !== null && metrics.variationPct > 0;
  const isNegative = metrics.variationPct !== null && metrics.variationPct < 0;

  return (
    <section
      aria-label="KPI de Performance Mensal"
      className="bg-[#121720] border border-white/[0.08] rounded-xl p-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Primary Filtered Average Ticket + MoM Variation */}
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#FF4D64]">
              <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              KPI de Performance Mensal
            </span>
            {metrics.currentMonth && (
              <>
                <span className="text-[#93A0B2]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[#93A0B2] font-mono-tabular">
                  {metrics.currentMonth.label}
                  {metrics.previousMonth ? ` vs. ${metrics.previousMonth.label}` : ''}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <div>
              <div className="text-[11px] text-[#93A0B2]">
                Ticket médio das vendas filtradas ({metrics.totalUnits}{' '}
                {metrics.totalUnits === 1 ? 'venda' : 'vendas'})
              </div>
              <div className="font-mono-tabular text-3xl font-semibold text-[#F2F4F8] mt-0.5">
                {metrics.totalUnits > 0 ? formatMoney(metrics.filteredAvgTicket, currency) : '—'}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end pb-1">
              {metrics.variationPct !== null ? (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono-tabular font-medium ${
                    isPositive
                      ? 'bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]'
                      : isNegative
                        ? 'bg-[#D5001C]/15 border-[#D5001C]/40 text-[#FF4D64]'
                        : 'bg-[#1B222E] border-white/10 text-[#D0D7E2]'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  ) : isNegative ? (
                    <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {metrics.variationPct > 0 ? '+' : ''}
                    {metrics.variationPct.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-sans font-normal opacity-85">
                    {metrics.isConsecutiveMonth
                      ? 'em relação ao mês anterior'
                      : 'vs. mês anterior no recorte'}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-[#93A0B2]">
                  {metrics.totalUnits === 0
                    ? 'Sem vendas no recorte atual'
                    : 'Apenas 1 mês disponível neste recorte'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Month Comparison & Recent Monthly Trajectory */}
        {metrics.currentMonth && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 lg:gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[11px] text-[#93A0B2]">
                  Mês atual ({metrics.currentMonth.label})
                </div>
                <div className="font-mono-tabular text-sm font-semibold text-[#F2F4F8] mt-0.5">
                  {formatMoney(metrics.currentMonth.avgTicket, currency, true)}
                </div>
                <div className="text-[11px] font-mono-tabular text-[#93A0B2]">
                  {metrics.currentMonth.units}{' '}
                  {metrics.currentMonth.units === 1 ? 'unidade' : 'unidades'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#93A0B2]">
                  {metrics.previousMonth
                    ? `Mês anterior (${metrics.previousMonth.label})`
                    : 'Mês anterior'}
                </div>
                <div className="font-mono-tabular text-sm font-semibold text-[#D0D7E2] mt-0.5">
                  {metrics.previousMonth
                    ? formatMoney(metrics.previousMonth.avgTicket, currency, true)
                    : '—'}
                </div>
                <div className="text-[11px] font-mono-tabular text-[#93A0B2]">
                  {metrics.previousMonth
                    ? `${metrics.previousMonth.units} ${
                        metrics.previousMonth.units === 1 ? 'unidade' : 'unidades'
                      }`
                    : 'Sem comparativo'}
                </div>
              </div>
            </div>

            {metrics.recentMonths.length > 1 && (
              <div className="flex flex-col justify-end">
                <div className="text-[10px] text-[#93A0B2] mb-1.5">
                  Ticket médio mensal recente
                </div>
                <div className="flex items-end gap-1.5 h-12">
                  {metrics.recentMonths.map((m, idx) => {
                    const isLatest = idx === metrics.recentMonths.length - 1;
                    const heightPct = Math.max((m.avgTicket / metrics.maxRecentTicket) * 100, 14);
                    return (
                      <div
                        key={m.periodKey}
                        title={`${m.label}: ${formatMoney(m.avgTicket, currency)} (${m.units} unid.)`}
                        className="flex flex-col items-center justify-end h-full w-7"
                      >
                        <div className="w-full flex-1 flex items-end justify-center">
                          <div
                            className={`w-4 rounded-t-xs transition-all duration-300 ${
                              isLatest ? 'bg-[#D5001C]' : 'bg-[#2C394E]'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-mono-tabular mt-1 leading-none ${
                            isLatest ? 'text-[#F2F4F8] font-medium' : 'text-[#7B889B]'
                          }`}
                        >
                          {MONTH_SHORT[m.mes - 1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
