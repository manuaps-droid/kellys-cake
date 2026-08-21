type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-cake-espresso">
          {title}
        </h1>

        {description && (
          <p className="mt-3 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div>
          {actions}
        </div>
      )}
    </div>
  );
}