import AdminUploadClient from "@/components/admin/AdminUploadClient";

export default function AdminPage() {
  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-[min(900px,92vw)] py-10">
        <AdminUploadClient />
      </div>
    </main>
  );
}
