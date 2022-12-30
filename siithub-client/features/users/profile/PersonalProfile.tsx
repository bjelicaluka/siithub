import { type FC, useEffect } from "react";
import { type AuthUser, useAuthContext } from "../../../core/contexts/Auth";
import { useResult } from "../../../core/contexts/Result";
import { useUserByUsername } from "./useUser";
import { Button } from "../../../core/components/Button";
import Link from "next/link";
import { ProfilePicture } from "../../../core/components/ProfilePicture";
import NotFound from "../../../core/components/NotFound";

type PersonalProfileProps = {
  username: string;
};

export const PersonalProfile: FC<PersonalProfileProps> = ({ username }) => {
  const { result, setResult } = useResult("users");
  const userId = (useAuthContext()?.user as AuthUser)?._id;
  const { user, error } = useUserByUsername(username, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  if (error) return <NotFound />;

  return (
    <>
      {user ? (
        <>
          <ProfilePicture username={username} size={300} />
          <div className="text-4xl text-black p-2">{user.name}</div>
          <div className="text-2xl p-2">{user.username}</div>
          <div className="text-2xl p-2">{user.email}</div>
          <div className="text-xl p-2">{user.bio}</div>
          <div className="p-2">
            {userId === user._id ? (
              <Button>
                <Link href={"/users/profile"}>Change profile info</Link>
              </Button>
            ) : (
              <></>
            )}
          </div>
          <div className="p-2">
            <Button>
              <Link href={`/users/${username}/stars`}>Stars</Link>
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
