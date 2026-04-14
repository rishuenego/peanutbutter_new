import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { formatPrice } from '../../utils';
import { adminFetch } from '../../utils/adminApi';
import type { Product } from '../../types';

interface WeightOption {
  size: string;
  mrp: number;
  salePrice: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    textures: 'Smooth,Crunchy',
    inStock: true,
    weightOptions: [
      { size: '350g', mrp: 499, salePrice: 349 },
      { size: '500g', mrp: 699, salePrice: 549 },
      { size: '1kg', mrp: 1299, salePrice: 999 }
    ] as WeightOption[]
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await adminFetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        const productsList = Array.isArray(data) ? data : (data.products || []);
        // Normalize weightOptions if they come as strings from old data
        const normalizedProducts = productsList.map((p: any) => ({
          ...p,
          weightOptions: Array.isArray(p.weightOptions) 
            ? p.weightOptions.map((opt: any) => typeof opt === 'string' ? { size: opt, mrp: p.mrpPrice || 0, salePrice: p.salePrice || 0 } : opt)
            : []
        }));
        setProducts(normalizedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleAddWeight = () => {
    setFormData({
      ...formData,
      weightOptions: [...formData.weightOptions, { size: '', mrp: 0, salePrice: 0 }]
    });
  };

  const handleRemoveWeight = (index: number) => {
    setFormData({
      ...formData,
      weightOptions: formData.weightOptions.filter((_, i) => i !== index)
    });
  };

  const handleWeightChange = (index: number, field: keyof WeightOption, value: string | number) => {
    const newOptions = [...formData.weightOptions];
    newOptions[index] = { ...newOptions[index], [field]: field === 'size' ? value : Number(value) };
    setFormData({ ...formData, weightOptions: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the first size's price as primary mrp/price for simpler sorting/display
    const primaryMrp = formData.weightOptions[0]?.mrp || 0;
    const primaryPrice = formData.weightOptions[0]?.salePrice || 0;

    const productData = {
      ...formData,
      mrpPrice: primaryMrp,
      salePrice: primaryPrice,
      slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      textures: formData.textures.split(',').map((t) => t.trim()),
      weightOptions: formData.weightOptions,
      // We don't send images anymore as per request
    };

    try {
      const endpoint = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : `/api/admin/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (response.ok) fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      textures: Array.isArray(product.texture) ? (product.texture as any).join(',') : (product.texture || 'Smooth,Crunchy'),
      inStock: product.stockStatus === 'in_stock',
      weightOptions: Array.isArray(product.weightOptions) ? product.weightOptions : []
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      textures: 'Smooth,Crunchy',
      inStock: true,
      weightOptions: [
        { size: '350g', mrp: 499, salePrice: 349 },
        { size: '500g', mrp: 699, salePrice: 549 },
        { size: '1kg', mrp: 1299, salePrice: 999 }
      ]
    });
  };

  const filteredProducts = products.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Default Price</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sizes</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{(p.stockStatus || 'in_stock').replace('_', ' ')}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{formatPrice(p.salePrice)}</div>
                  <div className="text-[10px] text-gray-400 line-through">{formatPrice(p.mrpPrice)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {p.weightOptions.map((opt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-bold">
                        {opt.size}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Textures (comma separated)</label>
                    <input type="text" value={formData.textures} onChange={(e) => setFormData({ ...formData, textures: e.target.value })} className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
              </div>

              {/* Weight and Price Management */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Sizes & Pricing</h3>
                  <button type="button" onClick={handleAddWeight} className="text-orange-500 text-xs font-bold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Size</button>
                </div>
                <div className="space-y-3">
                  {formData.weightOptions.map((opt, index) => (
                    <div key={index} className="flex gap-3 items-end bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Size (e.g. 500g)</label>
                        <input type="text" value={opt.size} onChange={(e) => handleWeightChange(index, 'size', e.target.value)} required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">MRP</label>
                        <input type="number" value={opt.mrp} onChange={(e) => handleWeightChange(index, 'mrp', e.target.value)} required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sale Price</label>
                        <input type="number" value={opt.salePrice} onChange={(e) => handleWeightChange(index, 'salePrice', e.target.value)} required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-orange-600" />
                      </div>
                      {formData.weightOptions.length > 1 && (
                        <button type="button" onClick={() => handleRemoveWeight(index)} className="p-2 text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input type="checkbox" id="inStock" checked={formData.inStock} onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-orange-500" />
                <label htmlFor="inStock" className="text-sm font-bold text-gray-700">Available in Stock</label>
              </div>

              <div className="flex justify-end gap-3 pt-8 pb-4">
                <button type="button" onClick={closeModal} className="px-8 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-orange-500 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-orange-600 transition-all active:scale-95">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
