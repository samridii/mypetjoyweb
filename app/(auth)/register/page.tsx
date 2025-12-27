import RegisterForm from "../_components/RegisterForm";
import Image from "next/image";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full bg-[#fdf9be] overflow-hidden">

      <div className="absolute bottom-0 left-0 z-50">
        <div
          className="relative bg-[#eeede9]
                     rounded-tr-full
                     h-[520px] w-[340px]
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

      <div className="min-h-screen flex justify-end">
        <div
          className="bg-[#5b84c4]
                     w-full lg:w-[60%]
                     min-h-screen
                     rounded-tl-[140px]
                     flex items-center justify-center"
        >
          <div className="w-full max-w-md flex flex-col items-center px-10">

            <div className="mb-4 text-white text-center">
              <h1 className="text-3xl font-bold mb-2 text-yellow-100">
                Get Started Now
              </h1>
              <p className="text-sm opacity-90">
                Create your account to continue
              </p>
            </div>

            <RegisterForm />

          </div>
        </div>
      </div>

    </main>
  );
}



