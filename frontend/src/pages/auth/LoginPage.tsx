import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Building2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: 'admin',
      password: '233135',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    const result = await login(data.identifier, data.password);
    if (result.success) {
      if (result.role === 'ADMIN') navigate('/admin/dashboard');
      else if (result.role === 'STAFF') navigate('/staff/dashboard');
      else navigate('/customer/overview');
    } else {
      setAuthError(result.error || 'Invalid credentials. Please verify your credentials.');
    }
  };

  const handleFillCredentials = (identifier: string, pass: string) => {
    setValue('identifier', identifier);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
          LB
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
          Sign in to LoopBill
        </h2>
        <p className="mt-1 text-xs text-text-secondary flex items-center justify-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> Brightloop Software Subscription Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-border rounded-xl sm:px-10">
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              autoComplete="username"
              placeholder="e.g. admin, x182, or Yuvraj Dutt"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="md"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          {/* Quick-Select Credentials Panel */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Role Credentials
            </p>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillCredentials('admin', '233135')}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-border rounded-md text-left flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-semibold text-text-primary block">Admin</span>
                  <span className="text-[11px] text-text-muted font-mono">user: admin | pass: 233135</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                  Full Access
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('x182', '1234')}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-border rounded-md text-left flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-semibold text-text-primary block">Staff (Operations)</span>
                  <span className="text-[11px] text-text-muted font-mono">user: x182 | pass: 1234</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Staff Access
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('Yuvraj Dutt', 'Yuvraj@2007')}
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-border rounded-md text-left flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-semibold text-text-primary block">Customer (Yuvraj Dutt)</span>
                  <span className="text-[11px] text-text-muted font-mono">user: Yuvraj Dutt | pass: Yuvraj@2007</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Client Portal
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
              Sign up as new customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
