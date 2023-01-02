import { useRouter } from "next/router";
import { type FC, useEffect } from "react";
import { onLogin, useAuthContext } from "../../core/contexts/Auth";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { type GithubAuth, type AuthenticatedUser, authenticateGithub } from "./authenticate";

let sent = false;

export const AuthGithubCallbackPage: FC = () => {
  const router = useRouter();
  const notifications = useNotifications();
  const { setResult } = useResult("auth");
  const { authDispatcher } = useAuthContext();

  const authenticateAction = useAction<GithubAuth, AuthenticatedUser>(authenticateGithub, {
    onSuccess: (authUser: AuthenticatedUser) => {
      authDispatcher(onLogin(authUser));
      setResult({ status: ResultStatus.Ok, type: "AUTHENTICATE" });
      router.push("/");
    },
    onError: (error: any) => {
      if (error.statusCode !== 404) {
        notifications.error(extractErrorMessage(error));
        setResult({ status: ResultStatus.Error, type: "AUTHENTICATE" });
        router.push("/auth");
      } else {
        router.push({
          pathname: "/registration",
          query: { githubUsername: error?.payload?.login },
        });
      }
    },
  });

  if (!sent) {
    const { code, state } = router.query;
    if (!code || !state) return <></>;

    authenticateAction({ code: code as string, state: state as string });
    sent = true;
  }

  return (
    <>
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Please, have a patience.</h2>
      </div>
    </>
  );
};
