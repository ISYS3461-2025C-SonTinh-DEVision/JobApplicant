import React from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#EFF6FF]">
      {/* Sidebar wrapper (hover target) */}
      <div
        className="
          group
          transition-all duration-300
          w-16 hover:w-56
        "
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
