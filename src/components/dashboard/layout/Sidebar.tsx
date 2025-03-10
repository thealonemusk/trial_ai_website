import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  FolderKanban,
  ClipboardList,
  CalendarDays,
  UserCog,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const Sidebar = ({
  activeItem = "Home",
  onItemClick = () => {},
}: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: <Home size={20} />, label: "Home", href: "/" },
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    { icon: <FolderKanban size={20} />, label: "Projects", href: "/dashboard" },
    { icon: <Calendar size={20} />, label: "Calendar", href: "/dashboard" },
    { icon: <Users size={20} />, label: "Team", href: "/dashboard" },
  ];

  const leaveItems = [
    {
      icon: <ClipboardList size={20} />,
      label: "Leave Dashboard",
      href: "/leave/dashboard",
    },
    {
      icon: <CalendarDays size={20} />,
      label: "Leave Calendar",
      href: "/leave/calendar",
    },
    { icon: <UserCog size={20} />, label: "Leave Admin", href: "/leave/admin" },
  ];

  const bottomItems = [
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard" },
    { icon: <HelpCircle size={20} />, label: "Help", href: "/dashboard" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  return (
    <div className="w-[280px] h-full bg-background border-r flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Workspace</h2>
        <p className="text-sm text-muted-foreground">
          Manage your projects and leaves
        </p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="text-sm font-medium px-4 py-2">Leave Management</h3>
          {leaveItems.map((item) => (
            <Link key={item.label} to={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t">
        {bottomItems.map((item) => (
          <Link key={item.label} to={item.href}>
            <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
              {item.icon}
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
