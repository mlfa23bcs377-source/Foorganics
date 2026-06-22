import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function RegisterPage() {
  const { register, session, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo || '/account';

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate(returnTo, { replace: true });
  }, [session, loading, navigate, returnTo]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-organic-800">Foorganic</Link>
          <p className="text-stone-500 mt-1">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
            <input
              type="text" required value={form.fullName} onChange={set('fullName')}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
              placeholder="Ahmed Khan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email" required value={form.email} onChange={set('email')}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone (optional)</label>
            <input
              type="tel" value={form.phone} onChange={set('phone')}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
              placeholder="+92 3xx xxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password" required minLength={6} value={form.password} onChange={set('password')}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password</label>
            <input
              type="password" required value={form.confirmPassword} onChange={set('confirmPassword')}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" state={{ returnTo }} className="text-organic-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

