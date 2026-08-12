import React from "react";
import WithdrawalModerationList from "@/components/admin/WithdrawalModerationList";

export default function RequestWithdrawalsTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <WithdrawalModerationList />
    </div>
  );
}
