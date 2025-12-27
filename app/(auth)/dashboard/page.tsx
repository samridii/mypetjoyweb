export default function Page() {
  return (
    <div className="min-h-screen p-6 bg-[#fbf8f4] space-y-6">
      
      <div className="bg-[#f0ebfa] p-4 rounded text-gray-800 flex justify-between">
        <div>
          <h1 className="font-bold text-xl">Dashboard</h1>
          <p className="text-sm">Welcome back</p>
        </div>
        <button className="bg-white px-3 rounded text-sm">Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#DCD6F7] p-4 rounded text-gray-800">Users: 1,234</div>
        <div className="bg-[#CDE7F6] p-4 rounded text-gray-800">Revenue: $45K</div>
        <div className="bg-[#E6DFF5] p-4 rounded text-gray-800">Active: 573</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded">
          <h2 className="font-semibold mb-2">Recent Activity</h2>
          <ul className="space-y-1 text-sm">
            <li>User 1 signed up</li>
            <li>User 2 signed up</li>
            <li>User 3 signed up</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button className="bg-[#DCD6F7] rounded p-2">Add User</button>
            <button className="bg-[#CDE7F6] rounded p-2">Reports</button>
            <button className="bg-[#E6DFF5] rounded p-2">Settings</button>
            <button className="bg-[#FFF1C1] rounded p-2">Messages</button>
          </div>
        </div>
      </div>

    </div>
  );
}




