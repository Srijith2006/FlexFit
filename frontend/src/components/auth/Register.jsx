import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    date_of_birth: '',
    country: '',
    gender: '',
    // Trainer specific
    years_experience: '',
    specializations: [],
    hourly_rate: '',
    bio: '',
    // Client specific
    fitness_goal: '',
    current_weight: '',
    target_weight: '',
    height: '',
    activity_level: 'moderately_active'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const specializations = [
    'weight_loss', 'muscle_gain', 'strength_training', 'yoga',
    'pilates', 'cardio', 'sports_performance', 'rehabilitation',
    'nutrition', 'hiit', 'crossfit', 'bodybuilding'
  ];

  const fitnessGoals = [
    'lose_weight', 'gain_muscle', 'maintain', 'improve_endurance',
    'increase_flexibility', 'sports_performance', 'general_health'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const specs = [...formData.specializations];
      if (checked) {
        specs.push(value);
      } else {
        const index = specs.indexOf(value);
        if (index > -1) specs.splice(index, 1);
      }
      setFormData({ ...formData, specializations: specs });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        ...formData,
        role,
        specializations: role === 'trainer' ? formData.specializations : undefined,
        years_experience: role === 'trainer' ? parseInt(formData.years_experience) || 0 : undefined,
        hourly_rate: role === 'trainer' ? parseFloat(formData.hourly_rate) || 0 : undefined,
        fitness_goal: role === 'client' ? formData.fitness_goal : undefined,
        current_weight_kg: role === 'client' ? parseFloat(formData.current_weight) || null : undefined,
        target_weight_kg: role === 'client' ? parseFloat(formData.target_weight) || null : undefined,
        height_cm: role === 'client' ? parseInt(formData.height) || null : undefined
      };

      await register(userData);
      toast.success('Account created successfully!');
      
      // Redirect based on role
      if (role === 'trainer') {
        navigate('/trainer/verification');
      } else {
        navigate('/client/browse');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="John"
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            className="input-field pl-10 pr-10"
            placeholder="Min 8 characters"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Confirm Password *</label>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-field"
          placeholder="Confirm password"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="+1 234 567 890"
            />
          </div>
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">Country</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="input-field pl-10"
          >
            <option value="">Select country</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="IN">India</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => validateStep1() && setStep(2)}
        className="w-full btn-primary"
      >
        Continue
      </button>
    </div>
  );

  const renderTrainerStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="label">Years of Experience</label>
        <input
          name="years_experience"
          type="number"
          value={formData.years_experience}
          onChange={handleChange}
          className="input-field"
          placeholder="5"
        />
      </div>

      <div>
        <label className="label">Hourly Rate (USD)</label>
        <input
          name="hourly_rate"
          type="number"
          value={formData.hourly_rate}
          onChange={handleChange}
          className="input-field"
          placeholder="50"
        />
      </div>

      <div>
        <label className="label">Specializations</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {specializations.map((spec) => (
            <label key={spec} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={spec}
                checked={formData.specializations.includes(spec)}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm capitalize">{spec.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="input-field"
          placeholder="Tell clients about your experience and approach..."
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary flex justify-center items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );

  const renderClientStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="label">Fitness Goal</label>
        <select
          name="fitness_goal"
          value={formData.fitness_goal}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select your goal</option>
          {fitnessGoals.map((goal) => (
            <option key={goal} value={goal}>
              {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Current Weight (kg)</label>
          <input
            name="current_weight"
            type="number"
            step="0.1"
            value={formData.current_weight}
            onChange={handleChange}
            className="input-field"
            placeholder="70"
          />
        </div>
        <div>
          <label className="label">Target Weight (kg)</label>
          <input
            name="target_weight"
            type="number"
            step="0.1"
            value={formData.target_weight}
            onChange={handleChange}
            className="input-field"
            placeholder="65"
          />
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            className="input-field"
            placeholder="175"
          />
        </div>
      </div>

      <div>
        <label className="label">Activity Level</label>
        <select
          name="activity_level"
          value={formData.activity_level}
          onChange={handleChange}
          className="input-field"
        >
          <option value="sedentary">Sedentary (office job)</option>
          <option value="lightly_active">Lightly Active (1-2 days/week)</option>
          <option value="moderately_active">Moderately Active (3-5 days/week)</option>
          <option value="very_active">Very Active (6-7 days/week)</option>
          <option value="extremely_active">Extremely Active (physical job)</option>
        </select>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary flex justify-center items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {role === 'trainer' ? 'Join as a verified trainer' : 'Start your fitness journey'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
            </div>
            <div className="flex justify-center mt-2 text-sm text-gray-500">
              <span className="w-20 text-center">Basic Info</span>
              <span className="w-20 text-center">Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && role === 'trainer' && renderTrainerStep2()}
            {step === 2 && role === 'client' && renderClientStep2()}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;