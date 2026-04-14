import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { formatDate } from '../../utils';
import { adminFetch } from '../../utils/adminApi';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminFetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        const usersList = Array.isArray(data) ? data : (data.users || []);
        setUsers(usersList);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Users</h1>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500 font-medium">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.ordersCount}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    Rs. {user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(user.lastLogin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
};

export default Users;
