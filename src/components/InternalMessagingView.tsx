import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Pin, 
  CheckCheck, 
  Users, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Tag,
  Paperclip
} from 'lucide-react';
import { InternalMessage } from '../types/pharmacyPilotPrecision';
import { MOCK_INTERNAL_MESSAGES } from '../data/mockPrecisionModules';

export const InternalMessagingView: React.FC = () => {
  const [messages, setMessages] = useState<InternalMessage[]>(MOCK_INTERNAL_MESSAGES);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<InternalMessage['category']>('consigne_comptoir');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newMsg: InternalMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'Dr N\'Fafode Camara',
      senderRole: 'Titulaire / Pharmacien',
      avatarColor: 'bg-emerald-600',
      timestamp: 'À l\'instant',
      content: newText,
      category: newCategory,
      isPinned: false,
      acknowledgedBy: ['Dr N\'Fafode Camara']
    };

    setMessages(prev => [newMsg, ...prev]);
    setNewText('');
  };

  const handleAcknowledge = (id: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === id && !m.acknowledgedBy.includes('Vous')) {
        return { ...m, acknowledgedBy: [...m.acknowledgedBy, 'Vous'] };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Communication d'Équipe • Transmission & Relève Officinale</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Messagerie Interne & Consignes de Comptoir
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tableau de transmission en temps réel entre pharmaciens et préparateurs : réservations de traitements d'exception, consignes de dispensation et passation d'équipe.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700/80">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">7 collaborateurs connectés</span>
          </div>
        </div>
      </div>

      {/* Main Message Box + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input Form (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Poster une Consigne d'Équipe</h3>
          
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Catégorie</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="consigne_comptoir">📌 Consigne Comptoir / Délivrance</option>
                <option value="vigilance_patient">⚠️ Vigilance Patient Spécifique</option>
                <option value="releve_equipe">🔄 Relève & Passation d'Équipe</option>
                <option value="stock_urgent">📦 Stock & Réception Urgente</option>
                <option value="general">💬 Général Officine</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Rédiger une consigne claire pour l'équipe..."
                value={newText}
                onChange={e => setNewText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Diffuser à l'Équipe</span>
            </button>
          </form>
        </div>

        {/* Right: Message Stream (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`rounded-2xl p-5 border transition-all ${
                msg.isPinned 
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${msg.avatarColor} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                    {msg.senderName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{msg.senderName}</span>
                      {msg.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          Épinglé
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{msg.senderRole} • {msg.timestamp}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleAcknowledge(msg.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 text-slate-600 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  <span>Lu ({msg.acknowledgedBy.length})</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-3 leading-relaxed">
                {msg.content}
              </p>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>Vu par :</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{msg.acknowledgedBy.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
