import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  Radar, 
  Landmark, 
  Sparkles, 
  Send,
  Trash2,
  Check
} from 'lucide-react';
import { PushNotificationAlert } from '../types/pharmacy';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationAlert[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateTab: (tab: string) => void;
  onSendTestPushNotification: () => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateTab,
  onSendTestPushNotification
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notif => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notif.isRead;
    if (filterType === 'critique') return notif.severity === 'critique';
    return notif.type === filterType;
  });

  const getIcon = (type: PushNotificationAlert['type']) => {
    switch (type) {
      case 'retard_paiement': return CreditCard;
      case 'alerte_budget': return ShieldAlert;
      case 'peremption': return Clock;
      case 'concurrent_prix': return Radar;
      case 'reconciliation_bancaire': return Landmark;
      default: return Bell;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Centre de Notifications Push & Alertes Critiques
              </h2>
              <p className="text-xs text-slate-300">
                Suivi des retards de paiement, alertes budgétaires et péremptions
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Filter and Actions Subheader */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterType === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Non Lues ({notifications.filter(n => !n.isRead).length})
            </button>
            <button
              onClick={() => setFilterType('critique')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterType === 'critique' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Critiques ({notifications.filter(n => n.severity === 'critique').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
            >
              Tout marquer lu
            </button>
            <button
              onClick={onSendTestPushNotification}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition"
            >
              <Send className="w-3 h-3" />
              <span>Tester Push</span>
            </button>
          </div>
        </div>

        {/* Notification Items List */}
        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune alerte pour ce filtre.
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const Icon = getIcon(notif.type);
              const isCrit = notif.severity === 'critique';

              return (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                    !notif.isRead ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isCrit ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {notif.title}
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        )}
                      </h2>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      {notif.message}
                    </p>

                    {notif.actionLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onNavigateTab(notif.actionLink!);
                        }}
                        className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        Consulter la section correspondante →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Les notifications push sont actives sur mobile et desktop pour les alertes de trésorerie et de retard.
        </div>

      </div>
    </div>
  );
};
