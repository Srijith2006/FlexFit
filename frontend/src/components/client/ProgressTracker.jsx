import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  TrendingUp, Camera, Scale, Ruler, Calendar,
  ChevronLeft, ChevronRight, Plus 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const ProgressTracker = () => {
  const [metrics, setMetrics] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    measurements: {}
  });
  const [photos, setPhotos] = useState({ front: null, side: null, back: null });

  useEffect(() => {
    fetchProgressData();
  }, [selectedDate]);

  const fetchProgressData = async () => {
    try {
      const [metricsRes, logsRes] = await Promise.all([
        api.get('/workouts/body-metrics'),
        api.get('/workouts/logs?period=30')
      ]);
      setMetrics(metricsRes.data);
      setWorkoutLogs(logsRes.data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('weight_kg', newMetric.weight_kg);
      formData.append('body_fat_percentage', newMetric.body_fat_percentage);
      formData.append('measurements', JSON.stringify(newMetric.measurements));
      
      if (photos.front) formData.append('front', photos.front);
      if (photos.side) formData.append('side', photos.side);
      if (photos.back) formData.append('back', photos.back);

      await api.post('/workouts/body-metrics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Progress logged successfully!');
      setShowAddMetric(false);
      fetchProgressData();
    } catch (error) {
      toast.error('Failed to log progress');
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return addDays(start, i);
  });

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = workoutLogs.find(l => l.scheduled_date === dateStr);
    return log?.status || 'none';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor your transformation journey</p>
        </div>
        <button
          onClick={() => setShowAddMetric(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Log Progress</span>
        </button>
      </div>

      {/* Weekly Calendar */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">This Week</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedDate(subDays(selectedDate, 7))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const status = getDayStatus(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div 
                key={idx}
                className={`text-center p-3 rounded-lg ${
                  isToday ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</p>
                <p className="text-lg font-semibold text-gray-900">{format(day, 'd')}</p>
                <div className={`mt-2 h-2 w-2 rounded-full mx-auto ${
                  status === 'completed' ? 'bg-green-500' :
                  status === 'scheduled' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weight Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Weight Progress
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recorded_date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="weight_kg" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Fat Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Ruler className="h-5 w-5 mr-2" />
            Body Fat %
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recorded_date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="body_fat_percentage" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress Photos */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Progress Photos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['front', 'side', 'back'].map((view) => (
            <div key={view} className="relative">
              <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                {metrics[0]?.[`progress_photos_${view}`]?.[0] ? (
                  <img 
                    src={metrics[0][`progress_photos_${view}`][0]} 
                    alt={view}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 capitalize">{view} View</p>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2 capitalize">
                {view} View
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Metric Modal */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Log Progress</h3>
            
            <form onSubmit={handleAddMetric} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMetric.weight_kg}
                    onChange={(e) => setNewMetric({...newMetric, weight_kg: e.target.value})}
                    className="input-field"
                    placeholder="70.5"
                  />
                </div>
                <div>
                  <label className="label">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMetric.body_fat_percentage}
                    onChange={(e) => setNewMetric({...newMetric, body_fat_percentage: e.target.value})}
                    className="input-field"
                    placeholder="15.5"
                  />
                </div>
              </div>

              <div>
                <label className="label">Measurements (cm)</label>
                <div className="grid grid-cols-2 gap-4">
                  {['chest', 'waist', 'hips', 'arms', 'thighs'].map((measurement) => (
                    <div key={measurement}>
                      <label className="text-xs text-gray-500 capitalize">{measurement}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMetric.measurements[measurement] || ''}
                        onChange={(e) => setNewMetric({
                          ...newMetric,
                          measurements: {
                            ...newMetric.measurements,
                            [measurement]: e.target.value
                          }
                        })}
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Progress Photos</label>
                <div className="grid grid-cols-3 gap-2">
                  {['front', 'side', 'back'].map((view) => (
                    <div key={view}>
                      <label className="text-xs text-gray-500 capitalize block mb-1">{view}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotos({...photos, [view]: e.target.files[0]})}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMetric(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;