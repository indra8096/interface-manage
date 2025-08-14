'use client';

import { useState } from 'react';
import { useCSRF } from './CSRFProtection';

interface UserCreationFormProps {
  onUserCreated?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function UserCreationForm({ onUserCreated, onError }: UserCreationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'COMPANY_USER',
    companyName: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });
  
  const csrfToken = useCSRF('user-creation-form');

  // === VALIDATION EN TEMPS RÉEL ===
  
  const validatePassword = (password: string) => {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 1;
    else feedback.push('Minimum 8 caractères');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Au moins une majuscule');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Au moins une minuscule');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('Au moins un chiffre');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Au moins un caractère spécial');
    
    // Protection contre les injections
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /exec\s*\(/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(password)) {
        feedback.push('Caractères interdits détectés');
        score = 0;
        break;
      }
    }
    
    return { score, feedback };
  };

  const handlePasswordChange = (password: string) => {
    const validation = validatePassword(password);
    setPasswordStrength(validation);
    
    if (password !== formData.confirmPassword && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Les mots de passe ne correspondent pas' }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    if (field === 'password') {
      handlePasswordChange(value);
    }
    
    if (field === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Les mots de passe ne correspondent pas' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: 'Format d\'email invalide' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validation finale
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
        return;
      }

      if (passwordStrength.score < 4) {
        setErrors({ password: 'Mot de passe trop faible' });
        return;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyName: formData.companyName,
          _csrf: csrfToken
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Succès
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          role: 'COMPANY_USER',
          companyName: ''
        });
        setPasswordStrength({ score: 0, feedback: [] });
        onUserCreated?.(data.user);
      } else {
        // Erreur
        if (data.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ general: data.error });
        }
        onError?.(data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setErrors({ general: 'Erreur de connexion' });
      onError?.('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score >= 4) return 'text-green-500';
    if (passwordStrength.score >= 3) return 'text-yellow-500';
    if (passwordStrength.score >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Créer un utilisateur</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          
          {/* Indicateur de force du mot de passe */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Force:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-full ${
                        level <= passwordStrength.score
                          ? getPasswordStrengthColor().replace('text-', 'bg-')
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                  {passwordStrength.score}/5
                </span>
              </div>
              
              {/* Feedback détaillé */}
              {passwordStrength.feedback.length > 0 && (
                <div className="mt-2 text-sm">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <div key={index} className="text-red-500">• {feedback}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirmation du mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Rôle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rôle *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="COMPANY_USER">Utilisateur</option>
            <option value="COMPANY_ADMIN">Administrateur</option>
          </select>
        </div>

        {/* Nom de l'entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'entreprise
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Laissez vide si pas d'entreprise"
          />
        </div>

        {/* Erreur générale */}
        {errors.general && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading || passwordStrength.score < 4}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading || passwordStrength.score < 4
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Création...' : 'Créer l\'utilisateur'}
        </button>
      </form>
    </div>
  );
}
