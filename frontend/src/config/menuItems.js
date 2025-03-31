// src/config/menuItems.js
import { Gauge, Users, PieChart, MessageCircle, UserCog, LogOut } from 'lucide-react';

export const menuItems = [
  {
    icon: Gauge,
    label: "Dashboard",
    route: "/dashboard",
    roles: ["admin", "rh", "mentor", "mentee"] // autorisé pour tout le monde
  },
  {
    icon: Users,
    label: "Users",
    route: "/users",
    roles: ["admin", "rh"] // seulement admin & rh
  },
  {
    icon: PieChart,
    label: "Analytics",
    route: "/analytics",
    roles: ["admin", "rh"] 
  },
  {
    icon: MessageCircle,
    label: "Messages",
    route: "/messages",
    roles: ["admin", "rh", "mentor", "mentee"] 
  },
  {
    icon: UserCog,
    label: "Settings",
    route: "/settings",
    roles: ["admin","rh","mentor","mentee"] 
  },
  // ... d'autres items
];
