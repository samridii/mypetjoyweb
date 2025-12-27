import LoginForm from "../_components/LoginForm";
import Image from "next/image";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full bg-[#fdf9be] overflow-hidden flex flex-col">
      
      <div className="absolute top-10 left-0 z-60">
        <div
          className="relative bg-[#eeede9]
                     rounded-tr-full
                     h-[550px] w-[340px]
                     overflow-hidden"
        >

          <Image
            src="/cutebag.png"
            alt="Pet Illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="flex-1 flex justify-end items-end px-6 pt-6">
        <div className="bg-[#5b84c4] w-full lg:w-[60%] min-h-[88vh] rounded-tl-[120px]  rounded-tr-[120px] flex items-center">
          
          <div className="w-full flex flex-col items-center px-8">
            
            <div className="w-full max-w-sm mb-10 text-white">
              <h1 className="text-4xl font-bold mb-3  text-yellow-100">Welcome back!</h1>
              <p className="text-sm font-light opacity-90 leading-relaxed">
                Enter your credentials to access your account
              </p>
            </div>

            <LoginForm />

          </div>
        </div>
      </div>
    </main>
  );
}



