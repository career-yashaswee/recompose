'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit3,
  User,
  MapPin,
  Calendar,
  Link,
  Briefcase,
  GraduationCap,
  Code,
} from 'lucide-react';
import { useProfile } from '@/hooks/api/use-profile';
import { EditProfileForm } from './edit-profile-form';

interface ProfileDisplayProps {
  className?: string;
}

export function ProfileDisplay({
  className,
}: ProfileDisplayProps): React.ReactElement {
  const { data: profile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-6 space-y-6 ${className || ''}`}>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='space-y-4'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='flex justify-between items-center'>
                <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                <div className='h-8 bg-gray-200 rounded w-16'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className || ''}`}>
        <p className='text-gray-500'>Failed to load profile</p>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const ProfileField = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string | null;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className='flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0'>
      <div className='flex items-center gap-3 flex-1'>
        <div className='w-6 flex justify-center'>
          {Icon && <Icon className='w-4 h-4 text-gray-500' />}
        </div>
        <span className='text-sm font-medium text-gray-700 min-w-0 flex-1'>
          {label}
        </span>
      </div>
      <div className='flex-1'>
        <span className='text-sm text-gray-900 truncate'>
          {value || <span className='text-gray-400 italic'>Not provided</span>}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className={`bg-white rounded-lg p-6 space-y-6 ${className || ''}`}>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Basic Info</h2>
          <Button
            onClick={() => setIsEditing(true)}
            className='bg-blue-500 hover:bg-blue-600 text-white'
          >
            <Edit3 className='w-4 h-4 mr-2' />
            Edit Profile
          </Button>
        </div>

        {/* Basic Info Section */}
        <div className='space-y-1'>
          <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2 mb-6'>
            <User className='w-5 h-5' />
            Basic Info
          </h3>

          {/* Name - Full width */}
          <ProfileField label='Name' value={profile.name} icon={User} />

          {/* Gender and Birthday - Side by side */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-0'>
            <div className='border-b border-gray-100 md:border-r md:border-b-0'>
              <ProfileField label='Gender' value={profile.gender} />
            </div>
            <div className='border-b border-gray-100'>
              <ProfileField
                label='Birthday'
                value={formatDate(profile.birthday)}
                icon={Calendar}
              />
            </div>
          </div>

          <ProfileField
            label='Location'
            value={profile.location}
            icon={MapPin}
          />
          <ProfileField label='Summary' value={profile.summary} />
          <ProfileField
            label='Website'
            value={formatUrl(profile.website)}
            icon={Link}
          />
          <ProfileField
            label='Github'
            value={formatUrl(profile.github)}
            icon={Link}
          />
          <ProfileField
            label='LinkedIn'
            value={formatUrl(profile.linkedin)}
            icon={Link}
          />
          <ProfileField
            label='X (formerly Twitter)'
            value={formatUrl(profile.twitter)}
            icon={Link}
          />
        </div>

        {/* Experience Section */}
        <div className='space-y-1'>
          <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2 mb-6'>
            <Briefcase className='w-5 h-5' />
            Experience
          </h3>

          <ProfileField label='Work' value={profile.work} icon={Briefcase} />
          <ProfileField
            label='Education'
            value={profile.education}
            icon={GraduationCap}
          />
        </div>

        {/* Skills Section */}
        <div className='space-y-1'>
          <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2 mb-6'>
            <Code className='w-5 h-5' />
            Technical Skills
          </h3>

          <div className='flex justify-between items-start py-3 border-b border-gray-100'>
            <div className='flex items-center gap-3 flex-1'>
              <div className='w-6 flex justify-center'>
                <Code className='w-4 h-4 text-gray-500' />
              </div>
              <span className='text-sm font-medium text-gray-700'>
                Technical Skills
              </span>
            </div>
            <div className='flex-1'>
              {profile.technicalSkills && profile.technicalSkills.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {profile.technicalSkills.map(skill => (
                    <Badge key={skill} variant='secondary'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className='text-sm text-gray-400 italic'>
                  No skills added
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {profile.leetcodeId && (
          <div className='pt-4 border-t border-gray-200'>
            <div className='flex items-center justify-between py-3'>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-medium text-gray-700'>
                  LeetCode ID
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-900'>
                  {profile.leetcodeId}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && <EditProfileForm onClose={() => setIsEditing(false)} />}
    </>
  );
}
