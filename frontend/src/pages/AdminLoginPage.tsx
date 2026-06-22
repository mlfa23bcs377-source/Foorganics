import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, login } = useAdminAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (session) navigate('/labadmin/dashboard');
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : 'Invalid credentials');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-organic-100">
            <span className="text-2xl font-bold text-organic-700">F</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-earth-900">Admin Login</h2>
          <p className="mt-2 text-sm text-earth-600">Sign in to manage FOORGANICS</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-organic-500 focus:border-organic-500"
              placeholder="Admin email"
            />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-organic-500 focus:border-organic-500"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-organic-600 text-white rounded-lg hover:bg-organic-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <a href="/" className="text-organic-600 hover:text-organic-500 text-sm">
              Back to Store
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
