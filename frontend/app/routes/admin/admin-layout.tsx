import { useEffect } from "react";
import { Outlet } from "react-router";
import { toast } from "sonner";

import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { Toaster } from "~/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000/notifications");

    socket.onopen = () => {
      console.log("WebSocket connected ✅");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received from WebSocket:", data);


      toast("New Notifcation", {
        description: data.message,

      });

    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <div className="flex min-h-screen">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1">
            <SidebarTrigger />
            <Outlet />
          </main>
        </SidebarProvider>
        <Toaster position="top-right" richColors />
      </div>
    </>
  );
}