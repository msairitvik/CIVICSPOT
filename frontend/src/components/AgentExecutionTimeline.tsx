import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bot, CheckCircle, Clock } from 'lucide-react';
import { AgentLog } from '../types';

interface AgentExecutionTimelineProps {
  logs: AgentLog[];
}

export const AgentExecutionTimeline: React.FC<AgentExecutionTimelineProps> = ({ logs }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-3.5 bg-[#0B1F16] rounded-2xl border border-[#163B2E] overflow-hidden shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-bold text-[#F8FAF5] hover:bg-[#163B2E] transition"
      >
        <div className="flex items-center space-x-2">
          <Bot className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Multi-Agent Orchestration Trace ({logs.length} agents)</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-[#94B7A8]">
          <span className="font-mono text-[#FAC615]">{logs.reduce((acc, curr) => acc + curr.executionTimeMs, 0)} ms</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3.5 border-t border-[#163B2E] space-y-2.5 bg-[#0B1F16]/90 text-xs">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 pb-2.5 border-b border-[#163B2E] last:border-none last:pb-0">
              <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAF5]">{log.agentName}</span>
                  <span className="text-[10px] text-[#FAC615] font-mono flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{log.executionTimeMs} ms</span>
                  </span>
                </div>
                <div className="text-[11px] text-[#D1E7D6] mt-0.5 font-medium">{log.step}</div>
                {log.details && (
                  <div className="text-[10px] text-[#94B7A8] mt-1 font-mono bg-[#163B2E] px-2.5 py-1.5 rounded-lg border border-[#1E4D3A]">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
