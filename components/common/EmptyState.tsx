import Link from "next/link";

import Empty from "@/components/ui/Empty";

type EmptyStateProps = {
  title: string;

  description: string;

  actionLabel?: string;

  actionHref?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Empty
      title={title}
      description={description}
      action={
        actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="rounded-xl bg-cake-espresso px-6 py-3 font-semibold text-white transition hover:bg-cake-chocolate"
          >
            {actionLabel}
          </Link>
        ) : undefined
      }
    />
  );
}