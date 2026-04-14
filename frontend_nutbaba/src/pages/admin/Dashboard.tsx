import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils';
import { adminFetch } from '../../utils/adminApi';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminFetch('/api/admin/dashboard');
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#CE6A24] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="p-4 md:p-8 bg-[#F8F9FA] min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">Workspace Overview</h1>
        <p className="text-gray-500 font-medium">Real-time performance metrics for Nut Baba</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          subValue="+12.5% from last month"
          trend="up"
          color="green"
        />
        <StatCard
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          label="Total Orders"
          value={stats.totalOrders}
          subValue={`${stats.pendingOrders} pending orders`}
          trend="up"
          color="blue"
        />
        <StatCard
          icon={<Package className="w-6 h-6 text-[#CE6A24]" />}
          label="Total Products"
          value={stats.totalProducts}
          subValue="Active in inventory"
          trend="neutral"
          color="orange"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-purple-600" />}
          label="Total Customers"
          value={stats.totalUsers}
          subValue="+14 new this week"
          trend="up"
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800">Recent Transactions</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Latest 10 orders</p>
            </div>
            <Link to="/admin/orders" className="px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-bold text-gray-700 transition-all">View All Orders</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-800 text-sm">{order.orderNumber}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="font-black text-gray-900 text-sm">{formatPrice(order.totalAmount)}</div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(order.createdAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl">
            <h3 className="text-xl font-black mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction to="/admin/products" label="Add Product" icon="+" />
              <QuickAction to="/admin/coupons" label="New Coupon" icon="%" />
              <QuickAction to="/admin/orders" label="Check Status" icon={<Clock className="w-4 h-4" />} />
              <QuickAction to="/admin/settings" label="Site Config" icon="⚙" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6">Order Summary</h3>
            <div className="space-y-4">
              <StatusSummary label="Pending" count={stats.pendingOrders} color="bg-yellow-400" />
              <StatusSummary label="Delivered" count={stats.totalOrders - stats.pendingOrders} color="bg-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, trend, color }: any) => (
  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-${color}-50`}>
      {icon}
    </div>
    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-3xl font-black text-gray-900 mb-2">{value}</div>
    <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
      {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
      {subValue}
    </div>
  </div>
);

const QuickAction = ({ to, label, icon }: any) => (
  <Link to={to} className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all text-center group">
    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
  </Link>
);

const StatusSummary = ({ label, count, color }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-sm font-bold text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-black text-gray-900">{count}</span>
  </div>
);

export default Dashboard;
