"use client";

import Link from "next/link";

import {
  BookOpenText,
  CalendarDays,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  CakeSlice,
  MessageSquare,
  UtensilsCrossed,
  Eye,
} from "lucide-react";

import SidebarGroup from "./SidebarGroup";

const groups = [
  {
    title: "Contenido",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/catalogos",
        label: "Catálogos",
        icon: FolderOpen,
      },
      {
        href: "/admin/productos",
        label: "Productos",
        icon: Package,
      },
      {
        href: "/admin/categorias",
        label: "Categorías",
        icon: Tags,
      },
      {
        href: "/admin/media",
        label: "Biblioteca Multimedia",
        icon: ImageIcon,
      },
    ],
  },

  {
    title: "Ventas",
    items: [
      {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: ShoppingCart,
      },
      {
        href: "/admin/agenda",
        label: "Agenda de Producción",
        icon: CalendarDays,
      },
      {
        href: "/admin/proyectos",
        label: "Proyectos Personalizados",
        icon: CakeSlice,
      },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: Users,
      },
      {
        href: "/admin/catering",
        label: "Catering",
        icon: UtensilsCrossed,
      },
    ],
  },

  {
    title: "Marketing",
    items: [
      {
        href: "/admin/visitas",
        label: "Contador de Visitas",
        icon: Eye,
      },
      {
        href: "/admin/promociones",
        label: "Promociones",
        icon: Megaphone,
      },
      {
        href: "/admin/contactos",
        label: "Contacto",
        icon: MessageSquare,
      },
      {
        href: "/admin/reclamos",
        label: "Libro de Reclamos",
        icon: BookOpenText,
      },
    ],
  },

  {
    title: "Sistema",
    items: [
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: Settings,
      },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col bg-cake-espresso text-white">
      <div className="border-b border-white/10 p-8">
        <Link href="/admin">
          <h1 className="text-2xl font-bold">
            Kelly&apos;s Cake
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Panel Administrativo
          </p>
        </Link>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto p-4">
        {groups.map((group) => (
          <SidebarGroup
            key={group.title}
            group={group}
          />
        ))}
      </div>

      <div className="border-t border-white/10 p-6">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="font-semibold">
            Kelly's Cake CMS
          </p>

          <p className="text-sm text-gray-400">
            Producción
          </p>
        </div>
      </div>
    </aside>
  );
}