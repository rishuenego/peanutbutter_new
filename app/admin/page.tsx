"use client";

import useSWR from "swr";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Array<{
    id: number;
    order_id: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

const statCards = [
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: DollarSign,
    color: "bg-green-500",
    format: (v: number) => formatPrice(v),
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ShoppingCart,
    color: "bg-blue-500",
    format: (v: number) => v.toString(),
  },
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "bg-purple-500",
    format: (v: number) => v.toString(),
  },
  {
    key: "totalProducts",
    label: "Total Products",
    icon: Package,
    color: "bg-amber-500",
    format: (v: number) => v.toString(),
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useSWR<DashboardStats>(
    "/api/admin/dashboard",
    fetcher
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp size={16} />
                <span className="ml-1">+12%</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{card.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-24 h-8 block" />
              ) : (
                card.format(stats?.[card.key as keyof DashboardStats] as number || 0)
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-mono text-sm">
                      #{order.order_id}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusColors[order.status] || "bg-gray-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}
