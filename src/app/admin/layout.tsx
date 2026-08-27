import { Nunito_Sans } from "next/font/google";
import { ReactNode } from "react";
import AdminShell from "@/components/admin/adminShell";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type Props = { children: ReactNode };

const AdminLayout = ({ children }: Props) => {
  return <AdminShell className={nunitoSans.variable}>{children}</AdminShell>;
};

export default AdminLayout;
