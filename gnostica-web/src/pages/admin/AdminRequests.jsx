import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Headphones,
  Undo2,
  Wallet,
  Flag
} from "lucide-react";
import RequestIncidentsTab from "./components/RequestIncidentsTab";
import RequestRefundsTab from "./components/RequestRefundsTab";
import RequestWithdrawalsTab from "./components/RequestWithdrawalsTab";
import RequestReportsTab from "./components/RequestReportsTab";

export default function AdminRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "incidents";
  const [activeTab, setActiveTabState] = useState(tabFromUrl);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "incidents";
    if (currentTab !== activeTab) {
      setActiveTabState(currentTab);
    }
  }, [searchParams]);

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    setSearchParams({ tab: newTab });
  };

  const tabs = [
    { id: "incidents", label: "Sự cố", icon: Headphones },
    { id: "reports", label: "Báo cáo", icon: Flag },
    { id: "refunds", label: "Hoàn tiền", icon: Undo2 },
    { id: "withdrawals", label: "Rút tiền", icon: Wallet },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Headphones className="w-6 h-6" />
            </div>
            Quản Lý Yêu Cầu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trung tâm tiếp nhận và xử lý sự cố, hoàn tiền, rút tiền, và báo cáo từ người dùng.
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "incidents" && <RequestIncidentsTab />}
        {activeTab === "refunds" && <RequestRefundsTab />}
        {activeTab === "withdrawals" && <RequestWithdrawalsTab />}
        {activeTab === "reports" && <RequestReportsTab />}
      </div>
    </div>
  );
}
