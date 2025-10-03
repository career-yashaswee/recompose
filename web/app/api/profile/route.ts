import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/profile - Get current user's profile
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    console.log('Profile API: Starting GET request');
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    console.log('Profile API: Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      console.log('Profile API: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        gender: true,
        location: true,
        birthday: true,
        summary: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        leetcodeId: true,
        work: true,
        education: true,
        technicalSkills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Profile API: User found:', {
      hasUser: !!user,
      userId: user?.id,
      userName: user?.name,
    });

    if (!user) {
      console.log('Profile API: User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile API: Returning user data');
    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile API: Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile - Update current user's profile
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      gender,
      location,
      birthday,
      summary,
      website,
      github,
      linkedin,
      twitter,
      leetcodeId,
      work,
      education,
      technicalSkills,
    } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate URLs if provided
    const urlFields = { website, github, linkedin, twitter };
    for (const [field, value] of Object.entries(urlFields)) {
      if (value && value.trim().length > 0) {
        try {
          new URL(value);
        } catch {
          return NextResponse.json(
            { error: `Invalid URL format for ${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate birthday if provided
    let birthdayDate: Date | null = null;
    if (birthday) {
      birthdayDate = new Date(birthday);
      if (isNaN(birthdayDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid birthday format' },
          { status: 400 }
        );
      }
    }

    // Validate technical skills array
    let skillsArray: string[] = [];
    if (technicalSkills && Array.isArray(technicalSkills)) {
      skillsArray = technicalSkills.filter(
        skill => typeof skill === 'string' && skill.trim().length > 0
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        gender: gender?.trim() || null,
        location: location?.trim() || null,
        birthday: birthdayDate,
        summary: summary?.trim() || null,
        website: website?.trim() || null,
        github: github?.trim() || null,
        linkedin: linkedin?.trim() || null,
        twitter: twitter?.trim() || null,
        leetcodeId: leetcodeId?.trim() || null,
        work: work?.trim() || null,
        education: education?.trim() || null,
        technicalSkills: skillsArray,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        gender: true,
        location: true,
        birthday: true,
        summary: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        leetcodeId: true,
        work: true,
        education: true,
        technicalSkills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
