
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function Notifications() {
  const notifications = [
    {
      id: 'n1',
      title: 'Emergency Backup',
      message: 'Officer Ahmed requesting immediate backup at Central Market location.',
      date: '10 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: 'n2',
      title: 'Incident Report Filed',
      message: 'New incident report #45632 has been filed and needs review.',
      date: '1 hour ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 'n3',
      title: 'Schedule Update',
      message: 'Your duty schedule for next week has been updated.',
      date: '3 hours ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 'n4',
      title: 'System Maintenance',
      message: 'The system will undergo maintenance tonight from 2:00 AM to 4:00 AM.',
      date: 'Yesterday',
      read: true,
      priority: 'low'
    },
    {
      id: 'n5',
      title: 'Training Reminder',
      message: 'Mandatory firearms training scheduled for tomorrow at 9:00 AM.',
      date: '2 days ago',
      read: true,
      priority: 'high'
    },
  ];
  
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline">Mark All as Read</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${getPriorityStyle(notification.priority)} ${!notification.read ? 'bg-blue-50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{notification.title}</CardTitle>
                  <CardDescription>{notification.date}</CardDescription>
                </div>
                {!notification.read && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p>{notification.message}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-0">
              {!notification.read && (
                <Button variant="outline" size="sm">
                  Mark as Read
                </Button>
              )}
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
