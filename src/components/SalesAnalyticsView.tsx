import React, { useMemo, useState } from 'react';
import { ArrowDownUp, FilterX, Search } from 'lucide-react';
import { CurrencyCode, formatMoney, SaleRecord } from '../data/porscheSales';
import { MonthlyPerformanceKpi } from './MonthlyPerformanceKpi';

interface SalesAnalyticsViewProps {
  records: SaleRecord[];
  currency: CurrencyCode;
  onNavigateToData: () => void;
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({
  records,
  currency,
  onNavigateToData,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [geoMode, setGeoMode] = useState<'estado' | 'cidade'>('estado');
  const [sortBy, setSortBy] = useState<'preco' | 'ano'>('preco');
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const filterOptions = useMemo(() => {
    const models = Array.from(new Set(records.map((r) => r.modelo))).sort();
    const states = Array.from(new Set(records.map((r) => r.estado))).sort();
    const cities = Array.from(
      new Set(
        records
          .filter((r) => selectedState === 'ALL' || r.estado === selectedState)
          .map((r) => r.cidade)
      )
    ).sort();
    const years = Array.from(new Set(records.map((r) => String(r.ano)))).sort();
    const payments = Array.from(new Set(records.map((r) => r.metodoPagamento))).sort();
    return { models, states, cities, years, payments };
  }, [records, selectedState]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      if (selectedModel !== 'ALL' && r.modelo !== selectedModel) return false;
      if (selectedState !== 'ALL' && r.estado !== selectedState) return false;
      if (selectedCity !== 'ALL' && r.cidade !== selectedCity) return false;
      if (selectedYear !== 'ALL' && String(r.ano) !== selectedYear) return false;
      if (selectedPayment !== 'ALL' && r.metodoPagamento !== selectedPayment) return false;
      if (
        q &&
        !r.modelo.toLowerCase().includes(q) &&
        !r.cidade.toLowerCase().includes(q) &&
        !r.estado.toLowerCase().includes(q) &&
        !r.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [records, selectedModel, selectedState, selectedCity, selectedYear, selectedPayment, searchQuery]);

  const hasActiveFilters =
    selectedModel !== 'ALL' ||
    selectedState !== 'ALL' ||
    selectedCity !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedPayment !== 'ALL' ||
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedModel('ALL');
    setSelectedState('ALL');
    setSelectedCity('ALL');
    setSelectedYear('ALL');
    setSelectedPayment('ALL');
    setSearchQuery('');
  };

  // Top KPIs
  const kpis = useMemo(() => {
    const totalUnits = filtered.length;
    const totalRevenue = filtered.reduce((sum, r) => sum + r.preco, 0);
    const avgTicket = totalUnits > 0 ? totalRevenue / totalUnits : 0;

    const baseTotalRev = records.reduce((sum, r) => sum + r.preco, 0);
    const baseAvgTicket = records.length > 0 ? baseTotalRev / records.length : 0;
    const ticketDeltaPct = baseAvgTicket > 0 ? ((avgTicket - baseAvgTicket) / baseAvgTicket) * 100 : 0;

    const revByModel = new Map<string, { rev: number; units: number }>();
    for (const r of filtered) {
      const curr = revByModel.get(r.modelo) ?? { rev: 0, units: 0 };
      curr.rev += r.preco;
      curr.units += 1;
      revByModel.set(r.modelo, curr);
    }
    const sortedModels = Array.from(revByModel.entries()).sort((a, b) => b[1].rev - a[1].rev);
    const leader = sortedModels[0];

    return {
      totalUnits,
      unitSharePct: records.length > 0 ? (totalUnits / records.length) * 100 : 0,
      totalRevenue,
      revSharePct: baseTotalRev > 0 ? (totalRevenue / baseTotalRev) * 100 : 0,
      avgTicket,
      ticketDeltaPct,
      leaderName: leader ? leader[0] : '—',
      leaderRevShare: leader && totalRevenue > 0 ? (leader[1].rev / totalRevenue) * 100 : 0,
      leaderUnits: leader ? leader[1].units : 0,
    };
  }, [filtered, records]);

  // Question 1: Model Mix (Volume vs Revenue & Avg Ticket)
  const modelBreakdown = useMemo(() => {
    const map = new Map<string, { modelo: string; units: number; revenue: number }>();
    for (const r of filtered) {
      const curr = map.get(r.modelo) ?? { modelo: r.modelo, units: 0, revenue: 0 };
      curr.units += 1;
      curr.revenue += r.preco;
      map.set(r.modelo, curr);
    }
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgTicket: item.units > 0 ? item.revenue / item.units : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  const maxModelRev = Math.max(...modelBreakdown.map((m) => m.revenue), 1);
  const maxModelUnits = Math.max(...modelBreakdown.map((m) => m.units), 1);

  // Question 2A: Geographic Concentration (Estado or Cidade)
  const geoBreakdown = useMemo(() => {
    const map = new Map<string, { key: string; sub: string; units: number; revenue: number }>();
    for (const r of filtered) {
      const key = geoMode === 'estado' ? r.estado : r.cidade;
      const sub = geoMode === 'estado' ? r.estado : `${r.cidade} · ${r.estado}`;
      const curr = map.get(key) ?? { key, sub, units: 0, revenue: 0 };
      curr.units += 1;
      curr.revenue += r.preco;
      map.set(key, curr);
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filtered, geoMode]);

  const maxGeoRev = Math.max(...geoBreakdown.map((g) => g.revenue), 1);

  // Question 2B: Yearly Revenue & Volume Trend
  const yearlyTrend = useMemo(() => {
    const map = new Map<number, { ano: number; units: number; revenue: number }>();
    for (const r of filtered) {
      const curr = map.get(r.ano) ?? { ano: r.ano, units: 0, revenue: 0 };
      curr.units += 1;
      curr.revenue += r.preco;
      map.set(r.ano, curr);
    }
    return Array.from(map.values()).sort((a, b) => a.ano - b.ano);
  }, [filtered]);

  const maxYearRev = Math.max(...yearlyTrend.map((y) => y.revenue), 1);

  // Question 3: Payment Methods & Average Ticket
  const paymentBreakdown = useMemo(() => {
    const map = new Map<string, { method: string; units: number; revenue: number }>();
    for (const r of filtered) {
      const curr = map.get(r.metodoPagamento) ?? { method: r.metodoPagamento, units: 0, revenue: 0 };
      curr.units += 1;
      curr.revenue += r.preco;
      map.set(r.metodoPagamento, curr);
    }
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgTicket: item.units > 0 ? item.revenue / item.units : 0,
        sharePct: filtered.length > 0 ? (item.units / filtered.length) * 100 : 0,
      }))
      .sort((a, b) => b.units - a.units);
  }, [filtered]);

  const sortedPreviewRows = useMemo(() => {
    return [...filtered]
      .sort((a, b) => {
        const diff = sortBy === 'preco' ? a.preco - b.preco : a.ano - b.ano;
        return sortDesc ? -diff : diff;
      })
      .slice(0, 12);
  }, [filtered, sortBy, sortDesc]);

  const paymentColors = ['#D5001C', '#6482AD', '#34D399', '#E6B75C'];

  return (
    <div className="space-y-6">
      {/* Monthly Performance KPI */}
      <MonthlyPerformanceKpi filteredRecords={filtered} currency={currency} />

      {/* Filter Toolbar */}
      <section
        aria-label="Filtros da dashboard"
        className="bg-[#121720] border border-white/[0.08] rounded-xl p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-[#93A0B2]">
            <span>Filtros ativos</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[#F2F4F8] font-medium">
              {filtered.length} de {records.length} vendas
            </span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F2F4F8] bg-[#1B222E] hover:bg-[#232C3B] border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5 text-[#FF4D64]" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label htmlFor="filter-model" className="block text-[11px] text-[#93A0B2] mb-1">
              Modelo
            </label>
            <select
              id="filter-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#0B0E14] text-[#F2F4F8] border border-white/10 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#D5001C]"
            >
              <option value="ALL">Todos os modelos</option>
              {filterOptions.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-state" className="block text-[11px] text-[#93A0B2] mb-1">
              Estado (UF)
            </label>
            <select
              id="filter-state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('ALL');
              }}
              className="w-full bg-[#0B0E14] text-[#F2F4F8] border border-white/10 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#D5001C]"
            >
              <option value="ALL">Todos os estados</option>
              {filterOptions.states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-city" className="block text-[11px] text-[#93A0B2] mb-1">
              Cidade
            </label>
            <select
              id="filter-city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#0B0E14] text-[#F2F4F8] border border-white/10 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#D5001C]"
            >
              <option value="ALL">Todas as cidades</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-year" className="block text-[11px] text-[#93A0B2] mb-1">
              Ano
            </label>
            <select
              id="filter-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#0B0E14] text-[#F2F4F8] border border-white/10 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#D5001C]"
            >
              <option value="ALL">Todos os anos</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-payment" className="block text-[11px] text-[#93A0B2] mb-1">
              Método de pagamento
            </label>
            <select
              id="filter-payment"
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full bg-[#0B0E14] text-[#F2F4F8] border border-white/10 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#D5001C]"
            >
              <option value="ALL">Todos os métodos</option>
              {filterOptions.payments.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-search" className="block text-[11px] text-[#93A0B2] mb-1">
              Busca rápida
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#93A0B2] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="filter-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cidade, modelo ou ID"
                className="w-full bg-[#0B0E14] text-[#F2F4F8] placeholder-[#687588] border border-white/10 rounded-md pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-[#D5001C]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Top 4 KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
          <div className="text-xs text-[#93A0B2]">Total de vendas</div>
          <div className="font-mono-tabular text-3xl font-semibold text-[#F2F4F8] mt-2 mb-1">
            {kpis.totalUnits}
          </div>
          <div className="text-xs text-[#93A0B2] font-mono-tabular">
            {kpis.unitSharePct.toFixed(1)}% da base sanitizada
          </div>
        </div>

        <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
          <div className="text-xs text-[#93A0B2]">Receita total no recorte</div>
          <div className="font-mono-tabular text-3xl font-semibold text-[#F2F4F8] mt-2 mb-1">
            {formatMoney(kpis.totalRevenue, currency, true)}
          </div>
          <div className="text-xs text-[#93A0B2] font-mono-tabular">
            {kpis.revSharePct.toFixed(1)}% do faturamento total
          </div>
        </div>

        <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
          <div className="text-xs text-[#93A0B2]">Ticket médio por unidade</div>
          <div className="font-mono-tabular text-3xl font-semibold text-[#F2F4F8] mt-2 mb-1">
            {formatMoney(kpis.avgTicket, currency, true)}
          </div>
          <div className="text-xs text-[#93A0B2] font-mono-tabular">
            {kpis.ticketDeltaPct >= 0 ? '+' : ''}
            {kpis.ticketDeltaPct.toFixed(1)}% vs. média global
          </div>
        </div>

        <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
          <div className="text-xs text-[#93A0B2]">Modelo líder em receita</div>
          <div className="font-display text-2xl font-semibold text-[#F2F4F8] mt-2 mb-1 truncate">
            {kpis.leaderName}
          </div>
          <div className="text-xs text-[#93A0B2] font-mono-tabular">
            {kpis.leaderRevShare.toFixed(1)}% da receita · {kpis.leaderUnits} unid.
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-10 text-center">
          <h2 className="text-lg font-semibold text-[#F2F4F8]">
            Nenhuma venda corresponde aos filtros selecionados
          </h2>
          <p className="text-sm text-[#93A0B2] mt-2 max-w-md mx-auto">
            Ajuste os filtros de modelo, estado, cidade ou ano para visualizar os indicadores e
            gráficos das perguntas de negócio.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 px-4 py-2 text-xs font-medium bg-[#D5001C] hover:bg-[#B80018] text-white rounded-md transition-colors cursor-pointer"
          >
            Restaurar todos os {records.length} registros
          </button>
        </section>
      ) : (
        <>
          {/* Pergunta 1 + Pergunta 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Pergunta 1: Mix de Modelos (Volume vs Receita) */}
            <section className="lg:col-span-7 bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <div className="text-xs font-medium text-[#FF4D64]">
                    01. Pergunta de Negócio · Mix de Modelos
                  </div>
                  <h2 className="text-lg font-semibold text-[#F2F4F8] mt-1">
                    Quais modelos lideram em volume vs. receita e ticket médio?
                  </h2>
                  <p className="text-xs text-[#93A0B2] mt-1">
                    Clique em uma linha para filtrar o modelo. Vermelho indica receita total; cinza
                    azulado indica volume de unidades.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#93A0B2] shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#D5001C]" />
                    Receita
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#6482AD]" />
                    Unidades
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {modelBreakdown.map((item) => {
                  const revPct = (item.revenue / maxModelRev) * 100;
                  const unitPct = (item.units / maxModelUnits) * 100;
                  const isSelected = selectedModel === item.modelo;
                  return (
                    <button
                      key={item.modelo}
                      type="button"
                      onClick={() =>
                        setSelectedModel((prev) => (prev === item.modelo ? 'ALL' : item.modelo))
                      }
                      className={`w-full text-left p-2.5 -mx-2.5 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B222E] ring-1 ring-[#D5001C]/60'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <span className="text-sm font-medium text-[#F2F4F8]">{item.modelo}</span>
                        <div className="flex items-center gap-3 text-xs font-mono-tabular">
                          <span className="text-[#93A0B2]">
                            Ticket: {formatMoney(item.avgTicket, currency, true)}
                          </span>
                          <span className="text-[#F2F4F8] font-medium">
                            {formatMoney(item.revenue, currency, true)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2.5 w-full bg-[#1B222E] rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-[#D5001C] rounded-sm transition-all duration-300"
                            style={{ width: `${Math.max(revPct, 2)}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-[#1B222E] rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-[#6482AD] rounded-sm transition-all duration-300"
                              style={{ width: `${Math.max(unitPct, 2)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono-tabular text-[#93A0B2] w-14 text-right">
                            {item.units} unid.
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Pergunta 2: Concentração Geográfica & Evolução Anual */}
            <section className="lg:col-span-5 bg-[#121720] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <div className="text-xs font-medium text-[#FF4D64]">
                      02. Pergunta de Negócio · Geografia & Tempo
                    </div>
                    <h2 className="text-lg font-semibold text-[#F2F4F8] mt-1">
                      Onde a demanda se concentra e como evolui por ano?
                    </h2>
                  </div>

                  <div className="inline-flex bg-[#0B0E14] border border-white/10 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setGeoMode('estado')}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        geoMode === 'estado'
                          ? 'bg-[#1D2533] text-white font-medium'
                          : 'text-[#93A0B2] hover:text-white'
                      }`}
                    >
                      Estado (UF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeoMode('cidade')}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        geoMode === 'cidade'
                          ? 'bg-[#1D2533] text-white font-medium'
                          : 'text-[#93A0B2] hover:text-white'
                      }`}
                    >
                      Cidade
                    </button>
                  </div>
                </div>

                {/* Top States / Cities */}
                <div className="space-y-2.5 mb-6">
                  {geoBreakdown.map((g) => {
                    const pct = (g.revenue / maxGeoRev) * 100;
                    const isSelected =
                      geoMode === 'estado' ? selectedState === g.key : selectedCity === g.key;
                    return (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => {
                          if (geoMode === 'estado') {
                            setSelectedState((prev) => (prev === g.key ? 'ALL' : g.key));
                            setSelectedCity('ALL');
                          } else {
                            setSelectedCity((prev) => (prev === g.key ? 'ALL' : g.key));
                          }
                        }}
                        className={`w-full grid grid-cols-[120px_1fr_92px] items-center gap-3 text-left py-1 px-1.5 -mx-1.5 rounded-md transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#1B222E]' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <span className="text-xs text-[#F2F4F8] truncate">{g.sub}</span>
                        <div className="h-2 bg-[#1B222E] rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-[#6482AD] rounded-sm transition-all duration-300"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono-tabular text-right text-[#F2F4F8]">
                          {formatMoney(g.revenue, currency, true)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Annual SVG Trend */}
              <div className="pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-[#93A0B2] mb-3">
                  <span>Evolução anual de receita</span>
                  <span className="font-mono-tabular">
                    {hoveredYear
                      ? (() => {
                          const y = yearlyTrend.find((item) => item.ano === hoveredYear);
                          return y
                            ? `${y.ano}: ${y.units} unid. · ${formatMoney(y.revenue, currency, true)}`
                            : '';
                        })()
                      : 'Passe ou clique em um ano'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 items-end h-28 pt-2">
                  {yearlyTrend.map((y) => {
                    const barHeight = Math.max((y.revenue / maxYearRev) * 100, 10);
                    const isYearActive = selectedYear === String(y.ano);
                    return (
                      <button
                        key={y.ano}
                        type="button"
                        onMouseEnter={() => setHoveredYear(y.ano)}
                        onMouseLeave={() => setHoveredYear(null)}
                        onClick={() =>
                          setSelectedYear((prev) => (prev === String(y.ano) ? 'ALL' : String(y.ano)))
                        }
                        className="flex flex-col items-center justify-end h-full group cursor-pointer"
                      >
                        <span className="text-[10px] font-mono-tabular text-[#93A0B2] mb-1">
                          {y.units}
                        </span>
                        <div className="w-full flex-1 flex items-end justify-center">
                          <div
                            className={`w-full max-w-[36px] rounded-t-sm transition-all duration-200 ${
                              isYearActive
                                ? 'bg-[#D5001C]'
                                : 'bg-[#2C394E] group-hover:bg-[#FF4D64]'
                            }`}
                            style={{ height: `${barHeight}%` }}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-mono-tabular mt-1.5 ${
                            isYearActive ? 'text-white font-semibold' : 'text-[#93A0B2]'
                          }`}
                        >
                          {y.ano}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Pergunta 3: Métodos de Pagamento & Ticket Médio */}
          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs font-medium text-[#FF4D64]">
                  03. Pergunta de Negócio · Modalidade Financeira
                </div>
                <h2 className="text-lg font-semibold text-[#F2F4F8] mt-1">
                  Qual método de pagamento predomina e como varia o ticket médio?
                </h2>
                <p className="text-xs text-[#93A0B2] mt-1">
                  Distribuição proporcional das vendas filtradas e valor médio pago em cada método.
                </p>
              </div>
            </div>

            {/* Proportional Stacked Bar */}
            <div className="h-3.5 w-full bg-[#1B222E] rounded-md overflow-hidden flex mb-5">
              {paymentBreakdown.map((item, idx) => (
                <button
                  key={item.method}
                  type="button"
                  title={`${item.method}: ${item.sharePct.toFixed(1)}%`}
                  onClick={() =>
                    setSelectedPayment((prev) => (prev === item.method ? 'ALL' : item.method))
                  }
                  style={{
                    width: `${item.sharePct}%`,
                    backgroundColor: paymentColors[idx % paymentColors.length],
                  }}
                  className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {paymentBreakdown.map((item, idx) => {
                const isSelected = selectedPayment === item.method;
                return (
                  <button
                    key={item.method}
                    type="button"
                    onClick={() =>
                      setSelectedPayment((prev) => (prev === item.method ? 'ALL' : item.method))
                    }
                    className={`text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B222E] border-[#D5001C]'
                        : 'bg-[#0B0E14]/60 border-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#F2F4F8]">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: paymentColors[idx % paymentColors.length] }}
                        />
                        {item.method}
                      </span>
                      <span className="text-xs font-mono-tabular text-[#93A0B2]">
                        {item.sharePct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="font-mono-tabular text-lg font-semibold text-[#F2F4F8] mt-2">
                      {formatMoney(item.avgTicket, currency, true)}
                    </div>
                    <div className="text-[11px] text-[#93A0B2] font-mono-tabular mt-0.5">
                      {item.units} vendas · {formatMoney(item.revenue, currency, true)} total
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Compact Sample Table */}
          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#F2F4F8]">
                  Amostra das vendas no recorte atual
                </h2>
                <p className="text-xs text-[#93A0B2] mt-0.5">
                  Exibindo {sortedPreviewRows.length} de {filtered.length} registros filtrados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (sortBy === 'preco') setSortDesc((v) => !v);
                    else {
                      setSortBy('preco');
                      setSortDesc(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#0B0E14] border border-white/10 rounded-md text-[#F2F4F8] hover:border-white/25 whitespace-nowrap cursor-pointer"
                >
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  Preço {sortBy === 'preco' ? (sortDesc ? '↓' : '↑') : ''}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (sortBy === 'ano') setSortDesc((v) => !v);
                    else {
                      setSortBy('ano');
                      setSortDesc(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#0B0E14] border border-white/10 rounded-md text-[#F2F4F8] hover:border-white/25 whitespace-nowrap cursor-pointer"
                >
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  Ano {sortBy === 'ano' ? (sortDesc ? '↓' : '↑') : ''}
                </button>
                <button
                  type="button"
                  onClick={onNavigateToData}
                  className="px-3 py-1.5 text-xs font-medium text-[#FF4D64] hover:text-white border border-white/10 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  Ver todos os {records.length} registros
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-[11px] font-medium text-[#93A0B2]">
                    <th className="py-2.5 pr-3">ID</th>
                    <th className="py-2.5 px-3">Modelo</th>
                    <th className="py-2.5 px-3">Cidade</th>
                    <th className="py-2.5 px-3">UF</th>
                    <th className="py-2.5 px-3 text-right">Ano</th>
                    <th className="py-2.5 px-3">Pagamento</th>
                    <th className="py-2.5 pl-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPreviewRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/[0.05] hover:bg-white/[0.02] text-xs"
                    >
                      <td className="py-2.5 pr-3 font-mono-tabular text-[#93A0B2]">{row.id}</td>
                      <td className="py-2.5 px-3 font-medium text-[#F2F4F8]">{row.modelo}</td>
                      <td className="py-2.5 px-3 text-[#D0D7E2]">{row.cidade}</td>
                      <td className="py-2.5 px-3 font-mono-tabular text-[#93A0B2]">{row.estado}</td>
                      <td className="py-2.5 px-3 font-mono-tabular text-right text-[#D0D7E2]">
                        {row.ano}
                      </td>
                      <td className="py-2.5 px-3 text-[#D0D7E2]">{row.metodoPagamento}</td>
                      <td className="py-2.5 pl-3 font-mono-tabular text-right font-medium text-[#F2F4F8]">
                        {formatMoney(row.preco, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
