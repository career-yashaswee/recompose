import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDailyCompositions() {
  try {
    console.log('Seeding daily compositions...');

    // Get all compositions
    const compositions = await prisma.composition.findMany({
      where: { isActive: true },
      select: { id: true, title: true, difficulty: true },
    });

    if (compositions.length === 0) {
      console.log(
        'No compositions found. Please create some compositions first.'
      );
      return;
    }

    console.log(`Found ${compositions.length} compositions`);

    // Generate daily compositions for the next 30 days
    const today = new Date();
    const dailyCompositions = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Select a random composition for each day
      const randomComposition =
        compositions[Math.floor(Math.random() * compositions.length)];

      dailyCompositions.push({
        dateKey,
        compositionId: randomComposition.id,
        isActive: true,
      });
    }

    // Insert daily compositions
    const created = await prisma.dailyComposition.createMany({
      data: dailyCompositions,
      skipDuplicates: true,
    });

    console.log(`Created ${created.count} daily compositions`);

    // Show some examples
    const examples = await prisma.dailyComposition.findMany({
      take: 5,
      include: {
        composition: {
          select: { title: true, difficulty: true },
        },
      },
      orderBy: { dateKey: 'asc' },
    });

    console.log('\nFirst 5 daily compositions:');
    examples.forEach(dc => {
      console.log(
        `${dc.dateKey}: ${dc.composition.title} (${dc.composition.difficulty})`
      );
    });
  } catch (error) {
    console.error('Error seeding daily compositions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDailyCompositions();
