// Coach profile display shown in the header
export default function ProfileMenu() {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
      <span className="w-8 h-8 rounded-full bg-primary-bg text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
        H
      </span>
      <span className="text-sm font-medium text-text-primary">Coach Htet</span>
    </div>
  );
}
