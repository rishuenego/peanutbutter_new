import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils';
import { adminFetch } from '../../utils/adminApi';

interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    maxDiscountAmount: '1000',
    minOrderAmount: '0',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await adminFetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        const couponsList = Array.isArray(data) ? data : (data.coupons || []);
        setCoupons(couponsList);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      ...formData,
      discountPercentage: parseFloat(formData.discountPercentage),
      maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
      minOrderAmount: parseFloat(formData.minOrderAmount),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : 9999,
      validFrom: formData.validFrom || new Date().toISOString().split('T')[0],
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    try {
      const endpoint = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : `/api/admin/coupons`;
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(couponData),
      });

      if (response.ok) {
        fetchCoupons();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save coupon:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await adminFetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const response = await adminFetch(`/api/admin/coupons/${coupon.id}/toggle`, {
        method: 'PATCH',
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Failed to toggle coupon:', error);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage.toString(),
      maxDiscountAmount: (coupon.maxDiscountAmount || 1000).toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      usageLimit: coupon.usageLimit?.toString() || '',
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountPercentage: '',
      maxDiscountAmount: '1000',
      minOrderAmount: '0',
      usageLimit: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Coupons Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Limits</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Validity</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-[#CE6A24] bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">{coupon.code}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{coupon.discountPercentage}% OFF</div>
                  <div className="text-[10px] text-gray-400">Up to Rs. {coupon.maxDiscountAmount}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-600">Min Order: Rs. {coupon.minOrderAmount}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-600">{coupon.usedCount} / {coupon.usageLimit || '∞'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[10px] text-gray-400">Till {formatDate(coupon.validUntil)}</div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-gray-400">
                    <button onClick={() => openEditModal(coupon)} className="p-2 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(coupon.id)} className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Coupon Code</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Disc. %</label>
                  <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} required min="1" max="100" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Max Disc (Rs.)</label>
                  <input type="number" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })} required className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Min Order (Rs.)</label>
                  <input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Usage Limit</label>
                  <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Expiration Date</label>
                  <input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-orange-500" />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Active and Redemable</label>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all active:scale-95">
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
