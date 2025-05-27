// frontend/src/components/forms/LoginForm.js
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Get login function and state from CONTEXT hook, including setError
  const { login, loading, error: authError, setError } = useAuth(); // <<< Add setError
  const navigate = useNavigate();

  // --- Effect to clear error on mount ---
  useEffect(() => {
    console.log('[LoginForm Mount Effect] Clearing authError state.');
    setError(null); // Clear any previous auth errors when the component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount
  // --- End Effect ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear error before new attempt

    const credentials = { email, password };
    const result = await login(credentials);

    if (result.success) {
      navigate('/'); // Redirect to home page
    }
    // Error display is handled by the authError state
  };

  console.log('[LoginForm Render] authError from useAuth:', authError);

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Log In</h2>
      <form onSubmit={handleSubmit}>
        {/* Display Backend/Auth Error */}
        {authError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {console.log('[LoginForm Render] Rendering authError block with message:', authError)}
            {typeof authError === 'string' ? authError : 'An unknown login error occurred.'}
          </div>
        )}

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
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Register here
        </Link>
      </p>
      <p className="text-center text-sm text-gray-600 mt-2">
        <Link to="/forgot-password" className="text-primary hover:underline font-medium">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;