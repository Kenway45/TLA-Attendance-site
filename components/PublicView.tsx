import React from 'react';
import type { Event } from '../types';

interface PublicViewProps {
  event: Event;
}

export const PublicView: React.FC<PublicViewProps> = ({ event }) => {
  const goBack = () => {
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">{event.name}</h1>
            <p className="text-gray-500">Public Attendance Log</p>
          </div>
          <button
            onClick={goBack}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            &larr; Back to App
          </button>
        </header>

        <div className="text-sm text-gray-600 mb-6 border-b pb-4">
            <p><strong>Event Time:</strong> {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}</p>
        </div>

        <div className="overflow-x-auto">
            {event.attendanceLog.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No one has marked their attendance for this event yet.
                </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-600">Reg. Number</th>
                    <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-600">Arrival Time</th>
                    <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-600">Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {event.attendanceLog.map((record, index) => (
                    <tr key={record.regNumber + index}>
                        <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-900">{record.name}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-500">{record.regNumber}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-500">{record.arrivalTime}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-500">
                        <a 
                            href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                            View on Map
                        </a>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <p className="mt-4 text-xs text-gray-500 text-center">
                    For privacy, participant photos and email addresses are not shown on this public view.
                </p>
              </>
            )}
        </div>
      </div>
    </div>
  );
};
