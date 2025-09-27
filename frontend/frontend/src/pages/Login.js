import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError('');
        try {
            const result = await login(data);
            if (result.success) {
                navigate('/dashboard');
            } else if (result.message) {
                setServerError(result.message);
            } else {
                setServerError('Login failed. Please try again.');
            }
        } catch (err) {
            setServerError('Server error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center">
                        <CalendarDaysIcon className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to WorkforcePro
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to="/register"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            create your account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <Input
                            label="Email"
                            type="email"
                            id="email"
                            autoComplete="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value:
                                        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters'
                                }
                            })}
                            error={errors.password?.message}
                        />
                    </div>

                    {serverError && (
                        <div className="text-red-600 text-sm text-center">{serverError}</div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
