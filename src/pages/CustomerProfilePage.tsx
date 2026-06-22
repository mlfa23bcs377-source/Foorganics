import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import {
  updateCustomerProfile, changeCustomerPassword, uploadCustomerProfileImage,
  addAddress, deleteAddress,
} from '../services/customerService';
import { CustomerAddress } from '../types';

export default function CustomerProfilePage() {
  const { session, logout, updateCustomer } = useCustomerAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'info' | 'password' | 'addresses'>('info');

  // Info form
  const [infoForm, setInfoForm] = useState({ fullName: '', phone: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [infoError, setInfoError] = useState('');

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  // Address form
  const [addrForm, setAddrForm] = useState({ title: 'Home', address: '', city: '', state: '', postalCode: '', country: 'Pakistan' });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);

  // Image
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    if (!session) { navigate('/login', { state: { returnTo: '/account/profile' } }); return; }
    setInfoForm({ fullName: session.customer.fullName, phone: session.customer.phone || '' });
  }, [session, navigate]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(''); setInfoError('');
    setInfoSaving(true);
    try {
      const updated = await updateCustomerProfile({ fullName: infoForm.fullName, phone: infoForm.phone });
      updateCustomer(updated);
      setInfoMsg('Profile updated successfully.');
    } catch (err: any) {
      setInfoError(err?.response?.data?.message || 'Update failed.');
    } finally { setInfoSaving(false); }
  };

  const handlePwSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(''); setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await changeCustomerPassword(pwForm.currentPassword, pwForm.newPassword, pwForm.confirmPassword);
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Password change failed.');
    } finally { setPwSaving(false); }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const url = await uploadCustomerProfileImage(file);
      if (session) updateCustomer({ ...session.customer, profileImage: url });
    } catch { } finally { setImgUploading(false); }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrSaving(true);
    try {
      const updated = await addAddress(addrForm);
      updateCustomer(updated);
      setShowAddrForm(false);
      setAddrForm({ title: 'Home', address: '', city: '', state: '', postalCode: '', country: 'Pakistan' });
    } catch { } finally { setAddrSaving(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const updated = await deleteAddress(id);
      updateCustomer(updated);
    } catch { }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-organic-500 text-stone-800 text-sm';

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-organic-800">Foorganic</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/account" className="text-stone-600 hover:text-stone-800">Dashboard</Link>
            <Link to="/account/orders" className="text-stone-600 hover:text-stone-800">My Orders</Link>
            <Link to="/track" className="text-stone-600 hover:text-stone-800">Track Order</Link>
            <Link to="/account/profile" className="text-organic-700 font-semibold border-b-2 border-organic-500 pb-0.5">Profile</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 hidden sm:block">{session?.customer.fullName}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">My Profile</h1>

        {/* Avatar */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-organic-100 flex items-center justify-center overflow-hidden text-3xl font-bold text-organic-700">
              {session?.customer.profileImage
                ? <img src={session.customer.profileImage} alt="" className="w-full h-full object-cover" />
                : (session?.customer.fullName?.[0] || 'U')}
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-stone-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-50">
              {imgUploading ? <span className="text-xs">...</span> : <span className="text-xs">✏</span>}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-lg">{session?.customer.fullName}</p>
            <p className="text-stone-400 text-sm">{session?.customer.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1">
          {(['info', 'password', 'addresses'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${tab === t ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {t === 'info' ? 'Personal Info' : t === 'password' ? 'Password' : 'Addresses'}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {tab === 'info' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Personal Information</h2>
            {infoMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{infoMsg}</div>}
            {infoError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{infoError}</div>}
            <form onSubmit={handleInfoSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input type="text" required value={infoForm.fullName} onChange={(e) => setInfoForm(f => ({ ...f, fullName: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input type="email" value={session?.customer.email || ''} disabled className={`${inputCls} bg-stone-50 text-stone-400`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                <input type="tel" value={infoForm.phone} onChange={(e) => setInfoForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+92 3xx xxxxxxx" />
              </div>
              <button type="submit" disabled={infoSaving}
                className="bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
                {infoSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Change Password</h2>
            {pwMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{pwMsg}</div>}
            {pwError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{pwError}</div>}
            <form onSubmit={handlePwSave} className="space-y-4">
              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((k) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {k === 'currentPassword' ? 'Current Password' : k === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <input type="password" required value={pwForm[k]}
                    onChange={(e) => setPwForm(f => ({ ...f, [k]: e.target.value }))} className={inputCls} placeholder="••••••••" />
                </div>
              ))}
              <button type="submit" disabled={pwSaving}
                className="bg-organic-600 hover:bg-organic-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
                {pwSaving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {tab === 'addresses' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-stone-800">Saved Addresses</h2>
              <button onClick={() => setShowAddrForm(!showAddrForm)}
                className="text-sm text-organic-600 font-medium hover:underline">
                {showAddrForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {showAddrForm && (
              <form onSubmit={handleAddAddress} className="bg-stone-50 rounded-xl p-5 mb-6 space-y-3 border border-stone-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-600 mb-1">Label</label>
                    <input type="text" value={addrForm.title} onChange={(e) => setAddrForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="Home, Work, etc." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-stone-600 mb-1">Address</label>
                    <input type="text" required value={addrForm.address} onChange={(e) => setAddrForm(f => ({ ...f, address: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">City</label>
                    <input type="text" required value={addrForm.city} onChange={(e) => setAddrForm(f => ({ ...f, city: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Postal Code</label>
                    <input type="text" value={addrForm.postalCode} onChange={(e) => setAddrForm(f => ({ ...f, postalCode: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <button type="submit" disabled={addrSaving}
                  className="bg-organic-600 text-white text-sm px-5 py-2 rounded-lg disabled:opacity-60">
                  {addrSaving ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            )}

            {(!session?.customer.addresses || session.customer.addresses.length === 0) ? (
              <p className="text-stone-400 text-sm py-6 text-center">No saved addresses yet.</p>
            ) : (
              <div className="space-y-3">
                {session.customer.addresses.map((addr: CustomerAddress) => (
                  <div key={addr.id} className="border border-stone-200 rounded-xl p-4 flex justify-between items-start">
                    <div className="text-sm">
                      <p className="font-medium text-stone-700">{addr.title}</p>
                      <p className="text-stone-500 mt-0.5">{addr.address}</p>
                      <p className="text-stone-400">{addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''}</p>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

