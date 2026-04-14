import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and privacy policy');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData.name, formData.lastName, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-cream-light min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream-light min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Title */}
        <h1 
          className="text-center text-3xl md:text-4xl mb-8"
          style={{ 
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            color: '#5C3317'
          }}
        >
          Sign up on our website
        </h1>

        {/* Form Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-5">
              <label 
                htmlFor="name" 
                className="block text-sm font-medium mb-2 tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif', color: '#333' }}
              >
                NAME
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
            </div>

            {/* Last Name Field */}
            <div className="mb-5">
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium mb-2 tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif', color: '#333' }}
              >
                LASTNAME
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
            </div>

            {/* Email Field */}
            <div className="mb-5">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2 tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif', color: '#333' }}
              >
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-5">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2 tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif', color: '#333' }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-5">
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium mb-2 tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif', color: '#333' }}
              >
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary"
                />
                <span style={{ fontFamily: 'Inter, sans-serif', color: '#666', fontSize: '14px' }}>
                  Accept our{' '}
                  <Link to="/terms" className="text-primary hover:underline">terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">privacy policy</Link>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                background: 'linear-gradient(to right, #8B4513, #5C3317)',
                letterSpacing: '1px'
              }}
            >
              {isSubmitting ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
