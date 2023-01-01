import { type FC, useEffect } from "react";
import { type AuthUser, useAuthContext } from "../../../core/contexts/Auth";
import { useResult } from "../../../core/contexts/Result";
import { GithubUsernameForm } from "./GithubUsernameForm";
import { useUser } from "./useUser";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const PersonalInformationsPage: FC = () => {
  const { result, setResult } = useResult("users");
  const userId = (useAuthContext()?.user as AuthUser)?._id;
  const { user } = useUser(userId, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  if (!user) return <></>;

  return (
    <>
      <PersonalInfoForm user={user} />
    </>
  );
};

export const GithubAccountPage: FC = () => {
  const { result, setResult } = useResult("users");
  const userId = (useAuthContext()?.user as AuthUser)?._id;
  const { user } = useUser(userId, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  if (!user) return <></>;

  return (
    <>
      <>
        <GithubUsernameForm key={user.githubAccount?.username} userId={userId} githubAccount={user.githubAccount} />
      </>
    </>
  );
};

export const ChangePasswordPage: FC = () => {
  return (
    <>
      <ChangePasswordForm />
    </>
  );
};
