import React, { useState } from 'react';
import {
  CORPORATE_DELIVERIES_BY_MODEL,
  CORPORATE_ENTITIES,
  CORPORATE_OVERVIEW,
  CORPORATE_PLANTS,
  CORPORATE_SALES_BY_MODEL,
  ESG_PILLARS,
  INCOME_STATEMENT_IFRS,
  REGIONAL_DELIVERIES,
} from '../data/corporateData';
import { CurrencyCode } from '../data/porscheSales';

interface CorporateIntelViewProps {
  currency: CurrencyCode;
}

type CorpTab = 'overview' | 'finance' | 'sales' | 'global' | 'structure';

const EUR_RATES: Record<CurrencyCode, { rate: number; symbol: string }> = {
  EUR: { rate: 1, symbol: '€' },
  BRL: { rate: 6.2838, symbol: 'R$' },
  USD: { rate: 1.1014, symbol: 'US$' },
};

function formatEurMillions(eurM: number, currency: CurrencyCode): string {
  const { rate, symbol } = EUR_RATES[currency];
  const val = eurM * rate;
  return `${symbol} ${val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} mi`;
}

export const CorporateIntelView: React.FC<CorporateIntelViewProps> = ({ currency }) => {
  const [tab, setTab] = useState<CorpTab>('overview');

  const tabs: { id: CorpTab; label: string }[] = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'finance', label: 'Financeiro IFRS' },
    { id: 'sales', label: 'Vendas & entregas' },
    { id: 'global', label: 'Presença global' },
    { id: 'structure', label: 'Estrutura, ações & ESG' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="text-xs text-[#93A0B2]">
          Dr. Ing. h.c. F. Porsche AG <span aria-hidden="true">·</span> Referência{' '}
          <span className="font-mono-tabular text-[#F2F4F8]">
            {CORPORATE_OVERVIEW.referenceDate}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 bg-[#121720] border border-white/[0.08] rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === t.id
                  ? 'bg-[#D5001C] text-white font-medium'
                  : 'text-[#93A0B2] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {CORPORATE_OVERVIEW.kpis2025.map((k) => (
              <div
                key={k.label}
                className="bg-[#121720] border border-white/[0.08] rounded-xl p-5"
              >
                <div className="text-xs text-[#93A0B2]">{k.label}</div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2 mb-1">
                  {k.eurMillions !== undefined
                    ? formatEurMillions(k.eurMillions, currency)
                    : k.units?.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-[#93A0B2] font-mono-tabular">{k.foot}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <section className="lg:col-span-7 bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#F2F4F8]">
                  Receita e lucro líquido consolidados
                </h2>
                <p className="text-xs text-[#93A0B2] mt-0.5">
                  Exercícios anuais 2024 vs. 2025 · escalas visuais independentes
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 items-end h-48 border-b border-white/[0.08] px-4 pb-3">
                {CORPORATE_OVERVIEW.annualComparison.map((row) => {
                  const revH = Math.round((row.revenueEurM / 40083) * 145);
                  const profitH = Math.max(Math.round((row.netProfitEurM / 3595) * 145), 6);
                  return (
                    <div key={row.year} className="flex flex-col items-center justify-end h-full">
                      <div className="flex items-end gap-3 h-full">
                        <div
                          className="w-10 bg-[#D5001C] rounded-t-sm"
                          style={{ height: `${revH}px` }}
                          title={`Receita ${row.year}`}
                        />
                        <div
                          className="w-10 bg-[#6482AD] rounded-t-sm"
                          style={{ height: `${profitH}px` }}
                          title={`Lucro ${row.year}`}
                        />
                      </div>
                      <div className="text-xs font-mono-tabular text-[#93A0B2] mt-2">
                        {row.year} · {row.revenueEurM.toLocaleString('pt-BR')} /{' '}
                        {row.netProfitEurM.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-5 text-xs text-[#93A0B2] mt-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#D5001C]" />
                  Receita líquida
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#6482AD]" />
                  Lucro após impostos
                </span>
              </div>
            </section>

            <section className="lg:col-span-5 bg-[#121720] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#F2F4F8]">Acumulado 9M 2026</h2>
                <p className="text-xs text-[#93A0B2] mt-0.5">
                  {CORPORATE_OVERVIEW.nineMonths2026.cutoff}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="text-xs text-[#93A0B2]">Receita consolidada</div>
                    <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8]">
                      {formatEurMillions(CORPORATE_OVERVIEW.nineMonths2026.revenueEurM, currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#93A0B2]">Resultado operacional</div>
                    <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8]">
                      {formatEurMillions(
                        CORPORATE_OVERVIEW.nineMonths2026.operatingResultEurM,
                        currency
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#93A0B2]">Fluxo de caixa líquido automotivo</div>
                    <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8]">
                      {formatEurMillions(
                        CORPORATE_OVERVIEW.nineMonths2026.autoNetCashFlowEurM,
                        currency
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-[#93A0B2] pt-4 border-t border-white/[0.08] mt-4">
                {CORPORATE_OVERVIEW.nineMonths2026.foot}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CORPORATE_OVERVIEW.operationalIndicators.map((ind) => (
              <div
                key={ind.label}
                className="bg-[#121720] border border-white/[0.08] rounded-xl p-5"
              >
                <div className="text-xs text-[#93A0B2]">{ind.label}</div>
                <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2 mb-1">
                  {ind.value}
                </div>
                <div
                  className={`text-xs font-mono-tabular ${
                    ind.negative ? 'text-[#FF4D64]' : 'text-[#93A0B2]'
                  }`}
                >
                  {ind.foot}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#151A24] border border-white/[0.08] rounded-xl p-4 text-xs text-[#D0D7E2]">
            Nota metodológica: Vendas consolidadas, entregas a clientes e produção são métricas
            distintas da Porsche AG e permanecem em séries separadas.
          </div>
        </div>
      )}

      {tab === 'finance' && (
        <div className="space-y-6">
          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#F2F4F8]">
              Demonstração de resultados consolidada (IFRS)
            </h2>
            <p className="text-xs text-[#93A0B2] mt-0.5 mb-4">
              Valores originais em milhões de euros (€ mi)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-[11px] text-[#93A0B2]">
                    <th className="py-2.5 pr-3">Indicador</th>
                    <th className="py-2.5 px-3 text-right">2025 (€ mi)</th>
                    <th className="py-2.5 px-3 text-right">2024 (€ mi)</th>
                    <th className="py-2.5 pl-3 text-right">Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {INCOME_STATEMENT_IFRS.map((row) => (
                    <tr
                      key={row.item}
                      className="border-b border-white/[0.05] hover:bg-white/[0.02] text-xs"
                    >
                      <td className="py-2.5 pr-3 font-medium text-[#F2F4F8]">{row.item}</td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular text-[#D0D7E2]">
                        {row.y2025.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular text-[#D0D7E2]">
                        {row.y2024.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono-tabular text-[#93A0B2]">
                        {row.variation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="text-xs text-[#93A0B2]">1 EUR em BRL (BCE / Banca d&apos;Italia)</div>
              <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2">
                R$ 6,2838
              </div>
            </div>
            <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="text-xs text-[#93A0B2]">1 EUR em USD (BCE / Banca d&apos;Italia)</div>
              <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2">
                US$ 1,1014
              </div>
            </div>
            <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="text-xs text-[#93A0B2]">Data da referência cambial</div>
              <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2">
                16/11/2026
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#F2F4F8]">
              Vendas consolidadas por modelo · 2025 vs. 2024
            </h2>
            <p className="text-xs text-[#93A0B2] mt-0.5 mb-4">Unidades vendidas no atacado</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-[11px] text-[#93A0B2]">
                  <th className="py-2">Modelo</th>
                  <th className="py-2 text-right">2025</th>
                  <th className="py-2 text-right">2024</th>
                  <th className="py-2 text-right">Variação</th>
                </tr>
              </thead>
              <tbody>
                {CORPORATE_SALES_BY_MODEL.map((row) => (
                  <tr key={row.model} className="border-b border-white/[0.05] text-xs">
                    <td className="py-2.5 font-medium text-[#F2F4F8]">{row.model}</td>
                    <td className="py-2.5 text-right font-mono-tabular text-[#D0D7E2]">
                      {row.y2025.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 text-right font-mono-tabular text-[#D0D7E2]">
                      {row.y2024.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 text-right font-mono-tabular text-[#93A0B2]">
                      {row.variation}
                    </td>
                  </tr>
                ))}
                <tr className="text-xs font-semibold text-[#F2F4F8]">
                  <td className="pt-3">Total consolidado</td>
                  <td className="pt-3 text-right font-mono-tabular">265.663</td>
                  <td className="pt-3 text-right font-mono-tabular">312.620</td>
                  <td className="pt-3 text-right font-mono-tabular text-[#FF4D64]">−15,0%</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#F2F4F8]">
              Entregas a clientes por modelo · 2024, 2025 e 9M 2026
            </h2>
            <p className="text-xs text-[#93A0B2] mt-0.5 mb-4">Unidades entregues ao consumidor</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-[11px] text-[#93A0B2]">
                  <th className="py-2">Modelo</th>
                  <th className="py-2 text-right">9M 2026</th>
                  <th className="py-2 text-right">2025</th>
                  <th className="py-2 text-right">2024</th>
                </tr>
              </thead>
              <tbody>
                {CORPORATE_DELIVERIES_BY_MODEL.map((row) => (
                  <tr key={row.model} className="border-b border-white/[0.05] text-xs">
                    <td className="py-2.5 font-medium text-[#F2F4F8]">{row.model}</td>
                    <td className="py-2.5 text-right font-mono-tabular text-[#F2F4F8]">
                      {row.y9m2026.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 text-right font-mono-tabular text-[#D0D7E2]">
                      {row.y2025.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 text-right font-mono-tabular text-[#D0D7E2]">
                      {row.y2024.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                <tr className="text-xs font-semibold text-[#F2F4F8]">
                  <td className="pt-3">Total de entregas</td>
                  <td className="pt-3 text-right font-mono-tabular">178.532</td>
                  <td className="pt-3 text-right font-mono-tabular">279.449</td>
                  <td className="pt-3 text-right font-mono-tabular">310.718</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      )}

      {tab === 'global' && (
        <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#F2F4F8]">
              Participação das entregas por região (2025) & volume 9M 2026
            </h2>
            <p className="text-xs text-[#93A0B2] mt-0.5">
              Percentuais e unidades publicadas pela Porsche AG
            </p>
          </div>

          <div className="space-y-4">
            {REGIONAL_DELIVERIES.map((r) => (
              <div
                key={r.region}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr_140px] items-center gap-3 text-xs"
              >
                <span className="text-[#F2F4F8] font-medium">{r.region}</span>
                <div className="h-2.5 bg-[#1B222E] rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[#D5001C] rounded-sm"
                    style={{ width: `${(r.share2025 / 35) * 100}%` }}
                  />
                </div>
                <div className="font-mono-tabular text-right text-[#D0D7E2]">
                  {r.share2025.toFixed(1)}% · {r.units9m2026.toLocaleString('pt-BR')} un.
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'structure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="text-xs text-[#93A0B2]">Ticker preferencial</div>
              <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2">
                P911
              </div>
              <div className="text-xs text-[#93A0B2] mt-1">Bolsa de Frankfurt</div>
            </div>
            <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="text-xs text-[#93A0B2]">Capital subscrito</div>
              <div className="font-mono-tabular text-2xl font-semibold text-[#F2F4F8] mt-2">
                € 911 mi
              </div>
              <div className="text-xs text-[#93A0B2] mt-1">
                455,5 mi ordinárias + 455,5 mi preferenciais
              </div>
            </div>
            <div className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
              <div className="text-xs text-[#93A0B2]">Relações com investidores</div>
              <div className="text-sm font-medium text-[#F2F4F8] mt-2">
                <a
                  href="https://investorrelations.porsche.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9FC4FF] hover:underline"
                >
                  investorrelations.porsche.com
                </a>
              </div>
              <div className="text-xs text-[#93A0B2] mt-1">
                Cotação ao vivo omitida por ausência de feed verificado
              </div>
            </div>
          </div>

          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#F2F4F8] mb-3">
              Fábricas e centros de engenharia
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-[11px] text-[#93A0B2]">
                    <th className="py-2 pr-3">Unidade</th>
                    <th className="py-2 px-3">País</th>
                    <th className="py-2 pl-3">Atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {CORPORATE_PLANTS.map((p) => (
                    <tr key={p.unit} className="border-b border-white/[0.05] text-xs">
                      <td className="py-2.5 pr-3 font-medium text-[#F2F4F8]">{p.unit}</td>
                      <td className="py-2.5 px-3 text-[#D0D7E2]">{p.country}</td>
                      <td className="py-2.5 pl-3 text-[#93A0B2]">{p.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#F2F4F8] mb-3">Ecossistema corporativo</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-[11px] text-[#93A0B2]">
                    <th className="py-2 pr-3">Entidade</th>
                    <th className="py-2 px-3">Atividade</th>
                    <th className="py-2 pl-3">Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  {CORPORATE_ENTITIES.map((e) => (
                    <tr key={e.entity} className="border-b border-white/[0.05] text-xs">
                      <td className="py-2.5 pr-3 font-medium text-[#F2F4F8]">{e.entity}</td>
                      <td className="py-2.5 px-3 text-[#D0D7E2]">{e.activity}</td>
                      <td className="py-2.5 pl-3 text-[#93A0B2]">{e.classification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#F2F4F8] mb-3">
              Pilares de Tecnologia & ESG
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ESG_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-4 rounded-lg bg-[#0B0E14]/60 border border-white/[0.07]"
                >
                  <div className="text-sm font-medium text-[#F2F4F8]">{pillar.title}</div>
                  <div className="text-xs text-[#93A0B2] mt-1">{pillar.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
