import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WE Academic Monitor",
  description: "Hệ thống theo dõi học viên, lớp học và chất lượng giảng dạy.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
