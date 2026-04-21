import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar, TrendingUp, MessageSquare, Target,
  Clock, Flame, ChevronRight, Trophy
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const ClientDashboard = () => {
  const [stats, setStats]               = useState({ workoutsCompleted: 0, currentStreak: 0, weightChange: 0, adherenceRate: 0 });
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [trainer, setTrainer]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      // Run requests independently so one failure doesn't block everything
      const [statsRes, workoutRes, progressRes, trainerRes] = await Promise.allSettled([
        api.get('/workouts/progress?period=30'),
        api.get('/workouts/today'),
        api.get('/workouts/progress-chart'),
        api.get('/coaching/my-trainer')
      ]);

      if (statsRes.status === 'fulfilled')   setStats(statsRes.value.data);
      if (workoutRes.status === 'fulfilled') setTodayWorkout(workoutRes.value.data);
      if (progressRes.status === 'fulfilled') setProgressData(progressRes.value.data || []);
      if (trainerRes.status === 'fulfilled') setTrainer(trainerRes.value.data.relationship);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Some dashboard data could not be loaded.');
    } finally {
      setLoading(false);
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
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back! 💪</h1>
        <p className="text-gray-600 mt-1">Let's crush your fitness goals today.</p>
      </div>

      {/* Today's Workout */}
      {todayWorkout?.workout ? (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">TODAY'S WORKOUT</p>
              <h2 className="text-2xl font-bold mb-2">{todayWorkout.workout.session_name}</h2>
              <div className="flex items-center space-x-4 text-sm text-blue-100">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {todayWorkout.workout.duration_minutes} min
                </span>
                <span className="flex items-center">
                  <Flame className="h-4 w-4 mr-1" />
                  Intensity: {todayWorkout.workout.intensity_level}/10
                </span>
                <span className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {todayWorkout.workout.focus_area}
                </span>
              </div>
            </div>
            <Link
              to="/client/workout"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Workout
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-2xl p-6 text-center mb-8">
          <p className="text-gray-600">Rest day or no workout scheduled. Enjoy your recovery! 🎉</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Workouts"      value={stats.workoutsCompleted}  subtitle="This month"  icon={Trophy}    color="bg-yellow-500" />
        <StatCard title="Streak"        value={`${stats.currentStreak} days`} subtitle="Keep it up!" icon={Flame} color="bg-orange-500" />
        <StatCard title="Weight Change" value={`${stats.weightChange > 0 ? '+' : ''}${stats.weightChange} kg`} subtitle="Since start" icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Adherence"     value={`${stats.adherenceRate}%`} subtitle="On track"   icon={Target}    color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h2>
          <div className="h-64">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No progress data yet. Start logging workouts!
              </div>
            )}
          </div>
        </div>

        {/* Trainer */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Trainer</h2>
          {trainer ? (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {trainer.Trainer?.User?.profile_image_url ? (
                    <img src={trainer.Trainer.User.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-blue-600 font-bold text-lg">
                      {trainer.Trainer?.User?.first_name?.[0] || 'T'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {trainer.Trainer?.User?.first_name} {trainer.Trainer?.User?.last_name}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{trainer.Trainer?.star_rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/client/messages/${trainer.relationship_id}`}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message Trainer</span>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No trainer assigned yet</p>
              <Link to="/client/browse" className="btn-primary">Find a Trainer</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction title="Log Workout"     icon={Calendar}    to="/client/workout"   color="bg-blue-600" />
        <QuickAction title="Track Progress"  icon={TrendingUp}  to="/client/progress"  color="bg-green-600" />
        <QuickAction title="View Program"    icon={Target}      to="/client/program"   color="bg-purple-600" />
        <QuickAction title="Browse Trainers" icon={ChevronRight} to="/client/browse"   color="bg-orange-600" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-2">
      <div className={`${color} p-2 rounded-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
  </div>
);

const QuickAction = ({ title, icon: Icon, to, color }) => (
  <Link to={to} className={`${color} rounded-xl p-4 text-white hover:opacity-90 transition-opacity`}>
    <Icon className="h-6 w-6 mb-2" />
    <p className="font-semibold">{title}</p>
  </Link>
);

export default ClientDashboard;