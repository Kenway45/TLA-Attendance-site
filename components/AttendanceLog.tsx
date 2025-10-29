
import React from 'react';
import type { AttendanceRecord } from '../types';

interface AttendanceLogProps {
  records: AttendanceRecord[];
  onExport: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const AttendanceLog: React.FC<AttendanceLogProps> = ({ records, onExport, searchTerm, onSearchChange }) => {
  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or reg number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:flex-1 bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-brand-primary"
        />
        <button
          onClick={onExport}
          disabled={records.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-auto h-[calc(100vh-24rem)] min-h-[400px] border border-gray-200 rounded-lg">
      {records.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          {searchTerm ? 'No matching records found.' : 'No attendance records yet.'}
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-600">Photo</th>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-600">Details</th>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Timestamps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {records.map((record) => (
              <tr key={record.regNumber + record.arrivalTime}>
                <td className="whitespace-nowrap py-4 px-3 text-sm">
                  <img src={record.photo} alt="Selfie" className="h-12 w-12 rounded-full object-cover" />
                </td>
                <td className="whitespace-nowrap py-4 px-3 text-sm">
                  <div className="font-medium text-gray-900">{record.name}</div>
                  <div className="text-gray-500">{record.regNumber}</div>
                  <div className="text-gray-500 text-xs">{record.email}</div>
                   <a 
                      href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:text-blue-600 text-xs"
                    >
                      View Location
                    </a>
                </td>
                <td className="whitespace-nowrap py-4 px-3 text-sm hidden md:table-cell">
                  <div className="text-gray-900">
                    <span className="font-semibold text-green-600">In:</span> {record.arrivalTime}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};