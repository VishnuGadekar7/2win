"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard, Activity, Heart, Bell,
  Cpu, UserCog, LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Dashboard",    href: "/dashboard",         icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-purple-400" /> },
  { label: "Vitals",       href: "/dashboard#vitals",  icon: <Activity className="h-5 w-5 flex-shrink-0 text-neutral-300" /> },
  { label: "Digital Twin", href: "/dashboard#twin",    icon: <Heart className="h-5 w-5 flex-shrink-0 text-neutral-300" /> },
  { label: "Alerts",       href: "/dashboard#alerts",  icon: <Bell className="h-5 w-5 flex-shrink-0 text-neutral-300" /> },
  { label: "Devices",      href: "/dashboard#devices", icon: <Cpu className="h-5 w-5 flex-shrink-0 text-neutral-300" /> },
  { label: "Profile",      href: "/profile",           icon: <UserCog className="h-5 w-5 flex-shrink-0 text-neutral-300" /> },
];

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody
        className="justify-between gap-10 bg-neutral-950 border-r border-white/[0.06] h-screen"
      >
        {/* Top — logo + nav links */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-1">
            {NAV_LINKS.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Bottom — user + logout */}
        <div className="flex flex-col gap-1">
          <SidebarLink
            link={{
              label: user?.name ?? user?.email ?? "Account",
              href: "/profile",
              icon: (
                <div className="h-7 w-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-medium">
                  {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
                </div>
              ),
            }}
          />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-neutral-400" />
            <motion.span
              className="text-neutral-400 text-sm whitespace-pre"
              animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
            >
              Log out
            </motion.span>
          </button>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

const Logo = () => (
  <Link href="/dashboard" className="flex items-center gap-2 py-1">
    <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="font-semibold text-white text-sm whitespace-pre">
      2WIN.AI
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link href="/dashboard" className="flex items-center py-1">
    <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
  </Link>
);
