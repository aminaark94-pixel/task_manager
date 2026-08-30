/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface ParentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

// Simple 5-digit PIN (Mom & Dad ke liye same)
const PARENT_PIN = "12345";

export function ParentLoginModal({ isOpen, onClose, onLoginSuccess }: ParentLoginModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 5); // Max 5 digits
    setPin(value);
    setError(''); // Clear error when typing
  };

  const handleLogin = () => {
    if (pin === PARENT_PIN) {
      setPin('');
      setError('');
      onLoginSuccess();
      onClose();
    } else {
      setError('❌ PIN galat hai! 5-digit code dobara try karo.');
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Parent Login</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6">
          👨‍👩‍👧‍👦 Admin features ko access karne ke liye 5-digit PIN enter karo. (Sirf Mom aur Dad ke liye)
        </p>

        {/* PIN Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            5-Digit PIN Code
          </label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={handlePinChange}
              onKeyPress={handleKeyPress}
              placeholder="• • • • •"
              maxLength={5}
              className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm font-medium"
            >
              {showPin ? '🙈 Hide' : '👁️ Show'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-bold">💡 Note:</span> PIN default = <span className="font-mono font-bold">12345</span>
            <br />
            Baad mein customize kar sakte ho.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            disabled={pin.length !== 5}
            className={`flex-1 px-4 py-3 font-semibold rounded-lg transition ${
              pin.length === 5
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Login
          </button>
        </div>

        {/* Hint for testing */}
        <p className="text-xs text-slate-400 text-center mt-4">
          🧪 Testing PIN: 12345
        </p>
      </div>
    </div>
  );
}
