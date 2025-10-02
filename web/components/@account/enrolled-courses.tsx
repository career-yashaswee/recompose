"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, BookOpen, Award, TrendingUp } from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  level: string;
  lessons: number;
  hours: number;
  progress: number;
  status: "Ongoing" | "Completed";
  score: number;
  certificate?: string;
  icon: React.ReactNode;
}

interface EnrolledCoursesProps {
  className?: string;
}

const courses: Course[] = [
  {
    id: "1",
    title: "French for Beginners",
    category: "Language",
    level: "Beginner",
    lessons: 15,
    hours: 25,
    progress: 60,
    status: "Ongoing",
    score: 78,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: "2",
    title: "Business Communication",
    category: "Business",
    level: "Intermediate",
    lessons: 20,
    hours: 40,
    progress: 50,
    status: "Ongoing",
    score: 72,
    icon: <Award className="w-6 h-6" />,
  },
  {
    id: "3",
    title: "Spanish for Beginners",
    category: "Language",
    level: "Beginner",
    lessons: 18,
    hours: 30,
    progress: 100,
    status: "Completed",
    score: 90,
    certificate: "Spanish_Beginner_Certificate.pdf",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: "4",
    title: "Content Marketing",
    category: "Marketing",
    level: "Beginner",
    lessons: 19,
    hours: 29,
    progress: 35,
    status: "Ongoing",
    score: 64,
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

export function EnrolledCourses({ className }: EnrolledCoursesProps): React.ReactElement {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enrolled Courses</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search course, category, etc"
                className="pl-10 w-64"
              />
            </div>
            <select className="px-3 py-1 border rounded-md text-sm">
              <option>All Status</option>
            </select>
            <Button className="bg-blue-500 hover:bg-blue-600">
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {course.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  <Badge
                    variant="secondary"
                    className={
                      course.status === "Completed"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {course.category} • {course.level}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {course.lessons} lessons, {course.hours} hours
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-pink-400 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span>{course.progress}%</span>
                  </div>
                  <span>Score: {course.score}/100</span>
                  <span>
                    Certificate:{" "}
                    {course.certificate ? (
                      <a
                        href="#"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        {course.certificate}
                      </a>
                    ) : (
                      "None"
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
