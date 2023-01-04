import { useEffect, type FC, type PropsWithChildren } from "react";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { StarIcon } from "@heroicons/react/24/solid";
import { useResult } from "../../../core/contexts/Result";
import { AuthUser, useAuthContext } from "../../../core/contexts/Auth";
import { useUserByUsername } from "../../../features/users/profile/useUser";
import NotFound from "../../../core/components/NotFound";
import { ProfilePicture } from "../../../core/components/ProfilePicture";
import { Button } from "../../../core/components/Button";
import { User } from "../../../features/users/user.model";
import { VerticalMenu } from "../../../core/components/VerticalMenu";

function getLinks(router: NextRouter, user: User) {
  return [
    {
      title: "Stars",
      icon: <StarIcon className="h-6 w-6 text-gray-500" />,
      path: "/users/[username]/stars",
      onClick: async () => {
        await router.push(`/users/${user?.username}/stars`);
      },
    },
  ];
}

type UserInformationsProps = {
  user: User;
};

const UserInformations: FC<UserInformationsProps> = ({ user }) => {
  const userId = (useAuthContext()?.user as AuthUser)?._id;

  return (
    <>
      <div className="text-4xl font-medium text-black p-2">{user.name}</div>
      <div className="text-2xl p-2">{user.username}</div>
      <div className="text-xl p-2">{user.email}</div>
      <div className="text-xl p-2">{user.bio}</div>

      <div className="p-2 flex">
        {userId === user._id ? (
          <Button className="grow">
            <Link href={"/settings"}>Change profile info</Link>
          </Button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { result, setResult } = useResult("users");
  const username = router.query?.username?.toString() ?? "";
  const { user, error } = useUserByUsername(username, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const links = getLinks(router, user);

  if (error) return <NotFound />;
  if (!username || !user) return <></>;

  return (
    <>
      <div className="flex">
        <div>
          <aside className="w-96" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded">
              <ProfilePicture username={username} size={300} />
              <UserInformations user={user} />

              <div className="pt-4 mt-4 space-y-2 border-t border-gray-200" />

              <VerticalMenu links={links} />
            </div>
          </aside>
        </div>
        <div className="grow">{children}</div>
      </div>
    </>
  );
};
