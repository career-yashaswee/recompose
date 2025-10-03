import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleCompositions() {
  try {
    console.log('Creating sample compositions...');

    const sampleCompositions = [
      {
        title: 'Two Sum',
        description:
          'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'EASY' as const,
        tags: ['Array', 'Hash Table'],
      },
      {
        title: 'Add Two Numbers',
        description:
          'You are given two non-empty linked lists representing two non-negative integers.',
        difficulty: 'MEDIUM' as const,
        tags: ['Linked List', 'Math'],
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        description:
          'Given a string s, find the length of the longest substring without repeating characters.',
        difficulty: 'MEDIUM' as const,
        tags: ['Hash Table', 'String', 'Sliding Window'],
      },
      {
        title: 'Median of Two Sorted Arrays',
        description:
          'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
        difficulty: 'HARD' as const,
        tags: ['Array', 'Binary Search', 'Divide and Conquer'],
      },
      {
        title: 'Palindrome Number',
        description:
          'Given an integer x, return true if x is a palindrome integer.',
        difficulty: 'EASY' as const,
        tags: ['Math'],
      },
      {
        title: 'Valid Parentheses',
        description:
          "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: 'EASY' as const,
        tags: ['String', 'Stack'],
      },
      {
        title: 'Merge Two Sorted Lists',
        description:
          'You are given the heads of two sorted linked lists list1 and list2.',
        difficulty: 'EASY' as const,
        tags: ['Linked List', 'Recursion'],
      },
      {
        title: 'Remove Duplicates from Sorted Array',
        description:
          'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place.',
        difficulty: 'EASY' as const,
        tags: ['Array', 'Two Pointers'],
      },
      {
        title: 'Search in Rotated Sorted Array',
        description:
          'There is an integer array nums sorted in ascending order (with distinct values).',
        difficulty: 'MEDIUM' as const,
        tags: ['Array', 'Binary Search'],
      },
      {
        title: 'First Missing Positive',
        description:
          'Given an unsorted integer array nums, return the smallest missing positive integer.',
        difficulty: 'HARD' as const,
        tags: ['Array', 'Hash Table'],
      },
    ];

    const created = await prisma.composition.createMany({
      data: sampleCompositions,
      skipDuplicates: true,
    });

    console.log(`Created ${created.count} sample compositions`);

    // Now seed daily compositions
    console.log('Seeding daily compositions...');

    const compositions = await prisma.composition.findMany({
      where: { isActive: true },
      select: { id: true, title: true, difficulty: true },
    });

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
    const createdDaily = await prisma.dailyComposition.createMany({
      data: dailyCompositions,
      skipDuplicates: true,
    });

    console.log(`Created ${createdDaily.count} daily compositions`);

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
    console.error('Error creating sample compositions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCompositions();
