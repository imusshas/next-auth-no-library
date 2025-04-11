import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auth No Library",
  description: "Custom Authentication without any library including oauth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
