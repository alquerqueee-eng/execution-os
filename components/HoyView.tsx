import React, { useState } from 'react';

export interface ActionItem {
  id: string;
  category: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'NOT_APPLICABLE';
  isCritical: boolean;
  targetTime?: string;
}

export const HoyView: React.FC = () => {
  const [modeMinimum, setModeMinimum] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([
    { id: '1', category: 'EMPLEO', description: 'Revisar requisitos candidatura #1', status: 'COMPLETED', isCritical: true, targetTime: '08:00' },
    { id: '2', category: 'EMPLEO', description: 'Adaptar CV #1', status: 'COMPLETED', isCritical: true, targetTime: '08:30' },
    { id: '3', category: 'EMPLEO', description: 'Enviar candidatura #1', status: 'PENDING', isCritical: true, targetTime: '09:00' },
    { id: '4', category: 'MEDITACION', description: 'Meditación AM (15 mins)', status: 'COMPLETED', isCritical: false, targetTime: '06:30' },
    { id: '5', category: 'EJERCICIO', description: 'Calentamiento y Flexiones (Sesión 1)', status: 'PENDING', isCritical: false, targetTime: '17:00' },
  ]);

  const handleStatusChange = (id: string, newStatus: ActionItem['status']) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const currentNextAction = actions.find(a => a.status === 'PENDING');
  const visibleActions = modeMinimum ? actions.filter(a => a.isCritical) : actions;

  const completedCount = actions.filter(a => a.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / actions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-gray-950 text-gray-100 min-h-screen font-sans">
      <header className="border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Fase: Consolidación</span>
          <h1 className="text-2xl font-black tracking-tight text-white">DÍA 17 / 40</h1>
          <p className="text-xs text-gray-400">13 de Agosto de 2026</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-emerald-400">{progressPct}%</div>
          <div className="text-xs text-gray-400">{completedCount}/{actions.length} ACCIONES</div>
        </div>
      </header>

      <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
        <span className="text-xs font-semibold text-gray-300 uppercase">Modo Mínimo de Ejecución</span>
        <button
          onClick={() => setModeMinimum(!modeMinimum)}
          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
            modeMinimum ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {modeMinimum ? 'ACTIVO (CRÍTICAS)' : 'INACTIVO (COMPLETO)'}
        </button>
      </div>

      {currentNextAction && (
        <section className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Qué hacer ahora</span>
            {currentNextAction.targetTime && (
              <span className="text-xs font-mono text-emerald-300/70">{currentNextAction.targetTime}</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white mb-3">{currentNextAction.description}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange(currentNextAction.id, 'COMPLETED')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-xs rounded transition-all"
            >
              ✅ CUMPLIDA
            </button>
            <button
              onClick={() => handleStatusChange(currentNextAction.id, 'PARTIAL')}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 text-xs rounded transition-all"
            >
              🟡 PARCIAL
            </button>
            <button
              onClick={() => handleStatusChange(currentNextAction.id, 'FAILED')}
              className="px-3 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold py-2 text-xs rounded border border-rose-800 transition-all"
            >
              ❌ NO
            </button>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Lista Completa de Ejecución</h3>
        <div className="space-y-2">
          {visibleActions.map(action => (
            <div
              key={action.id}
              className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                action.status === 'COMPLETED' ? 'bg-gray-900/40 border-emerald-900/40 text-gray-400' :
                action.status === 'FAILED' ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' :
                'bg-gray-900 border-gray-800 text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 w-12">{action.category.substring(0, 6)}</span>
                <span className={action.status === 'COMPLETED' ? 'line-through' : 'font-medium'}>
                  {action.description}
                </span>
              </div>
              <div className="flex gap-1">
                {(['COMPLETED', 'PARTIAL', 'FAILED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(action.id, st)}
                    className={`w-7 h-7 rounded text-xs flex items-center justify-center font-bold border ${
                      action.status === st
                        ? st === 'COMPLETED' ? 'bg-emerald-600 border-emerald-500 text-white'
                          : st === 'PARTIAL' ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {st === 'COMPLETED' ? '✓' : st === 'PARTIAL' ? '~' : '✕'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HoyView;
            
