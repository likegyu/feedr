'use client';

import { Table2, Share2, SlidersHorizontal, Smartphone, Monitor, Filter, BellRing, FileText, } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"


const data = {
  user: {
    name: '김코딩',
    email: '',
  },
  navMain : [
  {
    title: '대시보드',
    url: '/dashboard',
    icon: Table2,
    description: '피드 연동 현황 및 통계'
  },
  {
    title: 'Instagram 연동',
    url: '/instagram',
    icon: Share2,
    description: '인스타그램 계정을 연동하여 관리'
  },
  {
    title: '공지사항',
    url: '/notices',
    icon: BellRing,
    description: '서비스 공지 및 업데이트'
  },
  {
    title: 'API 문서',
    url: '/api-docs',
    icon: FileText,
    description: 'API 연동 가이드 및 문서'
  },
  {
    title: '피드 설정',
    icon: SlidersHorizontal,
    description: '피드 표시 방식 및 스타일 설정',
    items: [
      {
        title: '모바일 레이아웃',
        icon: Smartphone,
        url: '/settings/mobile'
      },
      {
        title: 'PC 레이아웃',
        icon: Monitor,
        url: '/settings/pc'
      },
      {
        title: '필터 설정',
        icon: Filter,
        url: '/settings/filter'
      }
    ],
  },

],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
  

export default Sidebar;
