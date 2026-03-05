import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyPetJoy — Find Your Perfect Pet",
  description: "Adopt pets, shop supplies, and give animals a loving home.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fredoka.className}>
      <body className="font-fredoka antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}