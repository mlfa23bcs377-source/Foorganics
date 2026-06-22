import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, CreateOrderResult } from '../services/orderService';
import { CheckoutData, PaymentMethod } from '../types';
import { useToast } from '../context/ToastContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

type AuthMode = 'choose' | 'login' | 'guest';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const { addToast } = useToast();
  const { session, login } = useCustomerAuth();

  // step 0 = auth choice (guest/login), step 1 = delivery, step 2 = payment
  const [step, setStep] = useState<0 | 1 | 2>(session ? 1 : 0);
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [guestEmail, setGuestEmail] = useState('');

  const [formData, setFormData] = useState<CheckoutData>({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  // Login inline fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Pre-fill form when customer is logged in
  useEffect(() => {
    if (session?.customer) {
      setFormData((f) => ({
        ...f,
        fullName: session.customer.fullName || f.fullName,
        phoneNumber: session.customer.phone || f.phoneNumber,
      }));
      // If they just logged in mid-checkout, jump to step 1
      setStep(1);
    }
  }, [session]);

  const tax = state.total * 0.08;
  const grandTotal = state.total + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      // useEffect above will advance step to 1
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card_mock' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      addToast('Please fill in all card details', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await createOrder(
        formData.fullName,
        formData.phoneNumber,
        formData.address,
        paymentMethod,
        state.items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        {
          customerId: session?.customer.id,
          guestEmail: !session ? guestEmail : undefined,
        }
      );
      setOrderResult(result);
      clearCart();
      addToast('Order placed successfully!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to place order';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0 && !orderResult) {
    navigate('/cart');
    return null;
  }

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (orderResult) {
    return (
      <div className="min-h-screen bg-earth-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-earth-900 mb-2">Order Placed!</h1>

            {orderResult.orderNumber && (
              <div className="mb-4">
                <p className="text-earth-600 text-sm">Order Number</p>
                <p className="text-xl font-bold text-organic-700">{orderResult.orderNumber}</p>
              </div>
            )}
            {orderResult.trackingNumber && (
              <div className="mb-4">
                <p className="text-earth-600 text-sm">Tracking Number</p>
                <p className="text-lg font-mono text-stone-700">{orderResult.trackingNumber}</p>
              </div>
            )}

            <p className="text-earth-600 mb-6">
              Payment: {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Demo Card (paid)'}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {orderResult.trackingNumber && (
                <Link
                  to={`/track?id=${orderResult.trackingNumber}`}
                  className="btn-primary"
                >
                  Track My Order
                </Link>
              )}
              {session && (
                <Link to="/account/orders" className="btn-secondary">
                  View My Orders
                </Link>
              )}
              <button onClick={() => navigate('/')} className="btn-secondary">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step breadcrumbs ─────────────────────────────────────────────────────
  const stepLabels = session
    ? ['1. Delivery', '2. Payment']
    : ['1. Account', '2. Delivery', '3. Payment'];

  const currentStepIdx = session ? step - 1 : step;

  return (
    <div className="min-h-screen bg-earth-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Checkout</h1>
        <div className="flex gap-4 mb-8 text-sm flex-wrap">
          {stepLabels.map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="text-earth-300">→</span>}
              <span className={i === currentStepIdx ? 'text-organic-600 font-medium' : 'text-earth-400'}>
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* ─── Step 0: Guest / Login ─────────────────────────────────── */}
            {step === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {authMode === 'choose' && (
                  <>
                    <h2 className="text-xl font-bold text-earth-900 mb-2">How would you like to continue?</h2>
                    <p className="text-earth-500 text-sm mb-6">Sign in for faster checkout and order tracking, or continue as a guest.</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => setAuthMode('login')}
                        className="w-full text-left border-2 border-organic-500 rounded-xl p-4 hover:bg-organic-50 transition-colors"
                      >
                        <p className="font-semibold text-earth-900">Sign In to My Account</p>
                        <p className="text-sm text-earth-500 mt-0.5">Track your order, view history, faster checkout</p>
                      </button>
                      <Link
                        to="/register"
                        state={{ returnTo: '/checkout' }}
                        className="block w-full text-left border border-earth-300 rounded-xl p-4 hover:bg-earth-50 transition-colors"
                      >
                        <p className="font-semibold text-earth-900">Create an Account</p>
                        <p className="text-sm text-earth-500 mt-0.5">New here? Register for free</p>
                      </Link>
                      <button
                        onClick={() => { setAuthMode('guest'); setStep(1); }}
                        className="w-full text-left border border-earth-300 rounded-xl p-4 hover:bg-earth-50 transition-colors"
                      >
                        <p className="font-semibold text-earth-900">Continue as Guest</p>
                        <p className="text-sm text-earth-500 mt-0.5">No account required, enter your details below</p>
                      </button>
                    </div>
                  </>
                )}

                {authMode === 'login' && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <button onClick={() => setAuthMode('choose')} className="text-earth-400 hover:text-earth-600">
                        ←
                      </button>
                      <h2 className="text-xl font-bold text-earth-900">Sign In</h2>
                    </div>
                    {loginError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{loginError}</div>
                    )}
                    <form onSubmit={handleInlineLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-earth-700 mb-1">Email</label>
                        <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500 text-earth-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-earth-700 mb-1">Password</label>
                        <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500 text-earth-900" />
                      </div>
                      <button type="submit" disabled={loginLoading}
                        className="w-full btn-primary py-3 disabled:opacity-60">
                        {loginLoading ? 'Signing in...' : 'Sign In & Continue'}
                      </button>
                    </form>
                    <div className="flex justify-between mt-4 text-sm">
                      <button onClick={() => { setAuthMode('guest'); setStep(1); }} className="text-earth-500 hover:underline">
                        Continue as guest instead
                      </button>
                      <Link to="/forgot-password" className="text-organic-600 hover:underline">Forgot password?</Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── Step 1: Delivery ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-earth-900 mb-6">Delivery Information</h2>
                {session && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-800">
                    Signed in as <strong>{session.customer.email}</strong>
                  </div>
                )}
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-2">Full Name *</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                      placeholder="Ahmed Khan" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-2">Phone Number *</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                      placeholder="+92-300-1234567" />
                  </div>

                  {!session && (
                    <div>
                      <label className="block text-sm font-medium text-earth-700 mb-2">Email (optional, for order updates)</label>
                      <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                        placeholder="you@example.com" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-2">Delivery Address *</label>
                    <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required rows={3}
                      className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-organic-500"
                      placeholder="123 Main Street, City" />
                  </div>

                  <button type="submit" className="w-full btn-primary text-lg py-3">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* ─── Step 2: Payment ──────────────────────────────────────── */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-earth-900 mb-6">Payment Method</h2>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-earth-50">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')} className="mr-3" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-earth-500">Pay when your order arrives</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-earth-50">
                      <input type="radio" name="payment" value="card_mock" checked={paymentMethod === 'card_mock'}
                        onChange={() => setPaymentMethod('card_mock')} className="mr-3" />
                      <div>
                        <p className="font-medium">Demo Card (Lab Demo)</p>
                        <p className="text-sm text-earth-500">Simulated card payment for demo</p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'card_mock' && (
                    <div className="space-y-3 p-4 bg-earth-50 rounded-lg">
                      <input type="text" placeholder="Card Number (4242 4242 4242 4242)"
                        value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-4 py-2 border border-earth-300 rounded-lg" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM/YY" value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="px-4 py-2 border border-earth-300 rounded-lg" />
                        <input type="text" placeholder="CVV" value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="px-4 py-2 border border-earth-300 rounded-lg" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary py-3">Back</button>
                    <button type="submit" disabled={loading} className="flex-1 btn-primary text-lg py-3 disabled:opacity-50">
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-earth-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-earth-600">{item.name} x {item.quantity}</span>
                    <span className="text-earth-900">₨{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-4 border-t border-earth-200 pt-4">
                <div className="flex justify-between text-earth-600">
                  <span>Subtotal</span><span>₨{state.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-earth-600">
                  <span>Delivery</span><span>Free</span>
                </div>
                <div className="flex justify-between text-earth-600">
                  <span>Tax</span><span>₨{tax.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-earth-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-earth-900">
                  <span>Total</span><span>₨{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
