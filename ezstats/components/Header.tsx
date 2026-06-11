import Link from "next/link";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  title:       string;
  description: string;
  action?:     ReactNode;   // custom button/element — defaults to Upload Video
  showUpload?: boolean;     // set false to hide the default Upload Video button
}

export default function Header({
  title,
  description,
  action,
  showUpload = true,
}: HeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>
          {description}
        </p>
      </div>

      {/* Custom action takes priority; falls back to Upload Video */}
      {action ?? (showUpload && (
        <Link
          href="/upload"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#1a7a4a",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 10,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={16} />
          New Analysis
        </Link>
      ))}
    </div>
  );
}
