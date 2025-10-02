'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  Home,
  Linkedin,
  Twitter,
  Instagram,
  Edit3,
  PlayCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({
  className,
}: UserProfileProps): React.ReactElement {
  const { data: session } = authClient.useSession();

  const user = session?.user || {
    name: 'Ava Mitchell',
    email: 'avamitchell@email.com',
    image: 'https://ui.shadcn.com/placeholder.svg',
  };

  return (
    <div
      className={`w-80 bg-gray-50 rounded-lg p-6 space-y-6 ${className || ''}`}
    >
      {/* Profile Header */}
      <div className='relative'>
        <div className='bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg h-24 flex items-center justify-center'>
          <Avatar className='w-16 h-16 border-4 border-white'>
            <AvatarImage
              src={user.image || 'https://ui.shadcn.com/placeholder.svg'}
              alt={user.name || 'User'}
            />
            <AvatarFallback className='text-lg font-semibold'>
              {user.name
                ?.split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className='mt-4 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
              STU-005
            </Badge>
            <Badge variant='secondary' className='bg-pink-100 text-pink-800'>
              Active
            </Badge>
          </div>
          <h2 className='text-xl font-semibold text-gray-900'>{user.name}</h2>
          <p className='text-sm text-gray-600'>Enrolled on Jan 30, 2028</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-center gap-4'>
        <Button variant='outline' size='icon' className='rounded-full'>
          <Mail className='w-4 h-4' />
        </Button>
        <Button variant='outline' size='icon' className='rounded-full'>
          <Phone className='w-4 h-4' />
        </Button>
        <Button
          size='icon'
          className='rounded-full bg-blue-500 hover:bg-blue-600'
        >
          <PlayCircle className='w-4 h-4 text-white' />
        </Button>
      </div>

      {/* Contact Information */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-gray-900'>Contact</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Mail className='w-4 h-4 text-gray-500' />
            <span className='text-sm'>{user.email}</span>
          </div>
          <div className='flex items-center gap-3'>
            <Phone className='w-4 h-4 text-gray-500' />
            <span className='text-sm'>+1 555-3344</span>
          </div>
          <div className='flex items-center gap-3'>
            <Home className='w-4 h-4 text-gray-500' />
            <span className='text-sm'>78 Maple Drive, New York, NY, USA</span>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-gray-900'>Social Media</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Linkedin className='w-4 h-4 text-blue-600' />
            <span className='text-sm'>ava-mitchell</span>
          </div>
          <div className='flex items-center gap-3'>
            <Twitter className='w-4 h-4 text-gray-500' />
            <span className='text-sm'>@mitchellava</span>
          </div>
          <div className='flex items-center gap-3'>
            <Instagram className='w-4 h-4 text-pink-600' />
            <span className='text-sm'>@iamavamitchell</span>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <Button className='w-full bg-blue-500 hover:bg-blue-600'>
        <Edit3 className='w-4 h-4 mr-2' />
        Edit
      </Button>
    </div>
  );
}
