'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, BookOpen, Clock, FileText, TrendingUp, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = {
    totalPassages: 45,
    totalUsers: 1250,
    activeTests: 23,
    pendingReviews: 8,
  };

  const recentActivity = [
    { id: 1, action: 'New reading passage created', time: '2 hours ago', user: 'John Smith' },
    { id: 2, action: 'User completed IELTS test', time: '4 hours ago', user: 'Sarah Johnson' },
    { id: 3, action: 'Passage approved for publication', time: '6 hours ago', user: 'Admin' },
    { id: 4, action: 'New user registration', time: '8 hours ago', user: 'Mike Wilson' },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
          <p className='text-gray-600'>Overview of your IELTS Mate administration</p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Passages</CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalPassages}</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalUsers}</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Tests</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.activeTests}</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-blue-600'>Currently in progress</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending Reviews</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.pendingReviews}</div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-orange-600'>Require attention</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Link href='/admin/reading-passage/create'>
                <Button className='w-full justify-start' variant='outline'>
                  <BookOpen className='h-4 w-4 mr-2' />
                  Create New Reading Passage
                </Button>
              </Link>
              <Link href='/admin/reading-passage'>
                <Button className='w-full justify-start' variant='outline'>
                  <FileText className='h-4 w-4 mr-2' />
                  Manage Reading Passages
                </Button>
              </Link>
              <Link href='/admin/users'>
                <Button className='w-full justify-start' variant='outline'>
                  <Users className='h-4 w-4 mr-2' />
                  Manage Users
                </Button>
              </Link>
              <Link href='/admin/reports'>
                <Button className='w-full justify-start' variant='outline'>
                  <BarChart3 className='h-4 w-4 mr-2' />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className='flex items-center space-x-4'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div className='flex-1 space-y-1'>
                      <p className='text-sm font-medium'>{activity.action}</p>
                      <p className='text-xs text-muted-foreground'>
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                <span className='text-sm'>Database: Online</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                <span className='text-sm'>API: Operational</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                <span className='text-sm'>Storage: 78% Used</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
