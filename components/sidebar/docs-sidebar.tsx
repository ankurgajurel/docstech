"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { buildNavigation, type NavItem } from "@/components/sidebar/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function DocsSidebar({ apiItems }: { apiItems: NavItem[] }) {
  const pathname = usePathname()
  const navigation = buildNavigation(apiItems)

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.title} className="px-4">
            <SidebarGroupLabel>
              <group.icon className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
