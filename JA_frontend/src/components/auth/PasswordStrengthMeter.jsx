/**
 * Password Strength Meter Component
 * Visual feedback for password requirements
 */

import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {Object} Strength info
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: '', checks: getChecks('') };
  }

  const checks = getChecks(password);
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = passedChecks;

  const labels = {
    0: '',
    1: 'Very Weak',
    2: 'Weak',
    3: 'Fair',
    4: 'Good',
    5: 'Strong',
  };

  return {
    score,
    label: labels[score] || '',
    checks,
    percentage: (score / 5) * 100,
  };
}

/**
 * Get password validation checks
 * @param {string} password - Password to check
 * @returns {Object} Check results
 */
function getChecks(password) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[$#@!]/.test(password),
  };
}

/**
 * Password Strength Bar Component
 */
export function PasswordStrengthBar({ password }) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const colors = {
    0: 'bg-dark-600',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-lime-500',
    5: 'bg-accent-500',
  };

  const textColors = {
    0: 'text-dark-400',
    1: 'text-red-400',
    2: 'text-orange-400',
    3: 'text-yellow-400',
    4: 'text-lime-400',
    5: 'text-accent-400',
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              strength.score >= level ? colors[strength.score] : 'bg-dark-700'
            }`}
          />
        ))}
      </div>
      
      {/* Label */}
      <p className={`text-xs font-medium ${textColors[strength.score]}`}>
        {strength.label}
      </p>
    </div>
  );
}

/**
 * Password Requirements Checklist
 */
export function PasswordRequirements({ password, showAll = false }) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const requirements = [
    { key: 'minLength', label: 'At least 8 characters' },
    { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
    { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
    { key: 'hasNumber', label: 'One number (0-9)' },
    { key: 'hasSpecial', label: 'One special character ($#@!)' },
  ];

  // Only show if password has been entered or showAll is true
  if (!password && !showAll) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-dark-400 mb-2">Password requirements:</p>
      <ul className="space-y-1.5">
        {requirements.map(({ key, label }) => {
          const passed = strength.checks[key];
          const showItem = showAll || password.length > 0;
          
          if (!showItem) return null;

          return (
            <li
              key={key}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                passed ? 'text-accent-400' : 'text-dark-400'
              }`}
            >
              {passed ? (
                <Check className="w-3.5 h-3.5 text-accent-400" />
              ) : (
                <X className="w-3.5 h-3.5 text-dark-500" />
              )}
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Combined Password Strength Meter
 */
export default function PasswordStrengthMeter({ password, showRequirements = true }) {
  return (
    <div>
      <PasswordStrengthBar password={password} />
      {showRequirements && <PasswordRequirements password={password} />}
    </div>
  );
}

