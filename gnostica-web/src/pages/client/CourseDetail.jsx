import React from "react";
import { useParams } from "react-router-dom";
import { getCourseDetailById } from "@/mocks/courses";
import CourseDetailView from "@/components/client/CourseDetailView";

export default function CourseDetail() {
  const { id } = useParams();
  const course = getCourseDetailById(id || "1");

  return (
    <CourseDetailView course={course} />
  );
}
