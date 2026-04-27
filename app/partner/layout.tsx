import type { ReactNode } from "react";
import PartnerDashboardLayout from "../../src/components/partner/PartnerDashboardLayout";

export default function PartnerLayout({ children }: { children: ReactNode }) {
    return <PartnerDashboardLayout>{children}</PartnerDashboardLayout>;
}
