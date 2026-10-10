import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface KillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isHalted: boolean;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({ isOpen, onClose, onConfirm, isHalted }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#151922] border border-red-500/50 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-500 mb-4">
          <ShieldAlert className="w-8 h-8" />
          <h2 className="text-xl font-bold tracking-wide">
            {isHalted ? 'CLEAR EMERGENCY HALT?' : 'EMERGENCY: KILL ALL TRADING'}
          </h2>
        </div>

        <div className="bg-red-950/40 border border-red-800/60 p-4 rounded text-sm text-red-200 mb-6 leading-relaxed">
          {isHalted ? (
            <p>
              Trading is currently <strong>HALTED</strong>. Confirming will reset the emergency lock and restore normal monitoring and execution rules.
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              <li>Immediately stops all incoming signal generation</li>
              <li>Cancels all eligible active orders</li>
              <li>Halts live execution pipelines immediately</li>
              <li>Keeps telemetry and market data surveillance running</li>
              <li>Requires explicit administrator reset</li>
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 font-bold rounded text-sm transition flex items-center gap-2 ${
              isHalted
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {isHalted ? 'Confirm Reset Halt' : 'CONFIRM KILL ALL TRADING'}
          </button>
        </div>
      </div>
    </div>
  );
};
