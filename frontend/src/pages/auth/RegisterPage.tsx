import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Password requirement validation as explicitly mandated in PDF & prompt:
// - More than eight characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one special character
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company: z.string().min(2, 'Company name is required'),
    email: z.string().email('Please enter a valid business email address'),
    password: z
      .string()
      .min(9, 'Password must be more than 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const currentPassword = watch('password', '');

  const hasLength = currentPassword.length > 8;
  const hasUpper = /[A-Z]/.test(currentPassword);
  const hasLower = /[a-z]/.test(currentPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(currentPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    const result = await signup(data.email, data.password, data.name, data.company);
    if (result.success) {
      navigate('/customer/overview');
    } else {
      setAuthError(result.error || 'Registration failed. Email may already be registered.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
          LB
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
          Create Customer Account
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Access your Brightloop Software subscriptions and billing
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
              label="Full name"
              type="text"
              placeholder="Marcus Vance"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Company name"
              type="text"
              placeholder="Apex Logistics Inc."
              leftIcon={<Building className="w-4 h-4" />}
              error={errors.company?.message}
              {...register('company')}
            />

            <Input
              label="Business email"
              type="email"
              autoComplete="email"
              placeholder="marcus@apexlogistics.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
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

            {/* Live Password Rules Indicator */}
            <div className="p-3 bg-gray-50 border border-border rounded-md text-[11px] space-y-1">
              <span className="font-semibold text-text-secondary block mb-1">
                Security requirements:
              </span>
              <div className={`flex items-center gap-1.5 ${hasLength ? 'text-success' : 'text-text-muted'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> More than 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-success' : 'text-text-muted'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least one uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-success' : 'text-text-muted'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least one lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-success' : 'text-text-muted'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least one special symbol (!@#$%^&*)
              </div>
            </div>

            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="md"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
