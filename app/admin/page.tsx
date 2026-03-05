import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">MyPetJoy Admin Panel</h1>

      <div className="space-y-4">
        <Link href="/admin/dashboard" className="block text-blue-600">
          Dashboard Analytics
        </Link>

        <Link href="/admin/users" className="block text-blue-600">
          Manage Users
        </Link>
      </div>
    </div>
  );
}