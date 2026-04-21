import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, Filter, Star, MapPin, DollarSign, 
  Award, Clock, ChevronRight, CheckCircle 
} from 'lucide-react';
import StarRating from '../common/StarRating';
import toast from 'react-hot-toast';

const TrainerBrowse = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    minRating: 0,
    maxPrice: 500,
    verifiedOnly: true
  });
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const specializations = [
    'weight_loss', 'muscle_gain', 'strength_training', 'yoga',
    'pilates', 'cardio', 'sports_performance', 'rehabilitation',
    'nutrition', 'hiit', 'crossfit', 'bodybuilding'
  ];

  useEffect(() => {
    fetchTrainers();
  }, [filters]);

  const fetchTrainers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.minRating) params.append('min_rating', filters.minRating);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.verifiedOnly) params.append('verified_only', 'true');
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/trainers?${params.toString()}`);
      setTrainers(res.data.trainers);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrainer = async (packageType) => {
    try {
      await api.post('/coaching/request', {
        trainer_id: selectedTrainer.trainer_id,
        package_type: packageType,
        monthly_rate: selectedTrainer.hourly_rate * 4 // Estimate
      });
      toast.success('Request sent! The trainer will review shortly.');
      setShowBookingModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
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
        <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Trainer</h1>
        <p className="text-gray-600 mt-1">Browse verified fitness experts and start your transformation</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainers..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
            className="input-field"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>
                {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
            className="input-field"
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="verified" className="text-sm text-gray-700">
              Verified only
            </label>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div key={trainer.trainer_id} className="card hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                  {trainer.User?.profile_image_url ? (
                    <img 
                      src={trainer.User.profile_image_url} 
                      alt="" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {trainer.User?.first_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {trainer.User?.first_name} {trainer.User?.last_name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <StarRating rating={parseFloat(trainer.star_rating)} size="sm" />
                    <span className="text-sm text-gray-500">
                      ({trainer.total_reviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              {trainer.is_verified && (
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Award className="h-4 w-4 mr-2" />
                {trainer.years_experience} years experience
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                ${trainer.hourly_rate}/hour
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {trainer.response_time_hours || 24}h response time
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-2 mb-4">
              {trainer.specializations?.slice(0, 3).map((spec) => (
                <span 
                  key={spec}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize"
                >
                  {spec.replace('_', ' ')}
                </span>
              ))}
              {trainer.specializations?.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{trainer.specializations.length - 3} more
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link
                to={`/trainers/${trainer.trainer_id}`}
                className="flex-1 btn-secondary text-center text-sm py-2"
              >
                View Profile
              </Link>
              <button
                onClick={() => {
                  setSelectedTrainer(trainer);
                  setShowBookingModal(true);
                }}
                className="flex-1 btn-primary text-sm py-2"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {trainers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No trainers found matching your criteria.</p>
          <button 
            onClick={() => setFilters({
              search: '',
              specialization: '',
              minRating: 0,
              maxPrice: 500,
              verifiedOnly: false
            })}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Book {selectedTrainer.User?.first_name}
            </h3>
            <p className="text-gray-600 mb-6">
              Choose your coaching package:
            </p>
            
            <div className="space-y-3">
              {[
                { type: 'weekly', label: '1 Week Trial', price: selectedTrainer.hourly_rate * 1 },
                { type: 'monthly', label: 'Monthly', price: selectedTrainer.hourly_rate * 4 },
                { type: '3_month', label: '3 Months (10% off)', price: selectedTrainer.hourly_rate * 12 * 0.9 }
              ].map((pkg) => (
                <button
                  key={pkg.type}
                  onClick={() => handleBookTrainer(pkg.type)}
                  className="w-full border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{pkg.label}</p>
                      <p className="text-sm text-gray-500">
                        {pkg.type === 'weekly' ? '3 sessions' : 'Full access'}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      ${pkg.price.toFixed(0)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBookingModal(false)}
              className="w-full mt-4 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerBrowse;