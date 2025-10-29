import React from 'react';
import type { Location } from '../types';
import { LocationIcon } from './icons/LocationIcon';
import { UserIcon } from './icons/UserIcon';
import { IdIcon } from './icons/IdIcon';
import { EmailIcon } from './icons/EmailIcon';

interface AttendanceFormProps {
  name: string;
  setName: (name: string) => void;
  regNumber: string;
  setRegNumber: (regNumber: string) => void;
  email: string;
  setEmail: (email: string) => void;
  location: Location | null;
  isLocationValid: boolean;
  isLoading: boolean;
  onGetLocation: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  isEventActive: boolean;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  name,
  setName,
  regNumber,
  setRegNumber,
  email,
  setEmail,
  location,
  isLocationValid,
  isLoading,
  onGetLocation,
  onSubmit,
  isSubmitDisabled,
  isEventActive,
}) => {
  const isEmailValid = email.length === 0 || email.endsWith('@vitstudent.ac.in');

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IdIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Registration Number"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <EmailIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="email"
          placeholder="VIT Student Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full bg-gray-50 border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:border-brand-primary transition ${isEmailValid ? 'border-gray-300' : 'border-red-500 ring-2 ring-red-500'}`}
        />
      </div>
       {!isEmailValid && <p className="text-red-500 text-xs mt-1">Email must end with @vitstudent.ac.in</p>}
      
      <div>
        <button
            onClick={onGetLocation}
            disabled={isLoading || !isEventActive}
            className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <LocationIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Fetching...' : 'Get Live Location'}
        </button>
        {location && (
            <div className={`mt-2 text-center text-sm p-2 rounded-md ${isLocationValid ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                {isLocationValid ? `Location Valid: Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : 'Location rejected.'}
            </div>
        )}
       </div>

      <div className="pt-4 border-t border-gray-200">
        <button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="w-full bg-gradient-to-r from-brand-primary to-blue-500 hover:from-brand-secondary hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
            Submit Attendance
        </button>
      </div>
    </div>
  );
};