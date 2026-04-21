import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';

// Trainer
import TrainerDashboard from './components/trainer/TrainerDashboard';
import VerificationUpload from './components/trainer/VerificationUpload';
import ClientList from './components/trainer/ClientList';
import ProgramBuilder from './components/trainer/ProgramBuilder';

// Client
import ClientDashboard from './components/client/ClientDashboard';
import TrainerBrowse from './components/client/TrainerBrowse';
import ProgressTracker from './components/client/ProgressTracker';
import WorkoutLogger from './components/client/WorkoutLogger';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RoleSelection />} />
          <Route path="/register/:role" element={<Register />} />

          {/* Trainer */}
          <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
            <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
            <Route path="/trainer/verification" element={<VerificationUpload />} />
            <Route path="/trainer/clients" element={<ClientList />} />
            <Route path="/trainer/programs" element={<ProgramBuilder />} />
          </Route>

          {/* Client */}
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client/browse" element={<TrainerBrowse />} />
            <Route path="/client/progress" element={<ProgressTracker />} />
            <Route path="/client/workout" element={<WorkoutLogger />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

        </Routes>
      </main>

      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;