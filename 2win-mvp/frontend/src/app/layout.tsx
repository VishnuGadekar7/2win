
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
