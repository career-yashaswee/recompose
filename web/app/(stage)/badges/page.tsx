'use client';

import { useState } from 'react';
import { useBadges, useBadgeProgress } from '@/hooks/api/use-badges';
import { BadgeGrid, BadgeStats } from '@/components/badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Filter } from 'lucide-react';

export default function BadgesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showEarnedOnly] = useState<boolean>(false);

  const { data: badgesData, isLoading: badgesLoading } = useBadges();
  const { data: progressData, isLoading: progressLoading } = useBadgeProgress();

  const badges = badgesData?.badges || [];
  const progress = progressData;

  // Filter badges based on selected criteria
  const filteredBadges = badges.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
      return false;
    }
    if (selectedTier !== 'all' && badge.tier !== selectedTier) {
      return false;
    }
    if (showEarnedOnly && !badge.userProgress.isEarned) {
      return false;
    }
    return true;
  });

  // Group badges by category
  const badgesByCategory = badges.reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    },
    {} as Record<string, typeof badges>
  );

  const categories = ['all', ...Object.keys(badgesByCategory)];
  const tiers = ['all', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  // const handleShareProgress = () => {
  //   // TODO: Implement sharing functionality
  //   console.log('Share badge progress');
  // };

  // const handleDownloadAll = () => {
  //   // TODO: Implement download all earned badges
  //   console.log('Download all earned badges');
  // };

  return (
    <div className='container mx-auto p-4 space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Badges</h1>
          <p className='text-gray-600 mt-2'>
            Track your achievements and progress on the platform
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* <Button variant='outline' size='sm' onClick={handleShareProgress}>
            <Share2 className='h-4 w-4 mr-2' />
            Share Progress
          </Button>
          <Button variant='outline' size='sm' onClick={handleDownloadAll}>
            <Download className='h-4 w-4 mr-2' />
            Download All
          </Button> */}
        </div>
      </div>

      {/* Progress Stats */}
      {progress && !progressLoading && <BadgeStats progress={progress} />}

      {/* Filters and Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Filter className='h-5 w-5' />
            <span>Badge Collection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='all' className='space-y-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <TabsList className='grid w-full grid-cols-2 md:w-auto md:grid-cols-4'>
                <TabsTrigger value='all'>All Badges</TabsTrigger>
                <TabsTrigger value='earned'>Earned</TabsTrigger>
                <TabsTrigger value='progress'>In Progress</TabsTrigger>
                <TabsTrigger value='locked'>Locked</TabsTrigger>
              </TabsList>

              <div className='flex items-center space-x-2'>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='all'>All Categories</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTier}
                  onChange={e => setSelectedTier(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='all'>All Tiers</option>
                  {tiers.slice(1).map(tier => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TabsContent value='all' className='space-y-4'>
              <BadgeGrid badges={filteredBadges} isLoading={badgesLoading} />
            </TabsContent>

            <TabsContent value='earned' className='space-y-4'>
              <BadgeGrid
                badges={filteredBadges.filter(
                  badge => badge.userProgress.isEarned
                )}
                isLoading={badgesLoading}
              />
            </TabsContent>

            <TabsContent value='progress' className='space-y-4'>
              <BadgeGrid
                badges={filteredBadges.filter(
                  badge =>
                    !badge.userProgress.isEarned &&
                    badge.userProgress.progress > 0
                )}
                isLoading={badgesLoading}
              />
            </TabsContent>

            <TabsContent value='locked' className='space-y-4'>
              <BadgeGrid
                badges={filteredBadges.filter(
                  badge =>
                    !badge.userProgress.isEarned &&
                    badge.userProgress.progress === 0
                )}
                isLoading={badgesLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(badgesByCategory).length > 0 && (
        <div className='space-y-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Browse by Category
          </h2>
          {Object.entries(badgesByCategory).map(
            ([category, categoryBadges]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Trophy className='h-5 w-5' />
                      <span>{category}</span>
                      <BadgeComponent variant='secondary' className='ml-2'>
                        {categoryBadges.length} badges
                      </BadgeComponent>
                    </div>
                    <BadgeComponent variant='outline'>
                      {
                        categoryBadges.filter(b => b.userProgress.isEarned)
                          .length
                      }
                      /{categoryBadges.length} earned
                    </BadgeComponent>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgeGrid badges={categoryBadges} />
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Empty State */}
      {!badgesLoading && badges.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <Trophy className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No badges available yet
            </h3>
            <p className='text-gray-600 mb-4'>
              Badges will appear here as you complete activities on the
              platform.
            </p>
            <Button variant='outline'>Start Completing Compositions</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
