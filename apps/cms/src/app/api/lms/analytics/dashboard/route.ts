import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/analytics/dashboard - Get dashboard analytics
export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get basic counts from PayloadCMS
    const [coursesResult, studentsResult, instructorsResult] = await Promise.all([
      payload.find({ collection: 'courses', limit: 0 }),
      payload.find({ collection: 'customers', limit: 0 }),
      payload.find({ collection: 'instructors', limit: 0 }),
    ])

    // Get recent courses (since enrollments are no longer tracked)
    const recentCourses = await payload.find({
      collection: 'courses',
      limit: 5,
      sort: '-createdAt',
      depth: 1,
    })

    // Get popular courses (most enrollments)
    const popularCourses = await payload.find({
      collection: 'courses',
      limit: 5,
      depth: 1,
    })

    // Compile dashboard data
    const dashboardData = {
      overview: {
        totalCourses: coursesResult.totalDocs,
        totalEnrollments: 0, // Enrollments no longer tracked
        totalStudents: studentsResult.totalDocs,
        totalInstructors: instructorsResult.totalDocs,
        activeEnrollments: 0, // Enrollments no longer tracked
        completionRate: 0, // Can be calculated later
      },
      recentActivity: {
        recentCourses: recentCourses.docs,
        enrollmentTrends: [], // Can be added later
      },
      popularCourses: popularCourses.docs,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
