export type NotificationStatus = 'High' | 'Moderate' | 'Normal';

export interface Notification {
  id: string;
  patientName: string;
  message: string;
  timestamp: Date;
  status: NotificationStatus;
  isRead: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    patientName: 'John Smith',
    message: 'Blood pressure reading is critically high',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    status: 'High',
    isRead: false,
  },
  {
    id: '2',
    patientName: 'Sarah Johnson',
    message: 'Medication reminder: Take aspirin daily',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    status: 'Moderate',
    isRead: false,
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    message: 'Weekly health check-up completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
    status: 'Normal',
    isRead: true,
  },
  {
    id: '4',
    patientName: 'Emily Davis',
    message: 'Appointment reminder: Tomorrow at 10:00 AM',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000), // 1 day ago
    status: 'Normal',
    isRead: true,
  },
  {
    id: '5',
    patientName: 'David Wilson',
    message: 'Abnormal heart rate detected',
    timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    status: 'High',
    isRead: false,
  },
];
