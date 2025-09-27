import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BusinessSetup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { updateBusiness } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            businessHours: {
                monday: { start: '09:00', end: '17:00', isOpen: true },
                tuesday: { start: '09:00', end: '17:00', isOpen: true },
                wednesday: { start: '09:00', end: '17:00', isOpen: true },
                thursday: { start: '09:00', end: '17:00', isOpen: true },
                friday: { start: '09:00', end: '17:00', isOpen: true },
                saturday: { start: '10:00', end: '16:00', isOpen: true },
                sunday: { start: '10:00', end: '16:00', isOpen: false }
            },
            roles: [
                { name: 'Cashier', description: 'Handle customer transactions', minStaffRequired: 1, maxStaffRequired: 3, hourlyRate: 15 }
            ],
            constraints: {
                maxHoursPerDay: 8,
                maxHoursPerWeek: 40,
                minBreakTime: 30,
                overtimeThreshold: 8
            }
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'roles'
    });

    const businessHours = watch('businessHours');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // The API call to create or update business setup
            const response = await businessAPI.createOrUpdate(data);
            if (response.success) {
                toast.success('Business setup saved successfully!');
                updateBusiness(response.data);
                navigate('/dashboard');
            } else {
                toast.error(response.message || 'Failed to save business setup');
            }
        } catch (error) {
            toast.error('Server error: ' + (error.message || 'Unable to save business setup'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md">
            <h1 className="text-2xl font-bold mb-6">Business Setup</h1>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <fieldset className="mb-6">
                    <legend className="text-lg font-semibold mb-4">Business Hours</legend>
                    {Object.entries(businessHours).map(([day, { isOpen }]) => (
                        <div key={day} className="flex items-center space-x-4 mb-3">
                            <label className="capitalize font-medium w-24">{day}</label>
                            <input
                                type="checkbox"
                                {...register(`businessHours.${day}.isOpen`)}
                                className="form-checkbox"
                            />
                            {isOpen && (
                                <>
                                    <Input
                                        type="time"
                                        {...register(`businessHours.${day}.start`, { required: isOpen })}
                                        error={errors?.businessHours?.[day]?.start?.message}
                                    />
                                    <span>to</span>
                                    <Input
                                        type="time"
                                        {...register(`businessHours.${day}.end`, { required: isOpen })}
                                        error={errors?.businessHours?.[day]?.end?.message}
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </fieldset>

                <fieldset className="mb-6">
                    <legend className="text-lg font-semibold mb-4">Roles</legend>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-6 gap-4 mb-4 items-center">
                            <Input
                                label="Role Name"
                                {...register(`roles.${index}.name`, { required: 'Role name is required' })}
                                error={errors.roles?.[index]?.name?.message}
                                className="col-span-2"
                            />
                            <Input
                                label="Description"
                                {...register(`roles.${index}.description`)}
                                className="col-span-2"
                            />
                            <Input
                                label="Min Staff"
                                type="number"
                                min={1}
                                {...register(`roles.${index}.minStaffRequired`, { min: 1, valueAsNumber: true })}
                                error={errors.roles?.[index]?.minStaffRequired?.message}
                            />
                            <Input
                                label="Max Staff"
                                type="number"
                                min={1}
                                {...register(`roles.${index}.maxStaffRequired`, { min: 1, valueAsNumber: true })}
                                error={errors.roles?.[index]?.maxStaffRequired?.message}
                            />
                            <Input
                                label="Hourly Rate ($)"
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(`roles.${index}.hourlyRate`, { min: 0, valueAsNumber: true })}
                                error={errors.roles?.[index]?.hourlyRate?.message}
                            />
                            <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => remove(index)}
                            >
                                <TrashIcon className="h-6 w-6" />
                            </button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        onClick={() => append({ name: '', description: '', minStaffRequired: 1, maxStaffRequired: 1, hourlyRate: 15 })}
                        className="mt-2 inline-flex items-center gap-1"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Role
                    </Button>
                </fieldset>

                <fieldset className="mb-6">
                    <legend className="text-lg font-semibold mb-4">Constraints</legend>
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Max Hours per Day"
                            type="number"
                            min={1}
                            {...register('constraints.maxHoursPerDay', { required: 'Required', valueAsNumber: true })}
                            error={errors.constraints?.maxHoursPerDay?.message}
                        />
                        <Input
                            label="Max Hours per Week"
                            type="number"
                            min={1}
                            {...register('constraints.maxHoursPerWeek', { required: 'Required', valueAsNumber: true })}
                            error={errors.constraints?.maxHoursPerWeek?.message}
                        />
                        <Input
                            label="Minimum Break (minutes)"
                            type="number"
                            min={0}
                            {...register('constraints.minBreakTime', { required: 'Required', valueAsNumber: true })}
                            error={errors.constraints?.minBreakTime?.message}
                        />
                        <Input
                            label="Overtime Threshold (hours)"
                            type="number"
                            min={0}
                            {...register('constraints.overtimeThreshold', { required: 'Required', valueAsNumber: true })}
                            error={errors.constraints?.overtimeThreshold?.message}
                        />
                    </div>
                </fieldset>

                <div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Business Setup'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BusinessSetup;
