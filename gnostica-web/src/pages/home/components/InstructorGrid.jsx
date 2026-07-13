import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useHomeData from '@/hooks/home/useHomeData';

const InstructorGrid = () => {
  const navigate = useNavigate();
  const { instructors, loadingInstructors } = useHomeData();

  if (loadingInstructors) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center p-6 text-center w-full h-64 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {instructors.map((instructor, idx) => (
        <Card key={idx} onClick={() => instructor.id && navigate(`/profile/${instructor.id}`)} className="flex flex-col items-center p-6 text-center w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
          <img src={instructor.avatar} alt={instructor.name} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-background shadow-sm" />
          <h3 className="font-bold text-lg">{instructor.name}</h3>
          <p className="text-primary text-sm font-medium mb-3">{instructor.role}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground w-full justify-center border-t pt-3 mt-auto">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{instructor.students} hb</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{instructor.courses} khóa</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InstructorGrid;
