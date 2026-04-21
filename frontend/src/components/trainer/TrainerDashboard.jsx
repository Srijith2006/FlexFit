import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users, DollarSign, Star, TrendingUp,
  Calendar, MessageSquare, Award
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const TrainerDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    completionRate: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Promise.allSettled — ONE failure will NOT crash the rest
      const [statsRes, clientsRes, earningsRes, requestsRes] = await Promise.allSettled([
        api.get('/trainers/stats'),
        api.get('/coaching/my-clients?limit=5'),
        api.get('/payments/earnings-summary'),
        api.get('/coaching/requests')   // ✅ NEW
      ]);

      if (statsRes.status === 'fulfilled')
        setStats(statsRes.value.data);

      if (clientsRes.status === 'fulfilled')
        setRecentClients(clientsRes.value.data.clients || []);

      if (earningsRes.status === 'fulfilled')
        setEarningsData(earningsRes.value.data.monthly || []);

      if (requestsRes.status === 'fulfilled') {
        setPendingRequests(requestsRes.value.data.requests || []);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false); // always stop spinner
    }
  };

  const handleRequest = async (relationship_id, action) => {
    try {
      await api.post('/coaching/respond', {
        relationship_id,
        action
      });

      fetchDashboardData(); // refresh
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your clients and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Clients" value={stats.activeClients} icon={Users} trend="+12%" color="bg-blue-500" />
        <StatCard title="Monthly Revenue" value={`$${stats.monthlyRevenue}`} icon={DollarSign} trend="+8%" color="bg-green-500" />
        <StatCard title="Average Rating" value={stats.averageRating} icon={Star} trend="+0.3" color="bg-yellow-500" />
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={TrendingUp} trend="+5%" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Earnings Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
          <div className="h-80">
            {earningsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No earnings data yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
            <Link to="/trainer/clients" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No clients yet.</p>
          ) : (
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.relationship_id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {client.Client?.User?.profile_image_url ? (
                      <img src={client.Client.User.profile_image_url} alt=""
                        className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold">
                        {client.Client?.User?.first_name?.[0] || 'C'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {client.Client?.User?.first_name} {client.Client?.User?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Started {new Date(client.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${client.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Requests */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h2>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.relationship_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {req.Client?.User?.first_name} {req.Client?.User?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{req.Client?.User?.email}</p>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => handleRequest(req.relationship_id, 'accept')}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(req.relationship_id, 'reject')}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Create Program"
          description="Design a new workout program"
          icon={Calendar}
          to="/trainer/programs"
          color="bg-blue-600"
        />
        <QuickActionCard
          title="Client Messages"
          description="Check unread messages"
          icon={MessageSquare}
          to="/trainer/clients"
          color="bg-green-600"
          badge={3}
        />
        <QuickActionCard
          title="Verification Status"
          description="Complete your profile verification"
          icon={Award}
          to="/trainer/verification"
          color="bg-purple-600"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-sm text-green-600 mt-1">{trend} from last month</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, icon: Icon, to, color, badge }) => (
  <Link to={to} className="card hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between">
      <div className={`${color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </Link>
);

export default TrainerDashboard;