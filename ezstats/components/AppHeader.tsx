import Image from "next/image";
import TeamSwitcher from "./TeamSwitcher";
import ProfileMenu from "./ProfileMenu";

export default function AppHeader() {
  return (
    <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-border flex-shrink-0">
      <Image
        src="/logo.png"
        alt="EzStats"
        width={128}
        height={40}
        className="object-contain"
      />
      <div className="flex items-center gap-3">
        <TeamSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}
