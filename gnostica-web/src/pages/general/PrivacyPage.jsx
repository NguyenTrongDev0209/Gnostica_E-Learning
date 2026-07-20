import { Shield } from "lucide-react";
import PolicyPage from "@/pages/general/components/PolicyPage";

export default function PrivacyPage() {
  return <PolicyPage slug="privacy" fallbackTitle="Chính sách bảo mật" icon={Shield} />;
}
