import React, { useState } from 'react';
import { UserIcon } from './icons/UserIcon';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  isLoading: boolean;
}

const PasswordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-brand-primary">Admin Login</h2>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="username" className="sr-only">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PasswordIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};