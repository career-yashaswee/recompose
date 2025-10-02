const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function addSampleTags() {
  try {
    // Get all compositions
    const compositions = await prisma.composition.findMany({
      select: { id: true, title: true, tags: true }
    });

    console.log(`Found ${compositions.length} compositions`);

    // Sample tags to add
    const sampleTags = [
      'algorithm', 'data-structure', 'array', 'string', 'tree', 'graph',
      'dynamic-programming', 'greedy', 'sorting', 'searching', 'math',
      'recursion', 'iteration', 'hash-table', 'stack', 'queue', 'linked-list',
      'binary-search', 'two-pointers', 'sliding-window', 'backtracking',
      'leetcode', 'interview', 'easy', 'medium', 'hard', 'beginner',
      'advanced', 'optimization', 'performance', 'clean-code'
    ];

    // Add random tags to each composition
    for (const composition of compositions) {
      // Skip if already has tags
      if (composition.tags && composition.tags.length > 0) {
        console.log(`Skipping ${composition.title} - already has tags`);
        continue;
      }

      // Generate 2-4 random tags
      const numTags = Math.floor(Math.random() * 3) + 2; // 2-4 tags
      const shuffled = [...sampleTags].sort(() => 0.5 - Math.random());
      const selectedTags = shuffled.slice(0, numTags);

      await prisma.composition.update({
        where: { id: composition.id },
        data: { tags: selectedTags }
      });

      console.log(`Added tags [${selectedTags.join(', ')}] to "${composition.title}"`);
    }

    console.log('✅ Sample tags added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleTags();
