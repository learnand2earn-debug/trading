import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, Search, ArrowUpRight, Zap, LineChart, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { api, ScannerRow } from '../services/api.js';

export const Scanner: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  const [rows, setRows] = useState<ScannerRow[]>([]);
  const [search, setSearch] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('ALL');
  const [signalOnly, setSignalOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<keyof ScannerRow>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadScannerData();
    const interval = setInterval(loadScannerData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadScannerData = async () => {
    setLoading(true);
    try {
      const data = await api.getScanner();
      setRows(data.rows || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows
    .filter(r => {
      if (search && !r.symbol.toLowerCase().includes(search.toLowerCase())) return false;
      if (signalOnly && r.signalState !== 'ACTIVE_SIGNAL') return false;
      if (strategyFilter !== 'ALL' && !r.matchedStrategies.some(s => s.toLowerCase().includes(strategyFilter.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const handleSort = (column: keyof ScannerRow) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const activeSignalsCount = rows.filter(r => r.signalState === 'ACTIVE_SIGNAL').length;

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0c1017] border border-[#1e2638] p-3.5 rounded-xl gap-3 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="font-extrabold text-white text-base font-display flex items-center gap-2">
              LIVE MARKET MATRIX SCANNER
            </h1>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            (<strong className="text-white">{filteredRows.length}</strong> Pairs Monitored)
          </span>
          {activeSignalsCount > 0 && (
            <span className="badge-pass animate-pulse">
              {activeSignalsCount} +1% SIGNALS ACTIVE
            </span>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Coin (e.g. BTC, ETH)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#07090e] border border-[#1e2638] rounded-lg pl-8 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-sky-400 w-full md:w-48 transition"
            />
          </div>

          {/* Strategy Select */}
          <select
            value={strategyFilter}
            onChange={e => setStrategyFilter(e.target.value)}
            className="bg-[#07090e] border border-[#1e2638] rounded-lg px-2.5 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="ALL">All 7 Strategies</option>
            <option value="Price Action">1. Price Action</option>
            <option value="V1 Method">2. V1 Method</option>
            <option value="Gainers">3. Gainers Method</option>
            <option value="Hidden Bullish">4. Hidden Bullish</option>
            <option value="V1 + EMA">5. V1 + EMA</option>
            <option value="OB Method">6. OB Method</option>
            <option value="ICT">7. ICT Method</option>
          </select>

          {/* Signals Only Toggle */}
          <button
            onClick={() => setSignalOnly(!signalOnly)}
            className={`px-3 py-1.5 rounded-lg border transition font-bold text-xs flex items-center gap-1.5 ${
              signalOnly
                ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/60 shadow-md shadow-emerald-950/40'
                : 'bg-[#07090e] text-gray-400 border-[#1e2638] hover:text-white'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${signalOnly ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span>Signals Only</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadScannerData}
            className="p-1.5 rounded-lg bg-[#07090e] border border-[#1e2638] text-gray-400 hover:text-white hover:border-sky-400 transition"
            title="Refresh Scanner Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* High-Density Scanner Table */}
      <div className="bg-[#0c1017] border border-[#1e2638] rounded-xl overflow-x-auto shadow-xl shadow-black/40">
        <table className="w-full text-left font-mono term-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('symbol')} className="cursor-pointer hover:text-white">
                Coin
              </th>
              <th onClick={() => handleSort('price')} className="cursor-pointer hover:text-white">
                Price
              </th>
              <th onClick={() => handleSort('change24h')} className="cursor-pointer hover:text-white">
                24h %
              </th>
              <th>1D Trend</th>
              <th>1H Trend</th>
              <th onClick={() => handleSort('rsi30M')} className="cursor-pointer hover:text-white">
                30M RSI
              </th>
              <th onClick={() => handleSort('rsi1H')} className="cursor-pointer hover:text-white">
                1H RSI
              </th>
              <th>EMA 9</th>
              <th>EMA 33</th>
              <th>V1 State</th>
              <th>Liquidity</th>
              <th>Support</th>
              <th>Resistance</th>
              <th>OB Zones</th>
              <th>ICT</th>
              <th>Matched Strategies</th>
              <th>Signal Status</th>
              <th>Lead Advantage</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => {
              const hasSignal = row.signalState === 'ACTIVE_SIGNAL';
              return (
                <tr
                  key={row.symbol}
                  className={`cursor-pointer transition-colors ${
                    hasSignal ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-[#141c2c]'
                  }`}
                >
                  <td
                    onClick={() => navigate(`coin/${row.symbol}`)}
                    className="font-extrabold text-white text-sm flex items-center gap-2 font-display"
                  >
                    <span>{row.symbol}</span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-gray-100 font-semibold tabular-nums">
                    ${row.price > 10 ? row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.price.toFixed(4)}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="tabular-nums">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block ${
                      row.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {row.change24h >= 0 ? '+' : ''}{row.change24h.toFixed(2)}%
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className={`text-[11px] font-bold ${row.trend1D === 'UPTREND' ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {row.trend1D}
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className={`text-[11px] font-bold ${row.trend1H === 'UPTREND' ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {row.trend1H}
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-gray-300 tabular-nums">
                    {row.rsi30M.toFixed(1)}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="tabular-nums">
                    <span className={`font-semibold ${row.rsi1H >= 25 && row.rsi1H <= 40 ? 'text-emerald-400 font-extrabold' : 'text-gray-300'}`}>
                      {row.rsi1H.toFixed(1)}
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-sky-400 text-[11px] tabular-nums font-semibold">
                    {row.ema9}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-amber-400 text-[11px] tabular-nums font-semibold">
                    {row.ema33}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      row.v1State === 'GREEN'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : row.v1State === 'TRANSPARENT'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {row.v1State}
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className="text-[10px] text-gray-400">
                      {row.liquidityStatus} ({row.liquidityDistancePct}%)
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-emerald-400 text-[11px] tabular-nums font-semibold">
                    ${row.support.toFixed(2)}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-rose-400 text-[11px] tabular-nums font-semibold">
                    ${row.resistance.toFixed(2)}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className="text-gray-300 text-xs">{row.orderBlocksCount} Zones</span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className={`text-[10px] font-bold ${row.ictEligible ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {row.ictEligible ? 'ELIGIBLE' : 'NO'}
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    {row.matchedStrategies.length > 0 ? (
                      <span className="badge-pass">{row.matchedStrategies.join(', ')}</span>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Scanning...</span>
                    )}
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)}>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold tracking-wider ${
                      hasSignal ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 animate-pulse' : 'text-gray-500'
                    }`}>
                      {hasSignal ? '+1% SIGNAL' : 'IDLE'}
                    </span>
                  </td>

                  <td onClick={() => navigate(`coin/${row.symbol}`)} className="text-sky-400 font-semibold text-[11px]">
                    {row.leadTimeSeconds > 0 ? `${row.leadTimeSeconds}s Earlier` : 'Realtime'}
                  </td>

                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`coin/${row.symbol}`);
                      }}
                      className="px-2.5 py-1 rounded bg-[#141c2c] hover:bg-sky-600/30 text-sky-400 border border-[#222c40] hover:border-sky-500/50 text-[10px] font-bold transition inline-flex items-center gap-1"
                    >
                      <span>Chart</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
