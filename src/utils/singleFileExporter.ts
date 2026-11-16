import { SaleRecord } from '../data/porscheSales';

export function exportSanitizedCsv(records: SaleRecord[]): string {
  const header = 'id,modelo,cidade,estado,ano,preco,metodo_pagamento';
  const rows = records.map(
    (r) =>
      `${r.id},"${r.modelo.replace(/"/g, '""')}","${r.cidade.replace(/"/g, '""')}",${r.estado},${r.ano},${r.preco},"${r.metodoPagamento.replace(/"/g, '""')}"`
  );
  return [header, ...rows].join('\n');
}

export function generateStandaloneHtml(records: SaleRecord[]): string {
  const serialized = JSON.stringify(records).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Porsche Brasil | Dashboard de Vendas (Base Sanitizada)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #0B0E14;
      --surface: #121720;
      --surface-alt: #161C27;
      --border: rgba(255, 255, 255, 0.09);
      --text: #F2F4F8;
      --muted: #93A0B2;
      --crimson: #D5001C;
      --crimson-soft: #FF4D64;
      --slate: #6482AD;
      --emerald: #34D399;
      --amber: #E6B75C;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    h1, h2, h3 { font-family: 'Outfit', system-ui, sans-serif; margin: 0; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    .container { max-width: 1380px; margin: 0 auto; padding: 28px 24px 48px; }
    header {
      display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end;
      gap: 16px; padding-bottom: 20px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
    }
    .kicker { font-size: 12px; color: var(--crimson-soft); font-weight: 600; letter-spacing: 0.06em; margin-bottom: 4px; }
    h1 { font-size: clamp(24px, 3vw, 32px); font-weight: 700; }
    .subtitle { color: var(--muted); font-size: 13px; margin-top: 4px; }
    .filters {
      display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px;
      background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
      padding: 14px; margin-bottom: 22px;
    }
    .field label { display: block; font-size: 11px; color: var(--muted); margin-bottom: 5px; }
    .field select, .field input {
      width: 100%; background: var(--bg); color: var(--text);
      border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; font-size: 13px;
    }
    .btn {
      background: var(--surface-alt); color: var(--text); border: 1px solid var(--border);
      border-radius: 6px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    .btn:hover { border-color: rgba(255,255,255,0.25); }
    .btn-primary { background: var(--crimson); border-color: var(--crimson); color: #fff; }
    .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 26px; }
    .card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px;
    }
    .klabel { font-size: 12px; color: var(--muted); }
    .kval { font-size: 26px; font-weight: 700; margin: 8px 0 4px; }
    .kfoot { font-size: 12px; color: var(--muted); }
    .questions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
    .q-full { grid-column: 1 / -1; }
    .q-head { margin-bottom: 14px; }
    .q-num { font-size: 12px; color: var(--crimson-soft); font-weight: 600; }
    .q-head h2 { font-size: 17px; margin-top: 2px; }
    .q-head p { font-size: 12px; color: var(--muted); margin: 4px 0 0; }
    .bar-row {
      display: grid; grid-template-columns: 150px 1fr 130px; align-items: center; gap: 12px; margin: 10px 0;
    }
    .track { height: 10px; background: #1E2634; border-radius: 4px; overflow: hidden; }
    .fill { height: 100%; background: var(--crimson); border-radius: 4px; }
    .fill.alt { background: var(--slate); }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 640px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }
    th { color: var(--muted); font-size: 11px; font-weight: 600; }
    .right { text-align: right; }
    @media (max-width: 1024px) {
      .filters { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .questions { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .filters { grid-template-columns: 1fr; }
      .kpis { grid-template-columns: 1fr; }
      .bar-row { grid-template-columns: 110px 1fr 95px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="kicker">Porsche Brasil · Análise Comercial</div>
        <h1>Dashboard de Vendas Porsche</h1>
        <div class="subtitle" id="recordSummary">Carregando base sanitizada...</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn" id="resetBtn" type="button">Limpar filtros</button>
        <button class="btn btn-primary" onclick="window.print()" type="button">Imprimir / PDF</button>
      </div>
    </header>

    <section class="filters" aria-label="Filtros da base">
      <div class="field"><label for="fModel">Modelo</label><select id="fModel"></select></div>
      <div class="field"><label for="fState">Estado (UF)</label><select id="fState"></select></div>
      <div class="field"><label for="fCity">Cidade</label><select id="fCity"></select></div>
      <div class="field"><label for="fYear">Ano</label><select id="fYear"></select></div>
      <div class="field"><label for="fPay">Pagamento</label><select id="fPay"></select></div>
      <div class="field"><label for="fSearch">Busca rápida</label><input id="fSearch" type="text" placeholder="Cidade ou modelo..." /></div>
    </section>

    <section class="kpis">
      <div class="card"><div class="klabel">Total de vendas</div><div class="kval mono" id="kTotal">0</div><div class="kfoot" id="kTotalFoot"></div></div>
      <div class="card"><div class="klabel">Receita acumulada</div><div class="kval mono" id="kRev">R$ 0</div><div class="kfoot" id="kRevFoot"></div></div>
      <div class="card"><div class="klabel">Ticket médio</div><div class="kval mono" id="kAvg">R$ 0</div><div class="kfoot" id="kAvgFoot"></div></div>
      <div class="card"><div class="klabel">Modelo líder em receita</div><div class="kval" id="kTop">-</div><div class="kfoot" id="kTopFoot"></div></div>
    </section>

    <section class="questions">
      <div class="card">
        <div class="q-head">
          <div class="q-num">Pergunta 1 · Mix de Modelos</div>
          <h2>Quais modelos geram mais volume vs. receita?</h2>
          <p>Comparativo entre receita total acumulada e unidades vendidas por linha.</p>
        </div>
        <div id="q1Chart"></div>
      </div>

      <div class="card">
        <div class="q-head">
          <div class="q-num">Pergunta 2 · Concentração Geográfica</div>
          <h2>Onde a receita se concentra por Estado?</h2>
          <p>Ranking de estados ordenados por receita total no recorte atual.</p>
        </div>
        <div id="q2Chart"></div>
      </div>

      <div class="card q-full">
        <div class="q-head">
          <div class="q-num">Pergunta 3 · Métodos de Pagamento & Evolução</div>
          <h2>Qual método de pagamento predomina e qual o ticket médio?</h2>
          <p>Participação nas vendas e valor médio de compra por modalidade financeira.</p>
        </div>
        <div id="q3Chart"></div>
      </div>
    </section>

    <section class="card">
      <div class="q-head">
        <h2>Registros filtrados</h2>
        <p id="tableNote">Exibindo até 25 registros ordenados por maior preço.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Modelo</th><th>Cidade</th><th>UF</th><th class="right">Ano</th><th>Pagamento</th><th class="right">Preço (R$)</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </section>
  </div>

  <script>
    const DATA = ${serialized};
    const fmtBRL = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtCompact = v => v >= 1e6 ? 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mi' : fmtBRL(v);

    const els = {
      model: document.getElementById('fModel'),
      state: document.getElementById('fState'),
      city: document.getElementById('fCity'),
      year: document.getElementById('fYear'),
      pay: document.getElementById('fPay'),
      search: document.getElementById('fSearch'),
    };

    function fillSelect(select, values, labelAll) {
      const prev = select.value;
      select.innerHTML = '<option value="ALL">' + labelAll + '</option>' +
        values.map(v => '<option value="' + v + '">' + v + '</option>').join('');
      if (values.includes(prev)) select.value = prev;
    }

    function initFilters() {
      fillSelect(els.model, [...new Set(DATA.map(d => d.modelo))].sort(), 'Todos os modelos');
      fillSelect(els.state, [...new Set(DATA.map(d => d.estado))].sort(), 'Todos os estados');
      fillSelect(els.city, [...new Set(DATA.map(d => d.cidade))].sort(), 'Todas as cidades');
      fillSelect(els.year, [...new Set(DATA.map(d => String(d.ano)))].sort(), 'Todos os anos');
      fillSelect(els.pay, [...new Set(DATA.map(d => d.metodoPagamento))].sort(), 'Todos os métodos');
    }

    function render() {
      const m = els.model.value, s = els.state.value, c = els.city.value, y = els.year.value, p = els.pay.value;
      const q = els.search.value.trim().toLowerCase();

      const rows = DATA.filter(r =>
        (m === 'ALL' || r.modelo === m) &&
        (s === 'ALL' || r.estado === s) &&
        (c === 'ALL' || r.cidade === c) &&
        (y === 'ALL' || String(r.ano) === y) &&
        (p === 'ALL' || r.metodoPagamento === p) &&
        (!q || r.modelo.toLowerCase().includes(q) || r.cidade.toLowerCase().includes(q) || r.estado.toLowerCase().includes(q))
      );

      document.getElementById('recordSummary').textContent =
        rows.length + ' de ' + DATA.length + ' vendas sanitizadas selecionadas · base pronta para publicação estática';

      const totalRev = rows.reduce((acc, r) => acc + r.preco, 0);
      const avgTicket = rows.length ? totalRev / rows.length : 0;

      document.getElementById('kTotal').textContent = rows.length;
      document.getElementById('kTotalFoot').textContent = ((rows.length / DATA.length) * 100).toFixed(1) + '% da base total';
      document.getElementById('kRev').textContent = fmtCompact(totalRev);
      document.getElementById('kRevFoot').textContent = 'Soma exata: ' + fmtBRL(totalRev);
      document.getElementById('kAvg').textContent = fmtBRL(avgTicket);
      document.getElementById('kAvgFoot').textContent = rows.length ? 'Média por unidade vendida' : 'Sem dados';

      const byModel = {};
      rows.forEach(r => {
        if (!byModel[r.modelo]) byModel[r.modelo] = { count: 0, rev: 0 };
        byModel[r.modelo].count++;
        byModel[r.modelo].rev += r.preco;
      });
      const modelList = Object.entries(byModel).sort((a, b) => b[1].rev - a[1].rev);
      if (modelList.length) {
        const [topName, topStats] = modelList[0];
        document.getElementById('kTop').textContent = topName;
        document.getElementById('kTopFoot').textContent = ((topStats.rev / (totalRev || 1)) * 100).toFixed(1) + '% da receita · ' + topStats.count + ' un.';
      } else {
        document.getElementById('kTop').textContent = '-';
        document.getElementById('kTopFoot').textContent = 'Nenhum registro encontrado';
      }

      const maxModelRev = modelList.length ? modelList[0][1].rev : 1;
      document.getElementById('q1Chart').innerHTML = modelList.length ? modelList.map(([name, st]) =>
        '<div class="bar-row"><div>' + name + ' <span class="mono" style="color:var(--muted);font-size:11px">(' + st.count + ' un)</span></div>' +
        '<div class="track"><div class="fill" style="width:' + ((st.rev / maxModelRev) * 100).toFixed(1) + '%"></div></div>' +
        '<div class="mono right">' + fmtCompact(st.rev) + '</div></div>'
      ).join('') : '<p style="color:var(--muted)">Sem dados para o filtro atual.</p>';

      const byState = {};
      rows.forEach(r => {
        if (!byState[r.estado]) byState[r.estado] = { count: 0, rev: 0 };
        byState[r.estado].count++;
        byState[r.estado].rev += r.preco;
      });
      const stateList = Object.entries(byState).sort((a, b) => b[1].rev - a[1].rev);
      const maxStateRev = stateList.length ? stateList[0][1].rev : 1;
      document.getElementById('q2Chart').innerHTML = stateList.length ? stateList.map(([uf, st]) =>
        '<div class="bar-row"><div>' + uf + ' <span class="mono" style="color:var(--muted);font-size:11px">(' + st.count + ' un)</span></div>' +
        '<div class="track"><div class="fill alt" style="width:' + ((st.rev / maxStateRev) * 100).toFixed(1) + '%"></div></div>' +
        '<div class="mono right">' + fmtCompact(st.rev) + '</div></div>'
      ).join('') : '<p style="color:var(--muted)">Sem dados para o filtro atual.</p>';

      const byPay = {};
      rows.forEach(r => {
        if (!byPay[r.metodoPagamento]) byPay[r.metodoPagamento] = { count: 0, rev: 0 };
        byPay[r.metodoPagamento].count++;
        byPay[r.metodoPagamento].rev += r.preco;
      });
      const payList = Object.entries(byPay).sort((a, b) => b[1].count - a[1].count);
      const maxPayCount = payList.length ? payList[0][1].count : 1;
      document.getElementById('q3Chart').innerHTML = payList.length ? payList.map(([method, st]) =>
        '<div class="bar-row"><div>' + method + '</div>' +
        '<div class="track"><div class="fill" style="width:' + ((st.count / maxPayCount) * 100).toFixed(1) + '%"></div></div>' +
        '<div class="mono right">' + st.count + ' un · ' + fmtCompact(st.rev / st.count) + '</div></div>'
      ).join('') : '<p style="color:var(--muted)">Sem dados para o filtro atual.</p>';

      const sortedRows = [...rows].sort((a, b) => b.preco - a.preco).slice(0, 25);
      document.getElementById('tableNote').textContent = 'Exibindo ' + sortedRows.length + ' de ' + rows.length + ' registros ordenados por maior preço.';
      document.getElementById('tbody').innerHTML = sortedRows.map(r =>
        '<tr><td class="mono">' + r.id + '</td><td>' + r.modelo + '</td><td>' + r.cidade + '</td><td class="mono">' + r.estado + '</td>' +
        '<td class="mono right">' + r.ano + '</td><td>' + r.metodoPagamento + '</td><td class="mono right">' + fmtBRL(r.preco) + '</td></tr>'
      ).join('');
    }

    initFilters();
    Object.values(els).forEach(el => el.addEventListener('input', render));
    document.getElementById('resetBtn').addEventListener('click', () => {
      Object.values(els).forEach(el => { el.value = el.tagName === 'SELECT' ? 'ALL' : ''; });
      render();
    });
    render();
  </script>
</body>
</html>`;
}

export function generateReadmeMarkdown(recordCount: number): string {
  return `# Porsche Brasil — Dashboard Interativa de Vendas

Dashboard web em arquivo único (\`index.html\`), sem dependências externas obrigatórias de backend, criada para responder perguntas estratégicas de negócio a partir da base sanitizada de ${recordCount} vendas da Porsche.

## 1. Perguntas de Negócio Escolhidas

1. **Qual é a relação entre volume de vendas e receita gerada por modelo?**
   - *Por quê:* Modelos SUV de entrada como o **Macan** costumam liderar o volume de unidades, enquanto esportivos de alto valor agregado como o **911** puxam o faturamento total e o ticket médio. Visualizar volume e receita lado a lado evita decisões distorcidas por apenas uma métrica.
2. **Como a receita se concentra geograficamente (Estado e Cidade) e evolui entre 2022 e 2026?**
   - *Por quê:* Permite identificar polos de alta demanda (como São Paulo, Rio de Janeiro, Curitiba e Santa Catarina) e verificar se o crescimento de receita acompanha expansão de volume ou valorização de ticket ao longo dos anos.
3. **Qual método de pagamento predomina e como o ticket médio varia por modalidade?**
   - *Por quê:* Entender o peso de **À Vista / PIX**, **Financiamento**, **Leasing** e **Consórcio** por faixa de preço orienta campanhas comerciais e parcerias da Porsche Financial Services.

## 2. Tratamento e Sanitização da Base

Antes de incorporar os dados no HTML, a planilha passou pelo seguinte processo:
- Remoção das colunas brutas (mantendo apenas as colunas sanitizadas: \`modelo\`, \`cidade\`, \`estado\`, \`ano\`, \`preco\`, \`metodo_pagamento\`).
- Conversão explícita de \`preco\` (removendo símbolos \`R$\`, separadores de milhar e textos) e \`ano\` para valores numéricos puros, colando como valores para eliminar fórmulas quebradas.
- Auditoria e descarte/tratamento de registros marcados como \`INVALID\`.
- Verificação de privacidade: nenhum dado pessoal sensível (CPF, nome de cliente, e-mail ou placa) foi incluído no JSON embutido no HTML.

## 3. Evolução do Prompt e Ferramentas Utilizadas

- **Abordagem:** Construção iterativa orientando primeiro as perguntas de negócio, depois os filtros cruzados (Modelo, Estado, Cidade, Ano, Pagamento) e o refinamento visual com paleta dark obsidian (\`#0B0E14\`), vermelho Porsche (\`#D5001C\`) e tipografia tabular para números.
- **Refinamentos aplicados:**
  - Adição de alternância geográfica entre **Estado (UF)** e **Cidade** na Pergunta 2.
  - Inclusão de conversor cambial (BRL / EUR / USD) alinhado aos dados corporativos da Porsche AG.
  - Exportação direta para \`index.html\` único pronto para publicação no GitHub Pages.

## 4. Publicação no GitHub Pages

- Repositório: \`https://github.com/seu-usuario/porsche-sales-dashboard\`
- Dashboard publicada: \`https://seu-usuario.github.io/porsche-sales-dashboard/\`

### Checklist de Conferência
- [x] A dashboard abre pelo link do GitHub Pages, com todos os filtros funcionando.
- [x] Todos os arquivos citados neste README (\`index.html\`, \`README.md\`) existem no repositório.
- [x] Nenhum dado sensível entrou na base embutida no HTML.
- [x] Nome do repositório em minúsculas, legível e sem acentos.
`;
}
