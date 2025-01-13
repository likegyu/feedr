'use client';

import { Table2, Share2, SlidersHorizontal, Smartphone, Monitor, Filter, BellRing, FileText } from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

const navItems = [
  {
    title: '대시보드',
    url: '/dashboard',
    icon: Table2,
  },
  {
    title: 'Instagram 연동',
    url: '/instagram',
    icon: Share2,
  },
  {
    title: '공지사항',
    url: '/notices',
    icon: BellRing,
  },
  {
    title: 'API 문서',
    url: '/api-docs',
    icon: FileText,
  },
  {
    title: '피드 설정',
    icon: SlidersHorizontal,
    items: [
      { title: '모바일 레이아웃', icon: Smartphone, url: '/settings/mobile' },
      { title: 'PC 레이아웃', icon: Monitor, url: '/settings/pc' },
      { title: '필터 설정', icon: Filter, url: '/settings/filter' }
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader><NavUser /></SidebarHeader>
      <SidebarContent><NavMain items={navItems} /></SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
