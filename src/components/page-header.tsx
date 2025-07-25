import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  extra?: React.ReactNode;
};

export function PageHeader({ title, description, className, children, extra }: PageHeaderProps) {
  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8 border-b border-border", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {(children || extra) && (
           <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {extra}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
