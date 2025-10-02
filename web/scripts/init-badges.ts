import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function initializeDefaultBadges() {
  try {
    console.log('Initializing default badges...');

    // Check if badges already exist
    const existingBadges = await prisma.badge.count();
    if (existingBadges > 0) {
      console.log('Badges already exist, skipping initialization.');
      return;
    }

    // Create default badges
    const defaultBadges = [
      {
        id: 'badge_composition_starter',
        name: 'Composition Starter',
        description: 'Complete your first 5 compositions',
        icon: '🎯',
        criteria: {
          type: 'compositions_completed',
          count: 5,
        },
        tier: 'BRONZE' as const,
        category: 'COMPOSITION' as const,
      },
      {
        id: 'badge_composition_lover',
        name: 'Composition Lover',
        description: 'Like 5 compositions on the platform',
        icon: '❤️',
        criteria: {
          type: 'compositions_liked',
          count: 5,
        },
        tier: 'BRONZE' as const,
        category: 'ENGAGEMENT' as const,
      },
    ];

    for (const badgeData of defaultBadges) {
      await prisma.badge.create({
        data: {
          ...badgeData,
          criteria: JSON.parse(JSON.stringify(badgeData.criteria)),
        },
      });
    }

    console.log('Default badges initialized successfully!');
  } catch (error) {
    console.error('Error initializing default badges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDefaultBadges();
