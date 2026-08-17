const REQUIREMENTS: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: value => value.length >= 8 },
  { label: "Uppercase & lowercase letters", test: value => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: "At least 1 number", test: value => /[0-9]/.test(value) },
  { label: "At least 1 special characters (!#$%^)", test: value => /[^A-Za-z0-9]/.test(value) },
];

export default function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {REQUIREMENTS.map(({ label, test }) => (
        <li
          key={label}
          className={`text-xs font-medium transition-colors ${
            test(password) ? "text-primary" : "text-red-500"
          }`}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
