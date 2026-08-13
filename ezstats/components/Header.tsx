import Link from "next/link";
import { Plus } from "lucide-react";
import { ReactNode } from "react";
import TeamSwitcher from "./TeamSwitcher";

interface HeaderProps {
  title:              string;
  description:        string;
  action?:            ReactNode;
  showNewAnalysis?:   boolean;
  showTeamSwitcher?:  boolean;
}

export default function Header({
  title,
  description,
  action,
  showNewAnalysis = true,
  showTeamSwitcher = true,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 mb-5 border-b border-border">
      <div>
        <h1 className="text-xl font-bold text-text-primary leading-tight m-0">
          {title}
        </h1>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        {showTeamSwitcher && <TeamSwitcher />}
        {action ?? (showNewAnalysis && (
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-medium px-3 py-2 rounded-lg no-underline whitespace-nowrap transition-colors"
          >
            <Plus size={13} />
            New Analysis
          </Link>
        ))}
      </div>
    </div>
  );
}
