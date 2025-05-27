// frontend/src/components/forms/RegisterForm.js
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState('');
  // Get state including the new registrationMessage and setError
  const { register, loading, error: authError, setError, registrationMessage } = useAuth(); // <<< Add setError
  const navigate = useNavigate();

  // --- Effect to clear general auth error on mount ---
  useEffect(() => {
    console.log('[RegisterForm Mount Effect] Clearing general authError state.');
    setError(null); // Clear any previous general auth errors (like from login)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount
  // --- End Effect ---

  // Effect to navigate after success message (Keep this as is)
  useEffect(() => {
    let timer;
    if (registrationMessage) {
      console.log('[RegisterForm Effect] registrationMessage detected, setting timer for navigation.');
      timer = setTimeout(() => {
        console.log('[RegisterForm Effect] Timer fired, navigating to /login.');
        navigate('/login');
      }, 5000); // 5 seconds delay
    } else {
        console.log('[RegisterForm Effect] registrationMessage is null or empty, no navigation timer set.');
    }
    return () => {
        if (timer) {
            console.log('[RegisterForm Effect Cleanup] Clearing navigation timer.');
            clearTimeout(timer);
        }
    };
  }, [registrationMessage, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous client-side errors
    setError(null); // Clear previous backend auth errors before new attempt
    // Note: The register function in the hook already clears registrationMessage
    console.log('[RegisterForm handleSubmit] Form submitted.');

    // Client-side validation
    if (password !== confirmPassword) {
      console.log('[RegisterForm handleSubmit] Client Error: Passwords do not match.');
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        console.log('[RegisterForm handleSubmit] Client Error: Password too short.');
        setFormError('Password must be at least 6 characters long.');
        return;
    }

    const userData = {
      email,
      password,
      full_name: fullName || null,
    };
    console.log('[RegisterForm handleSubmit] Calling register with:', userData);
    await register(userData); // Hook now manages setting authError or registrationMessage
    console.log('[RegisterForm handleSubmit] register call finished.');
  };

  // --- Log state values on every render ---
  console.log('[RegisterForm Render] State Values:', {
      loading,
      authError, // General auth error (should be null after mount effect)
      registrationMessage, // Specific registration message
      formError // Client-side form error
  });
  // --- End Log ---

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Account</h2>

      {/* Display Registration Success Message */}
      {registrationMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm">
          {console.log('[RegisterForm Render] Rendering SUCCESS message block.')}
          {registrationMessage}
          <p className="mt-2 text-xs">Redirecting to login shortly...</p>
        </div>
      )}

      {/* Display Client-side Form Error */}
      {formError && !registrationMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {console.log('[RegisterForm Render] Rendering CLIENT error block.')}
          {formError}
        </div>
      )}

      {/* Display Backend/Auth Error (Only if not a success and not a client error) */}
      {authError && !registrationMessage && !formError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {console.log('[RegisterForm Render] Rendering AUTH error block.')}
          {authError}
        </div>
      )}

      {/* Conditionally render the form */}
      {!registrationMessage && (
        <form onSubmit={handleSubmit}>
          {console.log('[RegisterForm Render] Rendering FORM block.')}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name (Optional)
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="John Doe"
              disabled={loading} // Disable while loading
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}

      {/* Link to Login Page */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Log in here
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;