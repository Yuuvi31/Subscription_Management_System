import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Building2, AlertCircle } from 'lucide-react';
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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
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
              placeholder="Enter your username or email"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
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

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
              Sign up as new customer
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-text-muted">
          By signing in you agree to the Brightloop Software{' '}
          <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>{' '}
          and{' '}
          <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
