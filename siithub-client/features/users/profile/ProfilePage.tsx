import { type FC, useEffect } from "react";
import { type AuthUser, useAuthContext } from "../../../core/contexts/Auth";
import { useResult } from "../../../core/contexts/Result";
import { GithubUsernameForm } from "./GithubUsernameForm";
import { useUser } from "./useUser";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfilePicture } from "../../../core/components/ProfilePicture";
import { Button } from "../../../core/components/Button";
import Link from "next/link";

export const ProfilePage: FC = () => {

  const { result, setResult } = useResult('users');
  const userId = (useAuthContext()?.user as AuthUser)._id;
  const { user } = useUser(userId, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  return (
    <>
      {user ? <>
        <div className="px-4 sm:px-0">
          <h3 className="text-4xl font-medium leading-6 text-gray-900">Public profile</h3>
        </div>
        <div className="p-7 text-right">
          <ProfilePicture username={user.username} size={200} />
          <Button><Link href={`/${user.username}`}>Go to your personal profile</Link></Button>
        </div>
        <div>
          <PersonalInfoForm user={user}/>
        </div>
        <div className="">
          <GithubUsernameForm userId={userId} githubAccount={user.githubAccount} />
        </div>
        <div>
          <ChangePasswordForm />
        </div>
      </> : <></>}
    </>
  )
}