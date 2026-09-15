import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Alex_Brush } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { BrandHeader } from "@/components/brand-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const script = Alex_Brush({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kipling Graduates | Food Orders",
  description: "Kipling Class F 2027 committee food ordering app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-gray-900">
        <CartProvider>
          <BrandHeader />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
