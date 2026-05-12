import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Check, X, LockKeyhole } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'One number',            test: (p) => /[0-9]/.test(p) },
];

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.password) {
      errs.password = 'Password is required';
    } else {
      const failedRule = PASSWORD_RULES.find((r) => !r.test(form.password));
      if (failedRule) errs.password = failedRule.label;
    }
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset! You can now log in with your new password.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      toast.error(msg);
      if (err.response?.status === 400) {
        setErrors({ password: 'This reset link is invalid or has expired.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <LockKeyhole size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
          <p className="text-gray-500 mt-2">Choose a strong password for your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`${inputClass('password')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}

              {/* Inline rules */}
              {(passwordFocused || form.password) && (
                <ul className="mt-2.5 space-y-1">
                  {PASSWORD_RULES.map(({ label, test }) => {
                    const ok = test(form.password);
                    return (
                      <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        {ok ? <Check size={12} /> : <X size={12} />}
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={`${inputClass('confirmPassword')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {isLoading ? 'Resetting…' : 'Reset Password'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Remember it?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
