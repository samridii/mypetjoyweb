import type { Metadata } from "next";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MyPetJoy — Find Your Perfect Pet",
  description: "Adopt pets, shop supplies, and give animals a loving home.",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "var(--font-fredoka), Fredoka, sans-serif",
            fontSize: "15px",
            fontWeight: "500",
            padding: "12px 18px",
            borderRadius: "18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          },
          success: {
            style: { background: "#f0fdf4", color: "#15803d", border: "1.5px solid #bbf7d0" },
            iconTheme: { primary: "#22c55e", secondary: "#f0fdf4" },
          },
          error: {
            style: { background: "#fff1f2", color: "#be123c", border: "1.5px solid #fecdd3" },
            iconTheme: { primary: "#f43f5e", secondary: "#fff1f2" },
          },
        }}
      />
    </AuthProvider>
  );
}