import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils';

const OrderTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const successMessage = location.state?.success;
  const initialOrderId = location.state?.orderId;

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const ordersList = data.orders || [];
        setOrders(ordersList);

        // Auto-select the newly placed order if orderId was passed
        if (initialOrderId) {
          const newOrder = ordersList.find((o: any) => o.id === initialOrderId);
          if (newOrder) setSelectedOrder(newOrder);
        } else if (ordersList.length > 0) {
          setSelectedOrder(ordersList[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDF7EE] py-20">
        <div className="max-w-md mx-auto px-4 text-center bg-white p-12 rounded-[32px] shadow-sm border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-500 mb-8">You need to be logged in to track your orders.</p>
          <Link to="/login" className="bg-[#CE6A24] text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-orange-900/10 hover:bg-[#B1561E] transition-all">Login Now</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF7EE] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#CE6A24] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7EE] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {successMessage && (
          <div className="mb-8 p-6 bg-green-50 border border-green-100 text-green-800 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">✓</div>
            <div>
              <h3 className="font-bold">Order Placed Successfully!</h3>
              <p className="text-sm opacity-90">Thank you for your order. You can track its progress below.</p>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
            <p className="text-gray-500">Track and manage your delicious purchases</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center shadow-md border border-orange-50/50">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Orders Found</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">It looks like you haven&apos;t placed any orders yet. Head over to the shop to get started!</p>
            <Link to="/shop" className="inline-block bg-[#CE6A24] text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-orange-900/20 hover:bg-[#B1561E] transition-all transform hover:-translate-y-1">Explore Products</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar: Order List */}
            <div className="lg:col-span-4 space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-100">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-5 rounded-[24px] border transition-all ${selectedOrder?.id === order.id
                    ? 'bg-white border-[#CE6A24] shadow-lg shadow-orange-900/5 translate-x-1'
                    : 'bg-white/50 border-transparent hover:bg-white hover:border-orange-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{order.orderNumber || `#${order.id}`}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-4 line-clamp-1">{order.items?.[0]?.name}{order.items?.length > 1 && ` +${order.items.length - 1} more`}</h4>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{formatDate(order.createdAt)}</div>
                    <div className="text-lg font-black text-[#CE6A24]">{formatPrice(order.totalAmount)}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Content: Order Detail */}
            <div className="lg:col-span-8">
              {selectedOrder ? (
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-orange-900/5 border border-orange-50/50">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-10 mb-10">
                    <div>
                      <div className="text-xs font-black text-[#CE6A24] uppercase tracking-[0.2em] mb-3">Order Details</div>
                      <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedOrder.orderNumber}</h2>
                      <p className="text-gray-400 text-sm">Placed on {formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                      <div className="font-bold text-gray-800 uppercase tracking-wider">{selectedOrder.orderStatus}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 mb-12">
                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Items Purchased</h3>
                      <div className="space-y-6">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <Link to={item.slug ? `/product/${item.slug}` : `/shop`} className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-orange-50 hover:border-[#CE6A24] transition-colors group">
                              <img src={item.image || '/images/products/dark-chocolate-1.jpg'} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                            </Link>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <Link to={item.slug ? `/product/${item.slug}` : `/shop`} className="font-bold text-gray-800 text-sm line-clamp-1 hover:text-[#CE6A24] transition-colors">
                                {item.name}
                              </Link>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                {typeof item.size === 'object' && item.size !== null ? item.size.size || 'Standard' : item.size || 'Standard'} • {item.texture || 'Smooth'} • Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right font-bold text-sm text-gray-800">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Shipping To</h3>
                        <div className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-5 rounded-3xl border border-gray-100">
                          <p className="font-black text-gray-800 mb-1">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                          <p>{selectedOrder.shippingAddress.streetAddress}</p>
                          {selectedOrder.shippingAddress.apartment && <p>{selectedOrder.shippingAddress.apartment}</p>}
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                          <p className="mt-3 font-bold text-[#CE6A24]">{selectedOrder.shippingAddress.phone}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-5 rounded-3xl border border-gray-100">
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</div>
                          <div className="font-bold text-gray-800 uppercase text-xs">{selectedOrder.paymentMethod}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</div>
                          <div className={`font-bold uppercase text-xs ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{selectedOrder.paymentStatus}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-[#1a1a1a] text-white rounded-[32px] p-8 md:p-10">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm opacity-60"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-400"><span>Coupon Discount</span><span>-{formatPrice(selectedOrder.discountAmount)}</span></div>
                      )}
                      <div className="flex justify-between text-sm opacity-60"><span>Shipping Charge</span><span>{selectedOrder.shippingCharge === 0 ? 'FREE' : formatPrice(selectedOrder.shippingCharge)}</span></div>
                      <div className="h-px bg-white/10 my-4"></div>
                      <div className="flex justify-between items-end">
                        <span className="font-bold uppercase tracking-[0.2em] text-xs">Total Amount Paid</span>
                        <span className="text-3xl font-black text-white">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 rounded-[40px] p-20 text-center border-2 border-dashed border-orange-100">
                  <p className="text-gray-400 font-bold uppercase tracking-widest">Select an order from the list</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
