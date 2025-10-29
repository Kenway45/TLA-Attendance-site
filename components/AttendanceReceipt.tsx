import React from 'react';
import type { AttendanceRecord } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface AttendanceReceiptProps {
  submission: {
    record: AttendanceRecord;
    eventName: string;
  };
  onDone: () => void;
}

export const AttendanceReceipt: React.FC<AttendanceReceiptProps> = ({ submission, onDone }) => {
  const { record, eventName } = submission;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto">
        <div id="receipt-container" className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-center border-b-2 border-dashed border-gray-200 pb-6 mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Attendance Confirmed!</h2>
                <p className="text-gray-500">Here is your receipt.</p>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-center">
                    <img src={record.photo} alt="Participant selfie" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">{record.name}</p>
                    <p className="text-gray-500">{record.regNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-semibold text-gray-600">Event:</span>
                        <span className="text-gray-800 font-medium">{eventName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-600">Arrival Time:</span>
                        <span className="text-gray-800 font-medium">{record.arrivalTime}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 no-print">
            <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg"
            >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download Receipt
            </button>
            <button
                onClick={onDone}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
            >
                Done
            </button>
        </div>
    </div>
  );
};
