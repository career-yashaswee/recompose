'use client';

import {
  UserProfile,
  LearningActivity,
  Performance,
  RecentCompositions,
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
          {/* <ProfileDisplay /> */}

          {/* Learning Activity Card */}
          <LearningActivity />

          {/* Recent Compositions Card */}
          <RecentCompositions />
        </div>
      </div>
    </div>
  );
}
