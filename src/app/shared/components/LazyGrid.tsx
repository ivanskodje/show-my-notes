import React from "react";

export function LazyGrid<T>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
      ))}
    </div>
  );
}
