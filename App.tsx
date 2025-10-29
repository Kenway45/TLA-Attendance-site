import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { AttendanceRecord, Location, Event } from './types';
import { AttendanceForm } from './components/AttendanceForm';
import { AttendanceLog } from './components/AttendanceLog';
import { CameraView } from './components/CameraView';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { getDistanceFromLatLonInMeters } from './utils/location';
import { PublicView } from './components/PublicView';
import { ShareIcon } from './components/icons/ShareIcon';
import { AttendanceReceipt } from './components/AttendanceReceipt';

type View = 'participant' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('participant');
  
  // Participant form state
  const [name, setName] = useState<string>('');
  const [regNumber, setRegNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocationValid, setIsLocationValid] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Admin state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminSelectedEventId, setAdminSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New Event Creation State
  const [newEventName, setNewEventName] = useState('');
  const [newEventRadius, setNewEventRadius] = useState(100);
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState<Location | null>(null);
  
  // Participant Event Selection
  const [participantSelectedEventId, setParticipantSelectedEventId] = useState<string | null>(null);

  // Global state
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [publicViewEventId, setPublicViewEventId] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{record: AttendanceRecord, eventName: string} | null>(null);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load events from localStorage on initial render
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('attendanceEvents');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.error("Failed to parse events from localStorage", error);
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('attendanceEvents', JSON.stringify(events));
  }, [events]);

  // Public link routing
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#public/')) {
            const eventId = hash.substring('#public/'.length);
            // If events are loaded, validate the ID.
            if (events.length > 0) {
                const eventExists = events.some(e => e.id === eventId);
                if (eventExists) {
                    setPublicViewEventId(eventId);
                } else {
                    showToast('Public event link is invalid or event does not exist.', 'error');
                    window.location.hash = '';
                    setPublicViewEventId(null);
                }
            } else {
                // If events are not loaded yet, optimistically set the ID.
                // The main render logic will show a "loading" state.
                setPublicViewEventId(eventId);
            }
        } else {
            setPublicViewEventId(null);
        }
    };

    handleHashChange(); // Check on initial load
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [events]); // Re-run when events are loaded to validate the hash.

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const handleSetEventLocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setNewEventLocation(location);
        setIsLoading(false);
        showToast('Venue location captured for new event!', 'success');
      },
      (err) => {
        setIsLoading(false);
        showToast(`Error setting location: ${err.message}`, 'error');
      }
    );
  };

  const handleCreateEvent = () => {
    if (!newEventName || !newEventStartTime || !newEventEndTime || !newEventLocation) {
        showToast('Please fill all event fields and set a location.', 'error');
        return;
    }
    const newEvent: Event = {
        id: Date.now().toString(),
        name: newEventName,
        location: newEventLocation,
        radius: newEventRadius,
        startTime: new Date(newEventStartTime).toISOString(),
        endTime: new Date(newEventEndTime).toISOString(),
        isActive: false,
        attendanceLog: [],
    };
    setEvents(prev => [newEvent, ...prev]);
    showToast('Event created successfully!', 'success');
    // Reset form
    setNewEventName('');
    setNewEventRadius(100);
    setNewEventStartTime('');
    setNewEventEndTime('');
    setNewEventLocation(null);
  };

  const handleToggleEventStatus = (eventId: string, status: boolean) => {
      setEvents(events => events.map(event => 
          event.id === eventId ? { ...event, isActive: status } : event
      ));
      showToast(`Event ${status ? 'started' : 'closed'}!`, 'success');
  };
  
  const handleExportCsv = () => {
    const event = events.find(e => e.id === adminSelectedEventId);
    if (!event || event.attendanceLog.length === 0) {
      showToast('No attendance data to export for this event.', 'error');
      return;
    }
  
    const headers = ['Name', 'Registration Number', 'Email', 'Arrival Time', 'Latitude', 'Longitude'];
    const csvRows = [
      headers.join(','),
      ...event.attendanceLog.map(r => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.regNumber}"`,
        `"${r.email}"`,
        `"${r.arrivalTime}"`,
        r.location.lat,
        r.location.lng
      ].join(','))
    ];
  
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_attendance.csv`);
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exporting CSV!', 'success');
  };

  const handleShareEvent = (eventId: string) => {
    const publicUrl = `${window.location.origin}${window.location.pathname}#public/${eventId}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
        showToast('Public link copied to clipboard!', 'success');
    }, () => {
        showToast('Failed to copy link.', 'error');
    });
  };


  const selectedEventForParticipant = events.find(e => e.id === participantSelectedEventId);

  const handleGetLocation = useCallback(() => {
    if (!selectedEventForParticipant?.location) {
        showToast('The selected event does not have a location set.', 'error');
        return;
    }
    const eventLocation = selectedEventForParticipant.location;
    const eventRadius = selectedEventForParticipant.radius;

    setIsLoading(true);
    setLocation(null);
    setIsLocationValid(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        const distance = getDistanceFromLatLonInMeters(
            eventLocation.lat,
            eventLocation.lng,
            userLocation.lat,
            userLocation.lng
        );

        if (distance <= eventRadius) {
            setLocation(userLocation);
            setIsLocationValid(true);
            showToast('Location captured successfully!', 'success');
        } else {
            showToast(`Location does not match the venue. You are ${Math.round(distance)}m away.`, 'error');
        }
        setIsLoading(false);
      },
      (err) => {
        showToast(`Error getting location: ${err.message}`, 'error');
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, [selectedEventForParticipant]);

  const handleOpenCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error accessing camera: ${errorMessage}`, 'error');
    }
  }, [stream]);
  
  const stopCamera = useCallback(() => {
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
      }
  }, [stream]);

  const handleTakePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhoto(dataUrl);
        stopCamera();
        showToast('Selfie captured!', 'success');
      }
    }
  }, [stopCamera]);
  
  const handleRetakePhoto = () => {
      setPhoto(null);
      handleOpenCamera();
  };

  const resetForm = () => {
    setName('');
    setRegNumber('');
    setEmail('');
    setLocation(null);
    setIsLocationValid(false);
    setPhoto(null);
    stopCamera();
  };

  const handleSubmit = () => {
    if (!participantSelectedEventId) return;
    if (!name || !regNumber || !email || !location || !photo || !isLocationValid) {
      showToast('Please fill all fields, get a valid location, and take a photo.', 'error');
      return;
    }
    if (!email.endsWith('@vitstudent.ac.in')) {
      showToast('Please use a valid VIT student email.', 'error');
      return;
    }

    const event = events.find(e => e.id === participantSelectedEventId);
    if(!event) return;

    if(event.attendanceLog.some(record => record.regNumber === regNumber)) {
      showToast('This registration number has already submitted attendance for this event.', 'error');
      return;
    }

    const newRecord: AttendanceRecord = {
      name,
      regNumber,
      email,
      location,
      photo,
      arrivalTime: new Date().toLocaleString(),
    };

    setEvents(events => events.map(event => 
        event.id === participantSelectedEventId ? 
        { ...event, attendanceLog: [newRecord, ...event.attendanceLog] } : 
        event
    ));
    showToast('Attendance submitted successfully!', 'success');
    
    setLastSubmission({ record: newRecord, eventName: event.name });
    resetForm();
  };
  
  const handleReceiptDone = () => {
    setLastSubmission(null);
    setParticipantSelectedEventId(null); // Go back to event list
  };
  
  const handleLogin = (user: string, pass: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (user === 'tla@vit.ac.in' && pass === 'tla@vit.ac.in') {
        setIsAdminAuthenticated(true);
        showToast('Login successful!', 'success');
      } else {
        showToast('Invalid username or password.', 'error');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    showToast('You have been logged out.', 'success');
  };
  
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const activeEvents = events.filter(e => {
      const now = new Date();
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);
      return e.isActive && now >= start && now <= end;
  });

  const selectedEventForAdmin = events.find(e => e.id === adminSelectedEventId);
  const filteredLogs = selectedEventForAdmin?.attendanceLog.filter(record => 
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  if (publicViewEventId) {
    const event = events.find(e => e.id === publicViewEventId);
    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Loading event...</p>
            </div>
        )
    }
    return <PublicView event={event} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">
            Live Attendance Tracker
          </h1>
           <div className="mt-4 flex justify-center bg-white p-1 rounded-full w-fit mx-auto border border-gray-200 shadow-sm">
             <button
               onClick={() => { setCurrentView('participant'); setParticipantSelectedEventId(null); resetForm(); }}
               className={`px-6 py-2 rounded-full transition-all duration-300 ${currentView === 'participant' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               Participant
             </button>
             <button
               onClick={() => setCurrentView('admin')}
               className={`px-6 py-2 rounded-full transition-all duration-300 ${currentView === 'admin' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               Admin
             </button>
           </div>
        </header>
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {currentView === 'participant' && (
            <main className="max-w-4xl mx-auto">
                {lastSubmission ? (
                  <AttendanceReceipt submission={lastSubmission} onDone={handleReceiptDone} />
                ) : !participantSelectedEventId ? (
                     <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-brand-primary">Select an Event</h2>
                        {activeEvents.length > 0 ? (
                            <div className="space-y-4">
                                {activeEvents.map(event => (
                                    <button 
                                        key={event.id}
                                        onClick={() => setParticipantSelectedEventId(event.id)}
                                        className="w-full text-left p-4 bg-gray-50 hover:bg-blue-100 border border-gray-200 rounded-lg transition"
                                    >
                                        <p className="font-semibold text-lg text-gray-800">{event.name}</p>
                                        <p className="text-sm text-gray-500">Ends: {new Date(event.endTime).toLocaleString()}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg">
                                There are no active events at the moment. Please check back later.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-primary">Mark Attendance</h2>
                                <p className="text-gray-600 font-semibold">{selectedEventForParticipant?.name}</p>
                            </div>
                            <button onClick={() => {setParticipantSelectedEventId(null); resetForm();}} className="text-sm text-brand-primary hover:underline">
                                &larr; Change Event
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <AttendanceForm
                                name={name}
                                setName={setName}
                                regNumber={regNumber}
                                setRegNumber={setRegNumber}
                                email={email}
                                setEmail={setEmail}
                                location={location}
                                isLocationValid={isLocationValid}
                                isLoading={isLoading}
                                onGetLocation={handleGetLocation}
                                onSubmit={handleSubmit}
                                isSubmitDisabled={!name || !regNumber || !email.endsWith('@vitstudent.ac.in') || !location || !photo || !isLocationValid}
                                isEventActive={!!selectedEventForParticipant}
                            />
                            <CameraView 
                                stream={stream}
                                photo={photo}
                                onOpenCamera={handleOpenCamera}
                                onTakePhoto={handleTakePhoto}
                                onRetakePhoto={handleRetakePhoto}
                                videoRef={videoRef}
                            />
                        </div>
                    </div>
                )}
            </main>
        )}

        {currentView === 'admin' && (
          !isAdminAuthenticated ? (
            <LoginScreen onLogin={handleLogin} isLoading={isLoading} />
          ) : (
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-brand-primary">Admin Panel</h2>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-100 px-3 py-2 rounded-lg transition"
                            >
                                <LogoutIcon className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                           <input value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder="Event Name" className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-brand-primary"/>
                           <input type="number" value={newEventRadius} onChange={e => setNewEventRadius(Number(e.target.value))} placeholder="Radius (m)" className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-brand-primary"/>
                           <input type="datetime-local" value={newEventStartTime} onChange={e => setNewEventStartTime(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-brand-primary" title="Start Time"/>
                           <input type="datetime-local" value={newEventEndTime} onChange={e => setNewEventEndTime(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-brand-primary" title="End Time"/>
                           <button onClick={handleSetEventLocation} disabled={isLoading} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-lg transition"> {isLoading ? 'Getting...' : 'Set Location'} </button>
                           {newEventLocation && <p className="text-xs text-center text-green-600">Location Set: {newEventLocation.lat.toFixed(4)}, {newEventLocation.lng.toFixed(4)}</p>}
                           <button onClick={handleCreateEvent} className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg transition">Create Event</button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Events ({events.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {events.map(event => (
                                <div key={event.id} className={`p-3 rounded-lg border ${adminSelectedEventId === event.id ? 'bg-blue-100 border-brand-primary' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex justify-between items-center gap-2">
                                        <button onClick={() => setAdminSelectedEventId(prevId => prevId === event.id ? null : event.id)} className="text-left flex-1">
                                            <p className="font-semibold">{event.name}</p>
                                            <p className="text-xs text-gray-500">{event.attendanceLog.length} attendees</p>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleShareEvent(event.id)} title="Copy public link" className="p-1.5 text-gray-500 hover:text-brand-primary hover:bg-blue-100 rounded-full transition">
                                                <ShareIcon className="h-5 w-5" />
                                            </button>
                                            {event.isActive ? 
                                            <button onClick={() => handleToggleEventStatus(event.id, false)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md hover:bg-red-200">Close</button> :
                                            <button onClick={() => handleToggleEventStatus(event.id, true)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200">Start</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    {selectedEventForAdmin ? (
                        <>
                            <h2 className="text-2xl font-bold mb-1 text-brand-primary">Attendance Log</h2>
                            <p className="mb-6 text-gray-600 font-semibold">{selectedEventForAdmin.name}</p>
                            <AttendanceLog 
                                records={filteredLogs}
                                onExport={handleExportCsv}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Select an event to view its attendance log.</p>
                        </div>
                    )}
                 </div>
            </main>
          )
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default App;