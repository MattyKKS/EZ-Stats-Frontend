import Link from "next/link";
import { Upload } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  title:       string;
  description: string;
  action?:     ReactNode;
  showUpload?: boolean;
}

export default function Header({
  title,
  description,
  action,
  showUpload = true,
}: HeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-tight m-0">
          {title}
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">{description}</p>
      </div>

      {action ?? (showUpload && (
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-[18px] py-[10px] rounded-[10px] no-underline whitespace-nowrap transition-colors"
        >
          <Upload size={16} />
          Upload Video
        </Link>
      ))}
    </div>
  );
}
