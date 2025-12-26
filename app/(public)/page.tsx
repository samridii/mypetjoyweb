export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#C9D6FF] px-6 py-12">
      <h1 className="text-5xl font-extrabold mb-4 text-[#5A6FA8]">Welcome to MyPetJoy </h1>
      <p className="text-xl text-[#9C8FC4] mb-10 max-w-xl text-center">
        Your All-in-one platform for pet shopping, adoption, matching, and expense tracking.
      </p>
      <div className="flex gap-8">
        <a
          href="/login"
          className="px-8 py-3 border-2 border-[#5A6FA8] text-[#5A6FA8] rounded-lg hover:bg-[#5A6FA8] hover:text-white transition font-semibold"
        >
          Sign In
        </a>
        <a
          href="/dashboard"
          className="px-8 py-3 bg-[#FFC857] text-[#3A3A3A] rounded-lg hover:bg-[#FFB040] transition font-semibold"
        >
          Dashboard
        </a>
      </div>
    </main>
  );
}

