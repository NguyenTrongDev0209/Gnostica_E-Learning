import { FileText } from "lucide-react";
import PolicyPage from "@/pages/general/components/PolicyPage";

export default function TermsPage() {
  return <PolicyPage slug="terms" fallbackTitle="Điều khoản dịch vụ" icon={FileText} />;
}
