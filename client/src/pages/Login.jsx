import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Phone, ArrowRight, Shield, Loader2 } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [step, setStep] = useState('phone'); // phone | otp | profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.sendOTP(phone);
      setDevOtp(res.data.dev_otp || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.verifyOTP(phone, otp, name || undefined, uid || undefined);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  const demoLogin = async (demoPhone) => {
    setLoading(true); setError('');
    try {
      await authAPI.sendOTP(demoPhone);
      const res = await authAPI.verifyOTP(demoPhone, '123456');
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError('Demo login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-gradient-orb orb-1"></div>
        <div className="login-gradient-orb orb-2"></div>
        <div className="login-gradient-orb orb-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card glass">
          <div className="login-header">
            <div className="login-logo">🍽️</div>
            <h1>Campus<span>Serve</span></h1>
            <p>Chandigarh University Food Ordering Platform</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input className="input" type="tel" placeholder="Enter 10-digit number"
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    maxLength={15} autoFocus />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name (optional)</label>
                <input className="input" type="text" placeholder="Your name"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">UID (optional, for campus users)</label>
                <input className="input" type="text" placeholder="e.g. 22BCS12345"
                  value={uid} onChange={(e) => setUid(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <Loader2 size={20} className="spin" /> : <><span>Send OTP</span><ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <p className="text-sm text-secondary" style={{ textAlign: 'center', marginBottom: 8 }}>
                OTP sent to <strong className="text-primary">{phone}</strong>
              </p>
              {devOtp && (
                <div className="dev-otp-hint">
                  <Shield size={14} /> Dev Mode OTP: <strong>{devOtp}</strong>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input className="input otp-input" type="text" placeholder="● ● ● ● ● ●"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6} autoFocus style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.3rem' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <Loader2 size={20} className="spin" /> : <><span>Verify & Login</span><ArrowRight size={18} /></>}
              </button>
              <button type="button" className="btn btn-ghost btn-full" onClick={() => { setStep('phone'); setOtp(''); }}>
                ← Change Number
              </button>
            </form>
          )}

          <div className="login-divider"><span>Quick Demo Login</span></div>

          <div className="demo-buttons">
            <button className="demo-btn" onClick={() => demoLogin('9000000004')} disabled={loading}>
              <span className="demo-icon">👤</span> Student
            </button>
            <button className="demo-btn" onClick={() => demoLogin('9000000002')} disabled={loading}>
              <span className="demo-icon">🏪</span> Vendor
            </button>
            <button className="demo-btn" onClick={() => demoLogin('9000000003')} disabled={loading}>
              <span className="demo-icon">🚴</span> Delivery
            </button>
            <button className="demo-btn" onClick={() => demoLogin('9000000001')} disabled={loading}>
              <span className="demo-icon">🛡️</span> Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
