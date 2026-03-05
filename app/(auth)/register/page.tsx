"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  const router                          = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw   = localStorage.getItem("user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw);
        router.replace(user?.role === "admin" ? "/admin/dashboard" : "/");
        return;
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) return null;

  return (
    <main className="relative min-h-screen w-full bg-[#fdf9be] overflow-hidden flex flex-col">

      {/* Left image panel */}
      <div className="absolute top-10 left-0 z-10">
        <div className="relative bg-[#eeede9] rounded-tr-full h-[550px] w-[340px] overflow-hidden">
          <Image src="/cutebag.png" alt="Pet Illustration" fill className="object-cover" priority />
        </div>
      </div>

      {/* Right blue panel */}
      <div className="flex-1 flex justify-end items-end px-6 pt-6">
        <div className="bg-[#5b84c4] w-full lg:w-[60%] min-h-[88vh] rounded-tl-[120px] rounded-tr-[120px] flex items-center">
          <div className="w-full flex flex-col items-center px-8 py-12">
            <div className="w-full max-w-sm mb-8">
              <h1 className="text-4xl font-bold mb-3 text-yellow-100">Join MyPetJoy!</h1>
              <p className="text-sm font-light text-white/80 leading-relaxed">
                Create your account and find your perfect pet companion
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>

    </main>
  );
}