import { useState } from 'react';
import { BarChart3, Building2, Database, Menu, X } from 'lucide-react';
import { CurrencyCode, INITIAL_SALES_DATA } from './data/porscheSales';
import { SalesAnalyticsView } from './components/SalesAnalyticsView';
import { DataSanitizationView } from './components/DataSanitizationView';
import { CorporateIntelView } from './components/CorporateIntelView';
import { PorscheHeaderBanner } from './components/PorscheHeaderBanner';

type ActiveSection = 'analytics' | 'data' | 'corporate';

const SECTION_META: Record<ActiveSection, { title: string; subtitle: string }> = {
  analytics: {
    title: 'Análise de Vendas & Perguntas de Negócio',
    subtitle: 'Recorte interativo por modelo, estado, cidade, ano e método de pagamento',
  },
  data: {
    title: 'Base Sanitizada',
    subtitle: 'Registros válidos, conversão numérica e exportação em CSV',
  },
  corporate: {
    title: 'Inteligência Corporativa Porsche AG',
    subtitle: 'Demonstrações IFRS 2024–2025, entregas 9M 2026, presença global e estrutura P911',
  },
};

export function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('analytics');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const records = INITIAL_SALES_DATA;

  const navItems: { id: ActiveSection; label: string; icon: typeof BarChart3 }[] = [
    { id: 'analytics', label: 'Análise de Vendas', icon: BarChart3 },
    { id: 'data', label: 'Base & Sanitização', icon: Database },
    { id: 'corporate', label: 'Corporativo AG', icon: Building2 },
  ];

  const meta = SECTION_META[activeSection];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F2F4F8] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 lg:shrink-0 bg-[#0D1118] border-b lg:border-b-0 lg:border-r border-white/[0.08] lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between">
        <div className="p-4 lg:p-5">
          <div className="flex items-center justify-between lg:pb-5 lg:border-b lg:border-white/[0.08]">
            <div className="font-display text-lg font-bold tracking-[0.16em] text-[#F2F4F8] whitespace-nowrap">
              PORSCHE
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Alternar menu"
              className="lg:hidden p-2 rounded-md text-[#93A0B2] hover:text-white hover:bg-white/5 cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav
            aria-label="Navegação principal"
            className={`${
              mobileNavOpen ? 'flex' : 'hidden'
            } lg:flex flex-col gap-1 mt-4`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#18202C] text-white font-medium'
                      : 'text-[#93A0B2] hover:text-[#F2F4F8] hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#FF4D64]' : 'text-[#7B889B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-white/[0.08] text-xs text-[#7B889B] space-y-1">
          <div className="font-mono-tabular text-[#D0D7E2]">
            {records.length} registros ativos
          </div>
          <div>Base sanitizada</div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <PorscheHeaderBanner
            sectionLabel={navItems.find((n) => n.id === activeSection)?.label ?? ''}
            title={meta.title}
            subtitle={meta.subtitle}
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          {/* Active Workspace View */}
          <main>
            {activeSection === 'analytics' && (
              <SalesAnalyticsView
                records={records}
                currency={currency}
                onNavigateToData={() => setActiveSection('data')}
              />
            )}
            {activeSection === 'data' && (
              <DataSanitizationView records={records} currency={currency} />
            )}
            {activeSection === 'corporate' && <CorporateIntelView currency={currency} />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
