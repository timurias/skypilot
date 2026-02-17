'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  LayoutDashboard,
  Map,
  PlayCircle,
  SlidersHorizontal,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Drone, SkyPilotLogo } from '@/components/icons';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/editor', label: 'UAV Editor', icon: SlidersHorizontal },
  { href: '/planner', label: 'Mission Planner', icon: Map },
  { href: '/simulator', label: 'Simulator', icon: PlayCircle },
  { href: '/retrain', label: 'Re-training', icon: BrainCircuit },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div
            data-sidebar="header-content"
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <Drone className="size-7 text-primary" />
            <span className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
              SkyPilot AI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
           <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
            <User className="size-5" />
            <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">Demo User</span>
                <span className="text-xs text-muted-foreground">Logout</span>
            </div>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
          <SidebarTrigger />
          <h1 className="font-headline text-xl font-semibold text-primary">
            SkyPilot AI
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
