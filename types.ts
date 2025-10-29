
export interface Location {
  lat: number;
  lng: number;
}

export interface AttendanceRecord {
  name: string;
  regNumber: string;
  email: string;
  location: Location;
  photo: string;
  arrivalTime: string;
}

export interface Event {
  id: string;
  name: string;
  location: Location | null;
  radius: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isActive: boolean;
  attendanceLog: AttendanceRecord[];
}
