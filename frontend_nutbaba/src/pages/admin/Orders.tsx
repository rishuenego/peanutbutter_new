import { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils';
import { adminFetch } from '../../utils/adminApi';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminFetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        const ordersList = data.orders || [];
        setOrders(ordersList);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: status });
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const filteredOrders = orders.filter((order) => {
    const shippingAddress = order.shippingAddress || {};
    const oId = String(order.id);
    const orderNum = order.orderNumber || '';
    const matchesSearch =
      oId.includes(searchQuery) ||
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shippingAddress.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shippingAddress.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#CE6A24] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Customer Orders</h1>
          <p className="text-gray-500 text-sm">Manage and track all customer purchases</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm font-bold text-gray-700"
          >
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Info</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-800 text-sm">{order.orderNumber}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{formatDate(order.createdAt)}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-800 text-sm">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
                  <div className="text-[10px] text-gray-500">{order.shippingAddress?.phone}</div>
                </td>
                <td className="px-6 py-5 font-black text-gray-900">{formatPrice(order.totalAmount)}</td>
                <td className="px-6 py-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{order.paymentMethod}</div>
                  <div className={`text-[10px] font-black uppercase mt-0.5 ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-orange-400'}`}>{order.paymentStatus}</div>
                </td>
                <td className="px-6 py-5">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none cursor-pointer ${getStatusColor(order.orderStatus)}`}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 text-[#CE6A24] hover:bg-orange-50 rounded-xl transition-colors"><Eye className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Order Summary</div>
                <h2 className="text-2xl font-black text-gray-800">{selectedOrder.orderNumber}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <Search className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-10 mb-10">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Shipping Information</h3>
                  <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100">
                    <p className="font-bold text-gray-800 mb-2 text-lg">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{selectedOrder.shippingAddress.streetAddress}</p>
                      {selectedOrder.shippingAddress.apartment && <p>{selectedOrder.shippingAddress.apartment}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                      <p className="pt-2 font-bold text-[#CE6A24]">{selectedOrder.shippingAddress.phone}</p>
                      <p className="text-xs italic">{selectedOrder.shippingAddress.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Order Meta</h3>
                  <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</span>
                      <span className="font-bold text-gray-800">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Payment Method</span>
                      <span className="font-bold text-gray-800 uppercase text-xs">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{selectedOrder.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Cart Items</h3>
              <div className="space-y-4 mb-10">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-gray-50">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                       <img src={item.image || '/images/products/default.jpg'} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.size} • {item.texture} x {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 text-white rounded-[32px] p-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs opacity-60"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-green-400"><span>Discount ({selectedOrder.couponCode})</span><span>-{formatPrice(selectedOrder.discountAmount)}</span></div>
                  )}
                  <div className="flex justify-between text-xs opacity-60"><span>Shipping</span><span>{selectedOrder.shippingCharge === 0 ? 'FREE' : formatPrice(selectedOrder.shippingCharge)}</span></div>
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="flex justify-between items-end">
                    <span className="font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                    <span className="text-3xl font-black text-[#CE6A24]">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 border-t border-gray-100">
               <div className="flex items-center gap-6">
                 <div className="flex-1">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Change Order Status</div>
                   <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-gray-700"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="px-10 py-3 bg-gray-800 text-white rounded-2xl font-bold text-sm hover:bg-gray-900 transition-all">Done Viewing</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
