import Header from "@/components/Header";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function AnalysisPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 28 }}>
      <Header
        title="Analysis"
        description="All match analyses"
        action={
          <Link
            href="/upload"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#1a7a4a", color: "#fff",
              fontSize: 14, fontWeight: 500,
              padding: "10px 18px", borderRadius: 10,
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            New Analysis
          </Link>
        }
      />
    </div>
  );
}
