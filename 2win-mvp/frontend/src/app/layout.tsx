
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Innerve - Digital Twin Health Predictor",
  description: "Week 1 MVP - AISSMS IOIT Pune",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full w-full m-0 p-0">
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
