import React from 'react';
import AppCard from '@/components/common/AppCard';
import { mockFeaturedCourses } from '@/mocks/home';

const FeaturedCourses = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center w-full">
      <AppCard
        price="432.000"
        originalPrice="864.000"
        discountPercentage={50}
      />
      {mockFeaturedCourses.map((course) => (
        <AppCard
          key={course.id}
          category={course.category}
          rating={course.rating}
          title={course.title}
          classes={course.classes}
          students={course.students}
          price={course.price}
          originalPrice={course.originalPrice}
          discountPercentage={course.discountPercentage}
          image={course.image}
          instructor={course.instructor}
        />
      ))}
    </div>
  );
};

export default FeaturedCourses;
