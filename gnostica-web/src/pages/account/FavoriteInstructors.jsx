import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { Users, ArrowRight, UserMinus, Star } from "lucide-react";
import useFavoriteInstructors from '@/hooks/account/useFavoriteInstructors';
import { AppButton } from "@/components/common/micro/AppButton";

export default function FavoriteInstructors() {
    const { instructors, loading, handleUnfollow } = useFavoriteInstructors();

    return (
        <div className="animate-in fade-in duration-500">
            <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Giảng viên yêu thích" }]} />

            <AppPageHeader
                icon={Users}
                title="Giảng viên yêu thích"
                description="Danh sách các giảng viên chuyên gia mà bạn đang theo dõi trên Gnostica."
            />

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
                        <AppButton appVariant="gradient" className="font-bold px-6">Khám phá ngay</AppButton>
                    </Link>
                </div>
            )}
        </div>
    );
}
