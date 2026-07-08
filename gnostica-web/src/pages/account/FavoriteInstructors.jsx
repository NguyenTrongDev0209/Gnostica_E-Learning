import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Users, ArrowRight, UserMinus, Star } from "lucide-react";
import followingService from '@/services/instructor/followingService';
import useAuthStore from "@/store/useAuthStore";
import { toast } from 'sonner';

export default function FavoriteInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        fetchFollowedInstructors();
    }, []);

    const fetchFollowedInstructors = async () => {
        try {
            setLoading(true);
            const res = await followingService.getFollowedInstructors();
            setInstructors(res.data);
        } catch (err) {
            console.error("Lỗi lấy danh sách giảng viên theo dõi", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (instructorId) => {
        try {
            const res = await followingService.toggleFollow(instructorId);
            if (!res.data.isFollowing) {
                setInstructors(prev => prev.filter(inst => inst.id !== instructorId));
                toast.success("Đã bỏ theo dõi giảng viên");
            }
        } catch (err) {
            toast.error("Không thể bỏ theo dõi!");
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                            <Home className="h-3.5 w-3.5" /> Trang chủ
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Tài khoản
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-sm font-semibold">Giảng viên yêu thích</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-4 mb-8">
                <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
                    <Users className="w-7 h-7 text-primary" />
                    Giảng viên yêu thích
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Danh sách các giảng viên chuyên gia mà bạn đang theo dõi trên Gnostica.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-32 bg-secondary rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : instructors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {instructors.map((instructor) => (
                        <Card key={instructor.id} className="group border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                                        <AvatarImage src={instructor.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {instructor.fullName?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                            {instructor.fullName}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-2 truncate">{instructor.email}</p>
                                        <div className="flex items-center gap-3">
                                            <Link to={`/profile/${instructor.id}`} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                                Xem hồ sơ <ArrowRight className="w-3 h-3" />
                                            </Link>
                                            <button 
                                                onClick={() => handleUnfollow(instructor.id)}
                                                className="text-xs font-medium text-muted-foreground hover:text-error flex items-center gap-1 transition-colors"
                                            >
                                                <UserMinus className="w-3 h-3" /> Bỏ theo dõi
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-warning">
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Chưa theo dõi giảng viên nào</h3>
                    <p className="text-sm text-muted-foreground mb-6">Hãy khám phá và theo dõi những giảng viên yêu thích của bạn.</p>
                    <Link to="/instructors">
                        <Button className="bg-primary hover:bg-primary/90 font-bold px-6">Khám phá ngay</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
