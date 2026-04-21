import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Play, CheckCircle, Clock, Dumbbell, ChevronRight,
  Timer, Weight, RotateCcw 
} from 'lucide-react';
import toast from 'react-hot-toast';

const WorkoutLogger = () => {
  const [workout, setWorkout] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseData, setExerciseData] = useState({});
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodaysWorkout();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const fetchTodaysWorkout = async () => {
    try {
      const res = await api.get('/workouts/today');
      if (res.data.workout) {
        setWorkout(res.data.workout);
        // Initialize exercise data
        const initialData = {};
        res.data.workout.exercises.forEach((ex, idx) => {
          initialData[idx] = {
            actual_sets: ex.sets || 3,
            actual_reps: ex.reps || 12,
            actual_weight_kg: ex.weight || 0,
            completed: false,
            notes: ''
          };
        });
        setExerciseData(initialData);
      }
    } catch (error) {
      console.error('Failed to fetch workout:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setIsActive(true);
  };

  const handleExerciseComplete = () => {
    setExerciseData({
      ...exerciseData,
      [currentExercise]: {
        ...exerciseData[currentExercise],
        completed: true
      }
    });

    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    setIsActive(false);
    setWorkoutComplete(true);

    try {
      // Log all exercises
      for (let i = 0; i < workout.exercises.length; i++) {
        await api.post('/workouts/log', {
          session_exercise_id: workout.exercises[i].session_exercise_id,
          scheduled_date: new Date().toISOString().split('T')[0],
          actual_sets: exerciseData[i].actual_sets,
          actual_reps: exerciseData[i].actual_reps,
          actual_weight_kg: exerciseData[i].actual_weight_kg,
          duration_minutes: Math.floor(timer / 60),
          perceived_difficulty: 7, // Could add UI for this
          notes: exerciseData[i].notes
        });
      }

      toast.success('Workout completed! Great job! 🎉');
      setTimeout(() => navigate('/client/dashboard'), 2000);
    } catch (error) {
      toast.error('Failed to save workout');
    }
  };

  const updateExerciseField = (field, value) => {
    setExerciseData({
      ...exerciseData,
      [currentExercise]: {
        ...exerciseData[currentExercise],
        [field]: value
      }
    });
  };

  if (!workout) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Workout Scheduled</h2>
        <p className="text-gray-600 mb-6">Today is a rest day or you don't have an active program.</p>
        <button 
          onClick={() => navigate('/client/browse')}
          className="btn-primary"
        >
          Find a Trainer
        </button>
      </div>
    );
  }

  if (workoutComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Workout Complete! 🎉</h2>
        <p className="text-gray-600 mb-2">Duration: {formatTime(timer)}</p>
        <p className="text-gray-600 mb-6">Exercises completed: {workout.exercises.length}</p>
        <button 
          onClick={() => navigate('/client/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{workout.session_name}</h1>
          <p className="text-gray-600 mb-6">{workout.instructions}</p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{workout.duration_minutes}</p>
              <p className="text-sm text-gray-500">minutes</p>
            </div>
            <div className="text-center">
              <Dumbbell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{workout.exercises.length}</p>
              <p className="text-sm text-gray-500">exercises</p>
            </div>
            <div className="text-center">
              <Weight className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{workout.intensity_level}</p>
              <p className="text-sm text-gray-500">intensity</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Exercises:</h3>
            <div className="space-y-2 max-w-md mx-auto text-left">
              {workout.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-sm text-gray-500">
                    {ex.sets} sets × {ex.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartWorkout}
            className="btn-primary text-lg px-8 py-4"
          >
            <Play className="h-5 w-5 inline mr-2" />
            Start Workout
          </button>
        </div>
      </div>
    );
  }

  const currentEx = workout.exercises[currentExercise];
  const progress = ((currentExercise + 1) / workout.exercises.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Exercise {currentExercise + 1} of {workout.exercises.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-full">
          <Timer className="h-5 w-5 mr-2" />
          <span className="text-2xl font-mono font-bold">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Exercise Card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentEx.name}</h2>
            <p className="text-gray-600 capitalize">{currentEx.muscle_group?.join(', ')}</p>
          </div>
          {currentEx.video_demo_url && (
            <button className="text-blue-600 hover:text-blue-800">
              Watch Demo
            </button>
          )}
        </div>

        {currentEx.instructions && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">{currentEx.instructions}</p>
          </div>
        )}

        {/* Input Fields */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label">Sets</label>
            <input
              type="number"
              value={exerciseData[currentExercise]?.actual_sets || ''}
              onChange={(e) => updateExerciseField('actual_sets', parseInt(e.target.value))}
              className="input-field text-center text-lg"
            />
          </div>
          <div>
            <label className="label">Reps</label>
            <input
              type="number"
              value={exerciseData[currentExercise]?.actual_reps || ''}
              onChange={(e) => updateExerciseField('actual_reps', parseInt(e.target.value))}
              className="input-field text-center text-lg"
            />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={exerciseData[currentExercise]?.actual_weight_kg || ''}
              onChange={(e) => updateExerciseField('actual_weight_kg', parseFloat(e.target.value))}
              className="input-field text-center text-lg"
            />
          </div>
        </div>

        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            value={exerciseData[currentExercise]?.notes || ''}
            onChange={(e) => updateExerciseField('notes', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="How did it feel? Any issues?"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        {currentExercise > 0 && (
          <button
            onClick={() => setCurrentExercise(currentExercise - 1)}
            className="flex-1 btn-secondary"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleExerciseComplete}
          className="flex-1 btn-primary flex items-center justify-center space-x-2"
        >
          <span>{currentExercise === workout.exercises.length - 1 ? 'Finish Workout' : 'Next Exercise'}</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Rest Timer Suggestion */}
      {currentEx.rest_seconds && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Suggested rest: {currentEx.rest_seconds} seconds
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;