import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsHeader } from "@/components/pages/admin/settings/SettingsHeader";
import { GeneralSettings } from "@/components/pages/admin/settings/GeneralSettings";
import { PaymentConfigSettings } from "@/components/pages/admin/settings/PaymentConfigSettings";
import { SecuritySettings } from "@/components/pages/admin/settings/SecuritySettings";
import { Globe, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Đã lưu các thay đổi thành công!");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader onSave={handleSave} isSaving={isSaving} />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/50 border border-slate-200 p-1 mb-6">
          <TabsTrigger value="general" className="gap-2 data-active:bg-white data-active:shadow-sm">
            <Globe className="w-4 h-4" />
            Cài đặt chung
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2 data-active:bg-white data-active:shadow-sm">
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-active:bg-white data-active:shadow-sm">
            <Shield className="w-4 h-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-in fade-in duration-300">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="payment" className="animate-in fade-in duration-300">
          <PaymentConfigSettings />
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in duration-300">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
