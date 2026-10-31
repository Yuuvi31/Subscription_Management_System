import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, role } = useAuth();
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
      email: 'admin@brightloop.io',
      password: 'Password@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    const result = await login(data.email, data.password);
    if (result.success) {
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'STAFF') navigate('/staff/dashboard');
      else navigate('/customer/overview');
    } else {
      setAuthError(result.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleQuickFill = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password@123');
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
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
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
                  Forgot your password?
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

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 text-center">
              Quick Sign-in Presets
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@brightloop.io')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-border rounded text-[11px] font-medium text-text-primary text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('alex.staff@brightloop.io')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-border rounded text-[11px] font-medium text-text-primary text-center"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('marcus@apexlogistics.com')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-border rounded text-[11px] font-medium text-text-primary text-center"
              >
                Customer
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
              Sign up as customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
