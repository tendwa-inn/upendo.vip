import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, ShoppingBag, Package, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { storeService, StoreItem, StorePurchase } from '../services/storeService';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['swipes', 'themes', 'ghost_package', 'read_receipts', 'subscription', 'buttons'];
const CATEGORY_LABELS: Record<string, string> = {
  swipes: 'Swipes',
  themes: 'Themes',
  ghost_package: 'Ghost Package',
  read_receipts: 'Read Receipts',
  subscription: 'Subscriptions',
  buttons: 'Buttons',
};

const emptyForm = {
  name: '',
  description: '',
  category: 'swipes',
  price_flares: 100,
  effect: '{}' as string | Record<string, any>,
  image_url: '',
  is_active: true,
  sort_order: 0,
};

const AdminStorePage: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'items' | 'purchases'>('items');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [purchases, setPurchases] = useState<StorePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await storeService.getAllItems();
    setItems(data);
    setLoading(false);
  };

  const loadPurchases = async () => {
    setLoading(true);
    const data = await storeService.getAllPurchases();
    setPurchases(data);
    setLoading(false);
  };

  const handleTabChange = (t: 'items' | 'purchases') => {
    setTab(t);
    if (t === 'purchases' && purchases.length === 0) loadPurchases();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price_flares: item.price_flares,
      effect: item.effect,
      image_url: item.image_url || '',
      is_active: item.is_active,
      sort_order: item.sort_order,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    let effectObj: Record<string, any>;
    if (typeof form.effect === 'string') {
      try {
        effectObj = JSON.parse(form.effect);
      } catch {
        toast.error('Effect must be valid JSON');
        return;
      }
    } else {
      effectObj = form.effect;
    }

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price_flares: form.price_flares,
      effect: effectObj,
      image_url: form.image_url || null,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    if (editingItem) {
      const result = await storeService.updateItem(editingItem.id, payload);
      if (result) toast.success('Item updated');
      else toast.error('Failed to update item');
    } else {
      const result = await storeService.createItem(payload);
      if (result) toast.success('Item created');
      else toast.error('Failed to create item');
    }
    setShowModal(false);
    loadItems();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this store item?')) return;
    const ok = await storeService.deleteItem(id);
    if (ok) { toast.success('Item deleted'); loadItems(); }
    else toast.error('Failed to delete item');
  };

  const toggleActive = async (item: StoreItem) => {
    await storeService.updateItem(item.id, { is_active: !item.is_active });
    loadItems();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Upendo Store Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{items.length} items configured</p>
        </div>
        {tab === 'items' && (
          <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-medium shadow-lg shadow-orange-500/25 transition-all duration-300">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {(['items', 'purchases'] as const).map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-5 py-2 rounded-xl font-medium transition-all ${
              tab === t
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {t === 'items' ? 'Store Items' : 'Purchases'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : tab === 'items' ? (
          items.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No store items yet. Add your first item!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-white font-medium">Name</th>
                    <th className="p-4 text-white font-medium">Category</th>
                    <th className="p-4 text-white font-medium">Price</th>
                    <th className="p-4 text-white font-medium">Status</th>
                    <th className="p-4 text-white font-medium">Effect</th>
                    <th className="p-4 text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{item.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                          <Flame className="w-4 h-4" />
                          {item.price_flares}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            item.is_active
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-gray-400 text-xs font-mono max-w-[150px] truncate">
                        {JSON.stringify(item.effect)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(item)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <Pencil className="w-4 h-4 text-gray-300" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          purchases.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No purchases yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-white font-medium">User</th>
                    <th className="p-4 text-white font-medium">Item</th>
                    <th className="p-4 text-white font-medium">Cost</th>
                    <th className="p-4 text-white font-medium">Status</th>
                    <th className="p-4 text-white font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white text-sm">{(p as any).profiles?.name || p.user_id.slice(0, 8)}</td>
                      <td className="p-4 text-white text-sm">{p.store_items?.name || `Item #${p.store_item_id}`}</td>
                      <td className="p-4 text-orange-400 font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {p.flare_cost}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#2a0f15] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-white border border-orange-500/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-bold">{editingItem ? 'Edit Store Item' : 'Add Store Item'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Item Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" placeholder="e.g. 50 Extra Swipes" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white resize-none h-20" placeholder="What does this item do?" />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                        form.category === cat
                          ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Price (Flares)</label>
                <input type="number" value={form.price_flares} onChange={e => setForm(f => ({ ...f, price_flares: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" min={1} />
              </div>

              {/* Effect JSON */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Effect (JSON)</label>
                <textarea
                  value={typeof form.effect === 'string' ? form.effect : JSON.stringify(form.effect, null, 2)}
                  onChange={e => setForm(f => ({ ...f, effect: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white font-mono text-sm resize-none h-24"
                  placeholder='{"duration_days": 7}'
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.category === 'swipes' && (
                    <>
                      <button onClick={() => setForm(f => ({ ...f, effect: '{"swipe_count": 50, "duration_days": 3}' }))} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400 hover:bg-white/10">50 swipes / 3d</button>
                      <button onClick={() => setForm(f => ({ ...f, effect: '{"swipe_count": 100, "duration_days": 7}' }))} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400 hover:bg-white/10">100 swipes / 7d</button>
                      <button onClick={() => setForm(f => ({ ...f, effect: '{"unlimited": true, "duration_days": 1}' }))} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400 hover:bg-white/10">Unlimited / 24h</button>
                    </>
                  )}
                  {form.category === 'subscription' && (
                    <>
                      <button onClick={() => setForm(f => ({ ...f, effect: '{"account_type": "pro", "duration_days": 3}' }))} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400 hover:bg-white/10">Pro / 3d</button>
                      <button onClick={() => setForm(f => ({ ...f, effect: '{"account_type": "vip", "duration_days": 7}' }))} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400 hover:bg-white/10">VIP / 7d</button>
                    </>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Image URL (optional)</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" placeholder="https://..." />
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full p-2 bg-white/5 rounded-lg border border-white/10 text-white" />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Active</span>
                <button
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-600'} relative`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-medium transition-all shadow-lg shadow-orange-500/25">
                {editingItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStorePage;
