import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SEC TRANSPORT | Transport Operations",
  description: "SEC college transportation operations and fleet management"
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}