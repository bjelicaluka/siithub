import Link from "next/link";
import { type FC, type PropsWithChildren } from "react";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { Button } from "../../core/components/Button";
import { useAuthContext } from "../../core/contexts/Auth";
import { HorizontalMenu, type MenuItem } from "../../core/components/HorizontalMenu";

const links: MenuItem[] = [
  {
    title: "Profile",
    path: "/settings",
  },
  {
    title: "Github Account",
    path: "/settings/github",
  },
  {
    title: "Change password",
    path: "/settings/password",
  },
  {
    title: "Ssh Key",
    path: "/settings/ssh-key",
  },
];

export const SettingsLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) return <></>;

  return (
    <>
      <div className="p-7 text-right">
        <ProfilePicture username={user?.username ?? ""} size={200} />
        <Button>
          <Link href={`/users/${user?.username}`}>Go to your personal profile</Link>
        </Button>
      </div>

      <HorizontalMenu links={links} />

      <div className="mt-10">{children}</div>
    </>
  );
};

export default SettingsLayout;
