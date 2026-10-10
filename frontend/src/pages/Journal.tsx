import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, ChevronDown, ChevronUp, FileText, Search } from 'lucide-react';
import { api } from '../services/api.js';

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    try {
      const res = await api.getJournal();
      setEntries(res.journal || []);
    } catch (e) {
      // ignore
    }
  };

  const filtered = entries.filter(e => {
    if (search && !e.symbol.toLowerCase().includes(search.toLowerCase()) && !e.strategy_code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#151a24] border border-[#232b3e] p-3 rounded-lg">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            IMMUTABLE TRADE JOURNAL & AUDIT ARCHIVE
          </h1>
          <p className="text-[11px] text-gray-500">Every executed trade retains exact strategy version, indicator snapshots & reasoning</p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search coin or strategy..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#0e121a] border border-[#252f44] rounded pl-8 pr-3 py-1 text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#151a24] border border-[#232b3e] p-8 text-center text-gray-500">
          No historical trade records in journal yet. Executed trades are permanently logged here.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-[#151a24] border border-[#232b3e] rounded-lg overflow-hidden">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-[#1a2335] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{entry.symbol}</span>
                    <span className="bg-[#1b2333] text-blue-400 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-500/30">
                      {entry.strategy_code}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">{entry.strategy_version}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-[#0e121a] border-t border-[#232b3e] space-y-3">
                    <div className="font-bold text-emerald-400 text-[11px]">IMMUTABLE EXECUTION SNAPSHOT:</div>
                    <pre className="p-3 bg-[#141a26] border border-[#20293d] rounded text-[11px] text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {entry.explanation}
                    </pre>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] pt-2">
                      <div className="p-2 bg-[#141a26] border border-[#20293d] rounded">
                        <span className="text-gray-500 text-[10px]">Source Rules:</span>
                        <div className="text-gray-300 mt-0.5">{JSON.stringify(entry.source_rules_snapshot)}</div>
                      </div>
                      <div className="p-2 bg-[#141a26] border border-[#20293d] rounded">
                        <span className="text-gray-500 text-[10px]">Indicator Values:</span>
                        <div className="text-gray-300 mt-0.5">{JSON.stringify(entry.indicator_values_snapshot)}</div>
                      </div>
                      <div className="p-2 bg-[#141a26] border border-[#20293d] rounded">
                        <span className="text-gray-500 text-[10px]">Agent Decisions:</span>
                        <div className="text-gray-300 mt-0.5">{JSON.stringify(entry.agent_decisions)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
