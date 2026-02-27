import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

// Modal to set up bank details if missing
export const BankSetupModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        bank_account_number: '',
        bank_secret: ''
    });
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useAuth(); // Assuming useAuth exposes setUser to update context
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use centralized api instance which handles baseURL and auth headers
            const response = await api.post('/auth/user/bank-details', formData);
            // Extract the updated user data from the response
            const updatedUser = response.data.data;

            showToast({ type: 'success', title: 'Success', message: 'Bank details linked successfully' });

            // Update local user context if method exists, or force reload/fetch
            if (onSuccess) onSuccess(updatedUser);

            onClose();
        } catch (error) {
            showToast({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || error.message || 'Failed to link bank account'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                <h2 className="text-2xl font-bold mb-2">Setup Bank Account</h2>
                <p className="text-slate-600 mb-6">You need to link a bank account to transact.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bank_account_number">Bank Account Number</Label>
                        <Input
                            id="bank_account_number"
                            name="bank_account_number"
                            value={formData.bank_account_number}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 10005"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bank_secret">Bank Secret</Label>
                        <Input
                            id="bank_secret"
                            name="bank_secret"
                            value={formData.bank_secret}
                            onChange={handleChange}
                            required
                            type="password"
                            placeholder="Bank Secret Key"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        {/* Optional: Allow closing explicitly if users want to browse read-only? 
                Description says "When in home page first time, *needs* to set up". 
                I'll allow closing but maybe nag them? Or maybe make it persistent? 
                For now allow close. */}
                        <Button type="button" variant="outline" onClick={onClose}>Later</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? 'Linking...' : 'Link Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
