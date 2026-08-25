interface HeaderProps {
  title:        string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="text-lg font-bold text-text-primary leading-tight m-0">
        {title}
      </h1>
      {description && (
        <p className="text-xs text-text-secondary mt-1">{description}</p>
      )}
    </div>
  );
}
