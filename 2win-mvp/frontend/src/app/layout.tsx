
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "2WIN.AI - Digital Twin Health Predictor",
  description: "Digital Twin Health Predictor - AISSMS IOIT Pune",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full w-full m-0 p-0">
        <Providers>
          <div className="min-h-screen w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
