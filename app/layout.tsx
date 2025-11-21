import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeslaConnect - Connect with Tesla Ambassadors",
  description: "Find Tesla owners in your area for test drives and real-world insights before buying.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <div id="portal-root"></div>
      </body>
    </html>
  );
}
