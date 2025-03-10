import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-blue-500" />,
      title: "Smart Leave Calendar",
      description:
        "View team availability and plan your time off with our interactive calendar.",
    },
    {
      icon: <Clock className="h-10 w-10 text-purple-500" />,
      title: "Effortless Requests",
      description:
        "Submit leave requests in seconds with our streamlined form process.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-green-500" />,
      title: "Quick Approvals",
      description:
        "Managers can review and respond to leave requests with just a few clicks.",
    },
    {
      icon: <Users className="h-10 w-10 text-amber-500" />,
      title: "Team Visibility",
      description:
        "See who's available and coordinate time off with your entire team.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl">
              <span className="text-primary">Leave</span>Manager
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/leave/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.email || ""}
                        />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
          {/* Background Elements */}
          <div className="absolute -top-24 -left-20 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute -right-20 top-20 -z-10 h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-green-500/10 blur-[100px]" />

          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Simplify Leave Management
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A comprehensive solution for managing employee time off,
                    streamlining approvals, and maintaining team visibility.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to={user ? "/leave/dashboard" : "/signup"}>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {user ? "Go to Dashboard" : "Get Started"}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      {user ? "View Calendar" : "Sign In"}
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative w-full max-w-[500px] overflow-hidden rounded-lg border bg-background p-2 shadow-xl">
                  <div className="rounded-md bg-slate-50 p-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Leave Calendar</h3>
                          <p className="text-xs text-gray-500">July 2024</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <div key={i} className="py-1 text-gray-500">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => (
                        <div
                          key={i}
                          className={`rounded-md py-2 ${
                            i === 14 || i === 15
                              ? "bg-blue-100 text-blue-800"
                              : i === 20 || i === 21
                                ? "bg-green-100 text-green-800"
                                : i === 25
                                  ? "bg-red-100 text-red-800"
                                  : "hover:bg-gray-100"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex space-x-2 text-xs">
                      <div className="flex items-center">
                        <div className="mr-1 h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>Sick Leave</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Vacation</span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-1 h-2 w-2 rounded-full bg-red-500"></div>
                        <span>Holiday</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Everything You Need
                </h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our leave management system provides all the tools you need to
                  efficiently manage time off.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="rounded-full border-8 border-primary/10 p-2">
                    {feature.icon}
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-500">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of companies that trust our leave management
                  system.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col gap-2 min-[400px]:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link to={user ? "/leave/dashboard" : "/signup"}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    {user ? "Go to Dashboard" : "Sign Up Now"}
                  </Button>
                </Link>
                <Link to="/admin-info">
                  <Button size="lg" variant="outline">
                    Admin Info
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              © 2024 LeaveManager. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link to="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link to="#" className="text-sm text-gray-500 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
