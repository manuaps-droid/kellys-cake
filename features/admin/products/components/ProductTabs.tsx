"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";

type Tab = {
  value: string;
  label: string;
  disabled?: boolean;
  content: React.ReactNode;
};

type Props = {
  defaultValue: string;
  tabs: Tab[];
};

export default function ProductTabs({
  defaultValue,
  tabs,
}: Props) {
  return (
    <Tabs
      defaultValue={defaultValue}
      className="space-y-6"
    >
      <div className="overflow-x-auto">
        <TabsList className="w-max min-w-full justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}