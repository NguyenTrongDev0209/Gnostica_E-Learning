import { FileText } from "lucide-react";
import { useLocation } from "react-router-dom";
import PolicyPage from "@/pages/general/components/PolicyPage";

export default function ContentPage() {
  const { pathname } = useLocation();
  return <PolicyPage slug={pathname.replace(/^\/+/, "")} fallbackTitle="Trang nội dung" icon={FileText} />;
}
