import React, { useState, useEffect } from 'react';
import { Filter, AlertTriangle, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { wordFilterService } from '../services/wordFilterService';
import toast from 'react-hot-toast';

const WordFilterManagement: React.FC = () => {
  const [filteredWords, setFilteredWords] = useState<any[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<any[]>([]);
  const [userActions, setUserActions] = useState<any[]>([]);
  const [newWord, setNewWord] = useState('');
  const [batchWords, setBatchWords] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<'warning' | 'suspension' | 'ban'>('warning');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<'warning' | 'suspension' | 'ban'>('warning');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 8;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [words, flagged, actions] = await Promise.all([
        wordFilterService.getFilteredWordsWithActions(),
        wordFilterService.getFlaggedContent(),
        wordFilterService.getUserActions()
      ]);
      setFilteredWords(words || []);
      setFlaggedUsers(flagged || []);
      setUserActions(actions || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const addWordToBatch = () => {
    if (newWord && !batchWords.includes(newWord)) { setBatchWords([...batchWords, newWord]); setNewWord(''); }
  };

  const handleBatchAdd = async () => {
    if (batchWords.length === 0) return;
    try {
      await Promise.all(batchWords.map(w => wordFilterService.addWordWithAction(w, batchAction, batchAction === 'suspension' ? suspensionDays : null)));
      toast.success('Batch added');
      setBatchWords([]); setNewWord('');
      await loadData();
    } catch { toast.error('Failed to add batch'); }
  };

  const openSetActionModal = (word: any) => {
    setSelectedWord(word);
    const action = Array.isArray(word.word_actions) ? word.word_actions[0] : word.word_actions;
    setSelectedAction(action?.action_type || 'warning');
    setSuspensionDays(action?.duration_days || 7);
    setIsModalOpen(true);
  };

  const handleSetAction = async () => {
    if (!selectedWord) return;
    try {
      await wordFilterService.setWordAction(selectedWord.id, selectedAction, selectedAction === 'suspension' ? suspensionDays : null);
      toast.success('Action set');
      await loadData();
      setIsModalOpen(false);
    } catch { toast.error('Failed to set action'); }
  };

  const handleAddWord = async () => {
    if (!newWord || filteredWords.some(w => w.word === newWord)) return;
    try {
      await wordFilterService.addWordWithAction(newWord, 'warning', null);
      await loadData(); setNewWord('');
      toast.success('Word added');
    } catch { toast.error('Failed to add word'); }
  };

  const handleRemoveWord = async (id: number) => {
    try { await wordFilterService.removeFilteredWord(id); await loadData(); toast.success('Word removed'); }
    catch { toast.error('Failed to remove word'); }
  };

  const handleUserAction = async (userId: string, actionType: 'warning' | 'suspension' | 'ban', reason?: string, flaggedWord?: string) => {
    try {
      let expiresAt: string | undefined;
      let days: number | null = null;
      if (actionType === 'suspension') {
        const d = prompt('Suspension days (e.g. 7):', '7');
        if (d) { days = parseInt(d); expiresAt = new Date(Date.now() + days * 86400000).toISOString(); }
      }
      const fullReason = actionType === 'warning' ? `Warning for using "${flaggedWord}". Such words do not uphold app integrity.` : reason;
      await wordFilterService.takeUserAction(userId, actionType, fullReason, expiresAt);
      toast.success(actionType === 'warning' ? 'Warning sent' : `User suspended ${days ? `${days} days` : 'indefinitely'}`);
      await loadData();
    } catch { toast.error(`Failed to apply ${actionType}`); }
  };

  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);
  const currentWords = filteredWords.slice((currentPage - 1) * wordsPerPage, currentPage * wordsPerPage);

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all";
  const actionBadge = (t: string) => {
    const m: Record<string, string> = { ban: 'bg-red-500/10 text-red-400 border-red-500/20', suspension: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', warning: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    return m[t] || m.warning;
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8"><div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
          <div className="h-96 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Word Filter</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage filtered words and user actions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Filtered Words */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Filter size={18} /> Filtered Words</h2>
            <button onClick={() => setIsBatchMode(!isBatchMode)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isBatchMode ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>Batch</button>
          </div>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddWord()} placeholder="Add a word..." className={`flex-1 ${inputClasses}`} />
            <button onClick={handleAddWord} className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all">Add</button>
          </div>

          {isBatchMode && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Batch Add</p>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWordToBatch()} placeholder="Add word to batch..." className={`flex-1 ${inputClasses}`} />
                <button onClick={addWordToBatch} className="px-3 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm">+</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {batchWords.map((w, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {w} <button onClick={() => setBatchWords(batchWords.filter((_, j) => j !== i))} className="hover:text-red-400"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <select value={batchAction} onChange={e => setBatchAction(e.target.value as any)} className={`${inputClasses} mb-2`}>
                <option value="warning">Warning</option>
                <option value="suspension">Suspension</option>
                <option value="ban">Ban</option>
              </select>
              <button onClick={handleBatchAdd} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium">Add Batch</button>
            </div>
          )}

          <div className="space-y-2">
            {currentWords.map(word => {
              const action = Array.isArray(word.word_actions) ? word.word_actions[0] : word.word_actions;
              return (
                <div key={word.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm text-white font-medium">{word.word}</p>
                    <p className="text-xs text-gray-500">{action ? `${action.action_type}${action.duration_days ? ` (${action.duration_days}d)` : ''}` : 'No action'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openSetActionModal(word)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Set</button>
                    <button onClick={() => handleRemoveWord(word.id)} className="px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-xs text-gray-500">{currentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>

        {/* Flagged Users */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-red-400" /> Flagged Users</h2>
          <div className="space-y-2">
            {flaggedUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No flagged users</p>
            ) : flaggedUsers.map(f => (
              <div key={f.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white font-medium">{f.user?.name || 'Unknown'}</p>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">{f.word?.word}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2 truncate">{f.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleUserAction(f.user_id, 'warning', undefined, f.word?.word)} className="px-2.5 py-1 rounded-lg text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">Warn</button>
                  <button onClick={() => handleUserAction(f.user_id, 'suspension', 'Repeated violations', f.word?.word)} className="px-2.5 py-1 rounded-lg text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">Suspend</button>
                  <button onClick={() => handleUserAction(f.user_id, 'ban', 'Severe violation', f.word?.word)} className="px-2.5 py-1 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Ban</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Shield size={18} /> User Actions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/10">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">User</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Action</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Reason</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Admin</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Expires</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {userActions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No user actions</td></tr>
              ) : userActions.map(a => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{a.user?.name || 'Unknown'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${actionBadge(a.action_type)}`}>{a.action_type}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-300 max-w-[200px] truncate">{a.reason || 'No reason'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">{a.admin?.name || 'System'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden lg:table-cell">{a.expires_at ? new Date(a.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${a.status === 'appealed' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{a.status || 'active'}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm('Lift this action?')) { wordFilterService.takeUserAction(a.user_id, 'warning', 'Action lifted', null, 'Lifted').then(() => { toast.success('Lifted'); loadData(); }); } }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Lift</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Action Modal */}
      {isModalOpen && selectedWord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Set Action for "{selectedWord.word}"</h3>
            <p className="text-sm text-gray-400 mb-5">Choose automatic action when this word is detected</p>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1.5">Action Type</label>
                <select value={selectedAction} onChange={e => setSelectedAction(e.target.value as any)} className={inputClasses}>
                  <option value="warning">Warning</option>
                  <option value="suspension">Suspension</option>
                  <option value="ban">Ban</option>
                </select>
              </div>
              {selectedAction === 'suspension' && (
                <div><label className="block text-sm text-gray-400 mb-1.5">Duration (days)</label><input type="number" value={suspensionDays} onChange={e => setSuspensionDays(parseInt(e.target.value))} min={1} className={inputClasses} /></div>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
              <button onClick={handleSetAction} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/25">Set Action</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default WordFilterManagement;
