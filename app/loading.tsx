import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <main className="min-h-[60svh] bg-white">
      <div className="mx-auto w-[min(1200px,92vw)] py-16">
        <Skeleton rows={10} />
      </div>
    </main>
  );
}
