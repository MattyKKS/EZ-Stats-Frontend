import Header from "@/components/Header";

export default function UploadPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 28 }}>
      <Header title="Upload Video" description="Upload match footage for analysis" showUpload={false} />
    </div>
  );
}
