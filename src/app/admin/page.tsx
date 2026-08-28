import { DashboardWelcome } from "@/components/admin/dashboard-welcome";
import { DashboardBestSellers } from "@/components/admin/dashboard-best-sellers";
import { DashboardRecentTransactions } from "@/components/admin/dashboard-recent-transactions";
import { DashboardSalesAnalytics } from "@/components/admin/dashboard-sales-analytics";
import { DashboardSalesByCountry } from "@/components/admin/dashboard-sales-by-country";

const Admin = () => {
  return (
    <div className="flex flex-col gap-6 font-nunito">
      <DashboardWelcome />

      {/* Best Seller (362) + Recent Transactions (754) in the design's 1140 grid. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[362px_1fr]">
        <DashboardBestSellers />
        <DashboardRecentTransactions />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <DashboardSalesAnalytics />
        <DashboardSalesByCountry />
      </div>
    </div>
  );
};

export default Admin;
