"use client"

import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const { toggleSidebar } = useSidebar()
  const isMobile = useIsMobile()
  const pathname = usePathname()

  const handleClick = () => {
    if (isMobile) {
      toggleSidebar()
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Feedr</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.url && pathname.startsWith(item.url)
          const hasActiveChild = item.items?.some(
            subItem => subItem.url && pathname.startsWith(subItem.url)
          )
          // 하위 아이템이 없는 경우
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton className={isActive ? "bg-accent text-white" : ""} asChild tooltip={item.title}>
                  <Link
                  href={item.url || "#"}
                  onClick={(e) => {
                    if (!item.url) e.preventDefault()
                    handleClick()
                  }}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // 하위 아이템이 있는 경우
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={hasActiveChild ? "bg-accent/50 text-white" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubItemActive = pathname.startsWith(subItem.url)
                      return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={isSubItemActive ? "bg-accent [&_svg]:text-white text-white" : ""}
                        >
                          <Link 
                            href={subItem.url}
                            onClick={handleClick}
                          >
                           {subItem.icon && <subItem.icon />}
                           <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
