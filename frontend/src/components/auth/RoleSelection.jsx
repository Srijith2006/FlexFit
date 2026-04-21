import { Link } from 'react-router-dom';
import { UserCheck, Dumbbell, Shield } from 'lucide-react';

const RoleSelection = () => {
  const roles = [
    {
      id: 'client',
      title: 'I want to get fit',
      description: 'Find a verified trainer and start your fitness journey with personalized coaching.',
      icon: UserCheck,
      color: 'bg-blue-600',
      href: '/register/client'
    },
    {
      id: 'trainer',
      title: "I'm a fitness trainer",
      description: 'Join our platform, get verified, and start coaching clients asynchronously.',
      icon: Dumbbell,
      color: 'bg-green-600',
      href: '/register/trainer'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join FlexFit
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose how you want to use the platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            {roles.map((role) => (
              <Link
                key={role.id}
                to={role.href}
                className="block w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${role.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <role.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {role.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {role.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

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

export default RoleSelection;