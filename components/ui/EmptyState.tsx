type Props = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-sm border border-black/10 bg-white p-10 text-center shadow-sm">
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-2 text-sm text-black/60">{description}</p>
    </div>
  );
}
