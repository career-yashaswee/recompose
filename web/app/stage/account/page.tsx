'use client';

import {
  UserProfile,
  LearningActivity,
  Performance,
  EnrolledCourses,
  ProfileDisplay,
} from '@/components/@account';

export default function AccountPage(): React.ReactElement {
  return (
    <div className='space-y-6'>
      <div className='flex gap-6'>
        {/* Left Sidebar - User Profile */}
        <UserProfile />

        {/* Right Content - Dashboard Cards */}
        <div className='flex-1 space-y-6'>
          {/* Profile Display with Edit Functionality */}
          <ProfileDisplay />

          {/* Learning Activity Card */}
          <LearningActivity />

          {/* Performance Card */}
          <Performance />

          {/* Enrolled Courses Card */}
          <EnrolledCourses />
        </div>
      </div>
    </div>
  );
}
