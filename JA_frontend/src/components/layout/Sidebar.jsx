import React from "react";
import {
  Briefcase,
  User,
  CreditCard,
  Settings,
  Beaker,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { label: "Jobs", icon: Briefcase },
    { label: "Profile", icon: User },
    { label: "Subscription", icon: CreditCard },
    { label: "Settings", icon: Settings },
    { label: "Test Page", icon: Beaker }, // TEMP
  ];

  return (
    <aside
      className="
        sidebar
        h-screen
        bg-[#F5F7FA] border-r border-[#E2E8F0]
        transition-all duration-300
        overflow-hidden
      "
    >
      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon }) => (
          <div
  key={label}
  className="
    flex items-center
    h-12
    px-3
    gap-3
    text-[#64748B]
    hover:text-[#2563EB]
    hover:bg-[#EFF6FF]
    cursor-pointer
    transition-colors
    rounded-md
    mx-2
  "
>
  {/* Icon container */}
  <div
    className="
      flex items-center justify-center
      w-10 h-10
      rounded-md
      transition-colors
      group-hover:bg-[#EFF6FF]
    "
  >
    <Icon className="w-5 h-5 shrink-0" />
  </div>

  {/* Label */}
  <span
    className="
      text-sm font-medium whitespace-nowrap
      opacity-0 group-hover:opacity-100
      transition-opacity
    "
  >
    {label}
  </span>
</div>

        ))}
      </nav>
    </aside>
  );
}
