"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SidebarItemType } from "./types/sidebar.type";

type Props = {
  item: SidebarItemType;
};

export default function SidebarItem({
  item,
}: Props) {
  const pathname = usePathname();

  const active =
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={[
        "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
        active
          ? "bg-cake-gold text-white shadow-md"
          : "text-gray-300 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <Icon
        size={20}
        className={
          active
            ? "text-white"
            : "text-gray-400 group-hover:text-white"
        }
      />

      <span className="font-medium">
        {item.label}
      </span>
    </Link>
  );
}