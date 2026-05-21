import React, { useState, useEffect } from 'react';
import { reportService, UserAppeal, ReportedAccount, ReportedMessage } from '../services/reportService';
import { CheckCircle, XCircle, AlertTriangle, User, MessageSquare, Trash, Eye, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userAppeals, setUserAppeals] = useState<UserAppeal[]>([]);
  const [reportedAccounts, setReportedAccounts] = useState<ReportedAccount[]>([]);
  const [reportedMessages, setReportedMessages] = useState<ReportedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<UserAppeal | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportedAccount | null>(null);
  const [selectedMessageReport, setSelectedMessageReport] = useState<ReportedMessage | null>(null);
  const [appealNote, setAppealNote] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [messageReportNote, setMessageReportNote] = useState('');
  const [suspendDuration, setSuspendDuration] = useState(7);

  useEffect(() => { loadAllReports(); }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const [appeals, accounts, messages] = await Promise.all([
        reportService.getUserAppeals().catch(() => []),
        reportService.getReportedAccounts().catch(() => []),
        reportService.getReportedMessages().catch(() => []),
      ]);
      setUserAppeals(appeals || []);
      setReportedAccounts(accounts || []);
      setReportedMessages(messages || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleAppealDecision = async (appealId: string, approve: boolean) => {
    try {
      await reportService.processAppeal(appealId, approve, appealNote);
      toast.success(`Appeal ${approve ? 'approved' : 'denied'}`);
      setSelectedAppeal(null); setAppealNote('');
      await loadAllReports();
    } catch { toast.error('Failed to process appeal'); }
  };

  const handleReportedAccountAction = async (reportId: string, action: 'dismiss' | 'warn' | 'suspend' | 'ban') => {
    try {
      await reportService.processReportedAccount(reportId, action, action === 'suspend' ? suspendDuration : undefined, reportNote);
      toast.success(`Report ${action}ed`);
      setSelectedReport(null); setReportNote('');
      await loadAllReports();
    } catch { toast.error('Failed to process report'); }
  };

  const handleReportedMessageAction = async (reportId: string, action: 'dismiss' | 'remove' | 'warn' | 'suspend') => {
    try {
      await reportService.processReportedMessage(reportId, action, messageReportNote);
      toast.success(`Message report ${action}ed`);
      setSelectedMessageReport(null); setMessageReportNote('');
      await loadAllReports();
    } catch { toast.error('Failed to process message report'); }
  };

  const priorityBadge = (p: string) => {
    const m: Record<string, string> = { urgent: 'bg-red-500/10 text-red-400 border-red-500/20', high: 'bg-orange-500/10 text-orange-400 border-orange-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', low: 'bg-green-500/10 text-green-400 border-green-500/20' };
    return m[p] || m.medium;
  };

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', approved: 'bg-green-500/10 text-green-400 border-green-500/20', denied: 'bg-red-500/10 text-red-400 border-red-500/20', resolved: 'bg-green-500/10 text-green-400 border-green-500/20', dismissed: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    return m[s] || m.pending;
  };

  const tabs = [
    { label: 'Appeals', icon: AlertTriangle, count: userAppeals.length },
    { label: 'Reported Accounts', icon: User, count: reportedAccounts.length },
    { label: 'Reported Messages', icon: MessageSquare, count: reportedMessages.length },
  ];

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all";

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Reports & Appeals</h1>
          <p className="text-gray-400 mt-1 text-sm">Review user reports and appeals</p>
        </div>
        <button onClick={loadAllReports} disabled={loading} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm transition-colors disabled:opacity-50">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === i ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
            <tab.icon size={16} /> {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="overflow-x-auto">
          {activeTab === 0 && (
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Action</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Reason</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Appeal</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {userAppeals.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No pending appeals</td></tr> : userAppeals.map(a => (
                  <tr key={a.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-white">{a.userName || 'Unknown'}</td>
                    <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${a.actionType === 'ban' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{(a.actionType || 'unknown').toUpperCase()}</span></td>
                    <td className="px-6 py-3 text-sm text-gray-300 max-w-[200px] truncate">{a.reason || 'No reason'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 max-w-[200px] truncate">{a.appealReason || 'No appeal'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-3"><button onClick={() => setSelectedAppeal(a)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-colors"><Eye size={12} /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 1 && (
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Reported</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">By</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Reason</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Priority</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {reportedAccounts.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No reported accounts</td></tr> : reportedAccounts.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-white">{r.reportedUserName || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{r.reportedByName || 'Unknown'}</td>
                    <td className="px-6 py-3"><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{(r.reason || 'unknown').replace('_', ' ')}</span></td>
                    <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityBadge(r.priority || 'medium')}`}>{(r.priority || 'medium').toUpperCase()}</span></td>
                    <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(r.status || 'pending')}`}>{(r.status || 'pending').replace('_', ' ')}</span></td>
                    <td className="px-6 py-3"><button onClick={() => setSelectedReport(r)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-colors"><Eye size={12} /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 2 && (
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Sender</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">By</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Content</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Reason</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {reportedMessages.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No reported messages</td></tr> : reportedMessages.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-white">{r.senderName || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{r.reportedByName || 'Unknown'}</td>
                    <td className="px-6 py-3 text-sm text-gray-300 max-w-[200px] truncate">{r.content || 'No content'}</td>
                    <td className="px-6 py-3"><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{r.reason || 'unknown'}</span></td>
                    <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(r.status || 'pending')}`}>{(r.status || 'pending').replace('_', ' ')}</span></td>
                    <td className="px-6 py-3"><button onClick={() => setSelectedMessageReport(r)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-colors"><Eye size={12} /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Appeal Review Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Review Appeal</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">User</p><p className="text-white">{selectedAppeal.userName || 'Unknown'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Action Type</p><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedAppeal.actionType === 'ban' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{(selectedAppeal.actionType || 'unknown').toUpperCase()}</span></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Original Reason</p><p className="text-gray-300 text-sm">{selectedAppeal.reason || 'No reason'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Appeal Reason</p><p className="text-gray-300 text-sm">{selectedAppeal.appealReason || 'No appeal reason'}</p></div>
              <div><label className="block text-sm text-gray-400 mb-1.5">Admin Note</label><textarea value={appealNote} onChange={e => setAppealNote(e.target.value)} placeholder="Decision notes..." rows={3} className={inputClasses} /></div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button onClick={() => handleAppealDecision(selectedAppeal.id, true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors font-medium"><CheckCircle size={16} /> Approve</button>
              <button onClick={() => handleAppealDecision(selectedAppeal.id, false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-medium"><XCircle size={16} /> Deny</button>
              <button onClick={() => setSelectedAppeal(null)} className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reported Account Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Review Report</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Reported User</p><p className="text-white">{selectedReport.reportedUserName || 'Unknown'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Reported By</p><p className="text-white">{selectedReport.reportedByName || 'Unknown'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Reason</p><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{(selectedReport.reason || 'unknown').replace('_', ' ')}</span></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Description</p><p className="text-gray-300 text-sm">{selectedReport.description || 'No description'}</p></div>
              <div><label className="block text-sm text-gray-400 mb-1.5">Admin Note</label><textarea value={reportNote} onChange={e => setReportNote(e.target.value)} placeholder="Decision notes..." rows={3} className={inputClasses} /></div>
              {(selectedReport.priority === 'high' || selectedReport.priority === 'urgent') && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Suspension Duration (days)</label><input type="number" value={suspendDuration} onChange={e => setSuspendDuration(parseInt(e.target.value) || 7)} min={1} max={365} className={inputClasses} /></div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
              <button onClick={() => handleReportedAccountAction(selectedReport.id, 'dismiss')} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm transition-colors">Dismiss</button>
              <button onClick={() => handleReportedAccountAction(selectedReport.id, 'warn')} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 text-sm transition-colors"><AlertTriangle size={14} /> Warn</button>
              <button onClick={() => handleReportedAccountAction(selectedReport.id, 'suspend')} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 text-sm transition-colors"><User size={14} /> Suspend</button>
              <button onClick={() => handleReportedAccountAction(selectedReport.id, 'ban')} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-sm transition-colors"><XCircle size={14} /> Ban</button>
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm transition-colors ml-auto">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Report Review Modal */}
      {selectedMessageReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Review Message Report</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Sender</p><p className="text-white">{selectedMessageReport.senderName || 'Unknown'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Reported By</p><p className="text-white">{selectedMessageReport.reportedByName || 'Unknown'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Content</p><p className="text-gray-300 text-sm">{selectedMessageReport.content || 'No content'}</p></div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10"><p className="text-xs text-gray-500">Reason</p><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{selectedMessageReport.reason || 'unknown'}</span></div>
              <div><label className="block text-sm text-gray-400 mb-1.5">Admin Note</label><textarea value={messageReportNote} onChange={e => setMessageReportNote(e.target.value)} placeholder="Decision notes..." rows={3} className={inputClasses} /></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
              <button onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'dismiss')} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm transition-colors">Dismiss</button>
              <button onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'remove')} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-sm transition-colors"><Trash size={14} /> Remove</button>
              <button onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'warn')} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 text-sm transition-colors"><AlertTriangle size={14} /> Warn</button>
              <button onClick={() => handleReportedMessageAction(selectedMessageReport.id, 'suspend')} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 text-sm transition-colors"><User size={14} /> Suspend</button>
              <button onClick={() => setSelectedMessageReport(null)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm transition-colors ml-auto">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
