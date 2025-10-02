"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface LearningData {
  day: string;
  hours: number;
  categories: {
    language: number;
    business: number;
    marketing: number;
  };
}

interface LearningActivityProps {
  className?: string;
}

const learningData: LearningData[] = [
  {
    day: "Mon",
    hours: 4.5,
    categories: { language: 2, business: 1.5, marketing: 1 },
  },
  {
    day: "Tue",
    hours: 3.2,
    categories: { language: 1.5, business: 1, marketing: 0.7 },
  },
  {
    day: "Wed",
    hours: 6.8,
    categories: { language: 3, business: 2, marketing: 1.8 },
  },
  {
    day: "Thu",
    hours: 5.5,
    categories: { language: 2.5, business: 1.8, marketing: 1.2 },
  },
  {
    day: "Fri",
    hours: 4.1,
    categories: { language: 2, business: 1.2, marketing: 0.9 },
  },
  {
    day: "Sat",
    hours: 2.8,
    categories: { language: 1.5, business: 0.8, marketing: 0.5 },
  },
  {
    day: "Sun",
    hours: 3.5,
    categories: { language: 2, business: 1, marketing: 0.5 },
  },
];

export function LearningActivity({ className }: LearningActivityProps): React.ReactElement {
  const maxHours = Math.max(...learningData.map((d) => d.hours));

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Learning Activity</CardTitle>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              42 hours 30 minutes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-1 border rounded-md text-sm">
              <option>This Week</option>
            </select>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bar Chart */}
        <div className="mb-6">
          <div className="flex items-end justify-between h-32 gap-2">
            {learningData.map((data, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1"
              >
                <div className="flex flex-col justify-end h-full w-full gap-1">
                  <div
                    className="bg-pink-400 rounded-t"
                    style={{
                      height: `${
                        (data.categories.language / maxHours) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-yellow-400"
                    style={{
                      height: `${
                        (data.categories.business / maxHours) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="bg-blue-400 rounded-b"
                    style={{
                      height: `${
                        (data.categories.marketing / maxHours) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0h</span>
            <span>8h</span>
          </div>
        </div>

        {/* Course Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-pink-100 rounded-lg p-3">
            <p className="text-sm font-semibold">16 Hours</p>
            <p className="text-xs text-gray-600">French for Beginners</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-3">
            <p className="text-sm font-semibold">16 Hours</p>
            <p className="text-xs text-gray-600">Spanish for Beginners</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-3">
            <p className="text-sm font-semibold">10.5 Hours</p>
            <p className="text-xs text-gray-600">Business Communica...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
