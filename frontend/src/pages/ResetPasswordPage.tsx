import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/customerAuthService';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { updateCustomer } = useCustomerAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!token) { setError('Reset token missing. Use the link from your reset email.'); return; }

    setSubmitting(true);
    try {
      const result = await resetPassword(token, password, confirmPassword);
      updateCustomer(result.customer);
      setSuccess(true);
      setTimeout(() => navigate('/account'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-organic-800">Foorganic</Link>
          <p className="text-stone-500 mt-1">Choose a new password</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg text-center">
            <p className="font-semibold">Password reset successful!</p>
            <p className="text-sm mt-1">Redirecting you to your account...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
            )}

            {!token && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-6 text-sm">
                Invalid reset link. Please request a new one.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
                  placeholder="Repeat new password"
                />
              </div>
              <button
                type="submit" disabled={submitting || !token}
                className="w-full bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link to="/login" className="text-organic-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

