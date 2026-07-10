import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import instructorService from "@/services/instructor/instructorService";
import { Progress } from "@/components/ui/progress";
import { Eye, GraduationCap, Loader2, X } from "lucide-react";

const StudentCoursesModal = ({ isOpen, onClose, student }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStudentCourses = async () => {
            setIsLoading(true);
            try {
                const data = await instructorService.getStudentCourses(student.id);
                setCourses(data);
            } catch (error) {
                console.error("Error fetching student courses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && student) {
            fetchStudentCourses();
        }
    }, [isOpen, student]);

    const formatDate = (dateString) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl"
                style={{ maxWidth: "860px", width: "92vw" }}
                showCloseButton={false}
            >
                {/* Header */}
                <DialogHeader className="px-6 py-5 bg-muted border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-foreground">
                                    Khóa học tham gia
                                </DialogTitle>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Học viên:{" "}
                                    <span className="text-primary font-bold">{student?.fullName}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-error/10 text-error flex items-center justify-center text-error hover:text-error transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Table */}
                <div className="overflow-y-auto max-h-[60vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm font-medium">Đang tải...</span>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <GraduationCap className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm font-medium">Chưa có khóa học nào</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="py-4 px-4 text-left text-sm font-semibold text-foreground w-12">STT</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground">Khóa học</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground whitespace-nowrap w-36">Tiến độ</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground whitespace-nowrap w-36">Ngày tham gia</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground w-20 whitespace-nowrap">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course, index) => (
                                    <tr
                                        key={course.id || index}
                                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        {/* STT */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {(index + 1).toString().padStart(2, "0")}
                                            </span>
                                        </td>
                                        {/* Khóa học */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
                                                    {course.courseThumbnail ? (
                                                        <img
                                                            src={course.courseThumbnail}
                                                            alt={course.courseTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                            <GraduationCap className="w-5 h-5 text-primary/40" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate max-w-[280px]">
                                                        {course.courseTitle}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {course.instructorName}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Tiến độ */}
                                        <td className="py-4 px-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-black text-primary">{course.progressPercent}%</span>
                                                </div>
                                                <Progress value={course.progressPercent} className="h-1.5 bg-primary/10" />
                                            </div>
                                        </td>
                                        {/* Ngày tham gia */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-bold text-foreground block">
                                                {formatDate(course.joinedAt)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Ghi danh</span>
                                        </td>
                                        {/* Thao tác */}
                                        <td className="py-4 px-4 text-center">
                                            <button className="p-1.5 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StudentCoursesModal;
