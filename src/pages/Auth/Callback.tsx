import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';


interface UserProfile {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      fetch('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(async data => {
          // Ensure user object always has 'id'
          const userObj = {
            ...(data.user || data),
            id: (data.user || data)._id || (data.user || data).id
          };
          setProfile(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
          await login(userObj.email, token);
          setStatus('success');
          setTimeout(() => navigate('/'), 1200);
        })
        .catch(() => {
          setStatus('error');
          setTimeout(() => navigate('/login'), 1200);
        });
    } else {
      setStatus('error');
      setTimeout(() => navigate('/login'), 1200);
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      {status === 'loading' && <p className="text-blue-700">Authenticating with Google...</p>}
      {status === 'success' && (
        <div className="text-green-600 text-center">
          <p>Login successful!</p>
          {profile && (
            <div className="mt-2">
              <p className="font-bold">Welcome, {profile.name}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          )}
        </div>
      )}
      {status === 'error' && <p className="text-red-600">Login failed. Redirecting...</p>}
    </div>
  );
};
