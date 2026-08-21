import { LucideIcon } from "lucide-react";

export type SidebarItemType = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SidebarGroupType = {
  title: string;
  items: SidebarItemType[];
};