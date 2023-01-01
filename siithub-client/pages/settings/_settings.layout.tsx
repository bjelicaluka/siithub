import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { Button } from "../../core/components/Button";
import { useAuthContext } from "../../core/contexts/Auth";

const links = [
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
];

export const useSettingsLayout = (page: ReactNode) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const isActive = (path: string) => {
    return !!router && router.pathname === path;
  };

  if (!user) return <></>;

  return (
    <>
      <div className="p-7 text-right">
        <ProfilePicture username={user?.username ?? ""} size={200} />
        <Button>
          <Link href={`/users/${user?.username}`}>Go to your personal profile</Link>
        </Button>
      </div>

      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
        {links?.map((l) => {
          return (
            <li key={l.title} className="mr-2">
              {isActive(l.path) ? (
                <Link
                  href={l.path}
                  className="inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
                >
                  {l.title}
                </Link>
              ) : (
                <Link
                  href={l.path}
                  className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  {l.title}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-20">{page}</div>
    </>
  );
};
