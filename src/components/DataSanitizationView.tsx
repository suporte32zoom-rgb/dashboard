import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { CurrencyCode, formatMoney, SaleRecord } from '../data/porscheSales';
import { exportSanitizedCsv } from '../utils/singleFileExporter';

interface DataSanitizationViewProps {
  records: SaleRecord[];
  currency: CurrencyCode;
}

export const DataSanitizationView: React.FC<DataSanitizationViewProps> = ({
  records,
  currency,
}) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<'id' | 'modelo' | 'estado' | 'ano' | 'preco'>('id');
  const [sortAsc, setSortAsc] = useState(true);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = records.filter(
      (r) =>
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.modelo.toLowerCase().includes(q) ||
        r.cidade.toLowerCase().includes(q) ||
        r.estado.toLowerCase().includes(q) ||
        r.metodoPagamento.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv), 'pt-BR')
        : String(bv).localeCompare(String(av), 'pt-BR');
    });
  }, [records, search, sortCol, sortAsc]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc((v) => !v);
    else {
      setSortCol(col);
      setSortAsc(col !== 'preco' && col !== 'ano');
    }
  };

  const handleDownloadCsv = () => {
    const csv = exportSanitizedCsv(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'porsche-vendas-sanitizadas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Complete Sanitized Table */}
      <section className="bg-[#121720] border border-white/[0.08] rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#F2F4F8]">
              Base Sanitizada Ativa ({visibleRows.length} de {records.length} vendas)
            </h2>
            <p className="text-xs text-[#93A0B2] mt-0.5">
              Nenhum dado pessoal sensível presente · Preço e ano convertidos em tipos numéricos
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#93A0B2] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar na tabela..."
                className="bg-[#0B0E14] text-[#F2F4F8] placeholder-[#687588] border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#D5001C]"
              />
            </div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B222E] hover:bg-[#232C3B] text-[#F2F4F8] border border-white/10 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar CSV sanitizado
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead className="sticky top-0 bg-[#121720]">
              <tr className="border-b border-white/[0.08] text-left text-[11px] font-medium text-[#93A0B2]">
                <th className="py-2.5 pr-3">
                  <button
                    type="button"
                    onClick={() => handleSort('id')}
                    className="hover:text-white cursor-pointer"
                  >
                    ID {sortCol === 'id' ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th className="py-2.5 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('modelo')}
                    className="hover:text-white cursor-pointer"
                  >
                    Modelo {sortCol === 'modelo' ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th className="py-2.5 px-3">Cidade</th>
                <th className="py-2.5 px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('estado')}
                    className="hover:text-white cursor-pointer"
                  >
                    UF {sortCol === 'estado' ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('ano')}
                    className="hover:text-white cursor-pointer"
                  >
                    Ano {sortCol === 'ano' ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th className="py-2.5 px-3">Pagamento</th>
                <th className="py-2.5 pl-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('preco')}
                    className="hover:text-white cursor-pointer"
                  >
                    Preço {sortCol === 'preco' ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
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
    </div>
  );
};
