'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Plus,
  Calendar,
  MapPin,
  User,
  Link,
  Briefcase,
  GraduationCap,
  Code,
} from 'lucide-react';
import {
  useProfile,
  useUpdateProfile,
  type UpdateProfileData,
} from '@/hooks/api/use-profile';
import { toast } from 'sonner';

interface EditProfileFormProps {
  onClose: () => void;
}

export function EditProfileForm({
  onClose,
}: EditProfileFormProps): React.ReactElement {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    gender: '',
    location: '',
    birthday: '',
    summary: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    leetcodeId: '',
    work: '',
    education: '',
    technicalSkills: [],
  });

  const [newSkill, setNewSkill] = useState('');

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        gender: profile.gender || '',
        location: profile.location || '',
        birthday: profile.birthday
          ? profile.birthday.toISOString().split('T')[0]
          : '',
        summary: profile.summary || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        leetcodeId: profile.leetcodeId || '',
        work: profile.work || '',
        education: profile.education || '',
        technicalSkills: profile.technicalSkills || [],
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSkill = () => {
    if (
      newSkill.trim() &&
      !formData.technicalSkills?.includes(newSkill.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        technicalSkills: [...(prev.technicalSkills || []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technicalSkills:
        prev.technicalSkills?.filter(skill => skill !== skillToRemove) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await updateProfile.mutateAsync(formData);
      onClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded mb-4'></div>
            <div className='space-y-4'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-semibold text-gray-900'>Edit Profile</h2>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='w-5 h-5' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Info Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2'>
              <User className='w-5 h-5' />
              Basic Info
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='name'>Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Your full name'
                  required
                />
              </div>

              <div>
                <Label htmlFor='gender'>Gender</Label>
                <Input
                  id='gender'
                  value={formData.gender}
                  onChange={e => handleInputChange('gender', e.target.value)}
                  placeholder='e.g., Male, Female, Non-binary'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='location'>Location</Label>
              <div className='relative'>
                <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  id='location'
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder='e.g., India, Uttar Pradesh, Allahābād'
                  className='pl-10'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='birthday'>Birthday</Label>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  id='birthday'
                  type='date'
                  value={formData.birthday}
                  onChange={e => handleInputChange('birthday', e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='summary'>Summary</Label>
              <textarea
                id='summary'
                value={formData.summary}
                onChange={e => handleInputChange('summary', e.target.value)}
                placeholder='Tell us about yourself (interests, experience, etc.)'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                rows={3}
              />
            </div>
          </div>

          {/* Links Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2'>
              <Link className='w-5 h-5' />
              Links
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='website'>Website</Label>
                <Input
                  id='website'
                  value={formData.website}
                  onChange={e => handleInputChange('website', e.target.value)}
                  placeholder='https://your-website.com'
                  type='url'
                />
              </div>

              <div>
                <Label htmlFor='github'>GitHub</Label>
                <Input
                  id='github'
                  value={formData.github}
                  onChange={e => handleInputChange('github', e.target.value)}
                  placeholder='https://github.com/username'
                  type='url'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='linkedin'>LinkedIn</Label>
                <Input
                  id='linkedin'
                  value={formData.linkedin}
                  onChange={e => handleInputChange('linkedin', e.target.value)}
                  placeholder='https://linkedin.com/in/username'
                  type='url'
                />
              </div>

              <div>
                <Label htmlFor='twitter'>X (formerly Twitter)</Label>
                <Input
                  id='twitter'
                  value={formData.twitter}
                  onChange={e => handleInputChange('twitter', e.target.value)}
                  placeholder='https://x.com/username'
                  type='url'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='leetcodeId'>LeetCode ID</Label>
              <Input
                id='leetcodeId'
                value={formData.leetcodeId}
                onChange={e => handleInputChange('leetcodeId', e.target.value)}
                placeholder='dev-yashaswee'
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2'>
              <Briefcase className='w-5 h-5' />
              Experience
            </h3>

            <div>
              <Label htmlFor='work'>Work</Label>
              <Input
                id='work'
                value={formData.work}
                onChange={e => handleInputChange('work', e.target.value)}
                placeholder='Add a workplace'
              />
            </div>

            <div>
              <Label htmlFor='education'>Education</Label>
              <div className='relative'>
                <GraduationCap className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  id='education'
                  value={formData.education}
                  onChange={e => handleInputChange('education', e.target.value)}
                  placeholder='e.g., Lovely Professional University - Bachelors of Technology 07/2022 - 07/2026'
                  className='pl-10'
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 flex items-center gap-2'>
              <Code className='w-5 h-5' />
              Technical Skills
            </h3>

            <div className='flex gap-2'>
              <Input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder='Add a skill'
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type='button' onClick={handleAddSkill} variant='outline'>
                <Plus className='w-4 h-4' />
              </Button>
            </div>

            {formData.technicalSkills &&
              formData.technicalSkills.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {formData.technicalSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      {skill}
                      <button
                        type='button'
                        onClick={() => handleRemoveSkill(skill)}
                        className='ml-1 hover:text-red-500'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
          </div>

          {/* Submit Buttons */}
          <div className='flex justify-end gap-3 pt-6 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={updateProfile.isPending}
              className='bg-blue-500 hover:bg-blue-600'
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
