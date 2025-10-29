
import React from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface CameraViewProps {
  stream: MediaStream | null;
  photo: string | null;
  onOpenCamera: () => void;
  onTakePhoto: () => void;
  onRetakePhoto: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const CameraView: React.FC<CameraViewProps> = ({
  stream,
  photo,
  onOpenCamera,
  onTakePhoto,
  onRetakePhoto,
  videoRef,
}) => {
  return (
    <div className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
            {photo ? (
                <img src={photo} alt="Participant selfie" className="w-full h-full object-cover" />
            ) : stream ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
            ) : (
                <div className="text-center text-gray-500">
                    <CameraIcon className="h-12 w-12 mx-auto" />
                    <p>Camera is off</p>
                </div>
            )}
        </div>
        <div className="flex space-x-2">
            {!photo && !stream && (
                <button onClick={onOpenCamera} className="w-full flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                    Open Camera
                </button>
            )}
            {stream && !photo && (
                <>
                    <button onClick={onOpenCamera} className="w-full flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                        Close Camera
                    </button>
                    <button onClick={onTakePhoto} className="w-full flex-1 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg transition">
                        Take Photo
                    </button>
                </>
            )}
            {photo && (
                <button onClick={onRetakePhoto} className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-lg transition">
                    Retake Photo
                </button>
            )}
        </div>
    </div>
  );
};