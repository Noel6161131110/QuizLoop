import { Home, Inbox, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

const items = [
  {
    title: "Home",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar side="left" variant="sidebar" className="flex flex-col h-full">
      <SidebarContent className="flex-1 flex flex-col justify-between">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel>QuizLoop</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="p-3 border-t flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/shadcn.png" alt="@noel" />
            <AvatarFallback>NG</AvatarFallback>
          </Avatar>
          <div className="text-sm leading-tight">
            <div className="font-medium text-foreground">Noel Paul George</div>
            <div className="text-muted-foreground text-xs">Admin</div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}