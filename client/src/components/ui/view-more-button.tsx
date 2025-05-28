
import { Link } from 'wouter';
import { ReactNode } from 'react';

interface ViewMoreButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ViewMoreButton({ href, children, className = "" }: ViewMoreButtonProps) {
  return (
    <div className={`flex justify-end mt-2 pt-0 ${className}`}>
      <Link href={href}>
        <button className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200">
          {children}
        </button>
      </Link>
    </div>
  );
}
