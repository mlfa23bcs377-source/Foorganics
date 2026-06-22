import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/customerAuthService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; resetUrl?: string; dev_note?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-organic-800">Foorganic</Link>
          <p className="text-stone-500 mt-1">Reset your password</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              {result.message}
            </div>

            {result.resetUrl && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-amber-800 mb-2">Development Mode — Reset Link:</p>
                <p className="text-amber-700 text-xs mb-3">{result.dev_note}</p>
                <Link
                  to={`/reset-password?token=${new URL(result.resetUrl).searchParams.get('token')}`}
                  className="inline-block bg-organic-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-organic-700 transition-colors"
                >
                  Reset Password Now
                </Link>
              </div>
            )}

            <Link to="/login" className="block text-center text-sm text-organic-600 hover:underline mt-4">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-stone-600 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit" disabled={submitting}
                className="w-full bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center text-sm text-stone-500 mt-6">
              <Link to="/login" className="text-organic-600 hover:underline">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

