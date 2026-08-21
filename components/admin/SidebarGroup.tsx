import SidebarItem from "./SidebarItem";

import { SidebarGroupType } from "./types/sidebar.type";

type Props = {
  group: SidebarGroupType;
};

export default function SidebarGroup({
  group,
}: Props) {
  return (
    <div className="space-y-2">
      <p className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {group.title}
      </p>

      {group.items.map((item) => (
        <SidebarItem
          key={item.href}
          item={item}
        />
      ))}
    </div>
  );
}