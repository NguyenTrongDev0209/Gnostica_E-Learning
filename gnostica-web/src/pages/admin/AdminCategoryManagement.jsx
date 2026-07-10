import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCategories from "./AdminCategories";
import AdminForumCategory from "./AdminForumCategory";
import { LayoutList, MessageSquare } from "lucide-react";

export default function AdminCategoryManagement() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Quản Lý Chủ Đề
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý chủ đề khóa học và chủ đề diễn đàn.
                </p>
            </div>

            <Tabs defaultValue="courses" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="courses" className="flex items-center gap-2">
                        <LayoutList className="w-4 h-4" />
                        Khóa học
                    </TabsTrigger>
                    <TabsTrigger value="forum" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Diễn đàn
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="courses">
                    <AdminCategories hideHeader={true} />
                </TabsContent>
                <TabsContent value="forum">
                    <AdminForumCategory hideHeader={true} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
