import { useEffect, useState, type FC } from "react";
import { type NextPage } from "next";
import { useIsAuthorized } from "../core/hooks/useIsAuthorized";
import { useRouter } from "next/router";

export type SecuredNextPage<P = {}, IP = P> = NextPage<P, IP> & {
  requireAuth: boolean;
  allowedRoles: [];
};

type AuthComponentWrapperProps = {
  requireAuth: boolean;
  allowedRoles: any[];
  children: any;
};

export const AuthComponentWrapper: FC<AuthComponentWrapperProps> = ({ requireAuth, allowedRoles, children }) => {
  const isAuthorized = useIsAuthorized();
  const authorized = isAuthorized({ roles: allowedRoles });
  const router = useRouter();
  const [calledPush, setCalledPush] = useState(false);

  useEffect(() => {
    if (requireAuth && !authorized) {
      router && !calledPush && router.push("/auth");
      setCalledPush(true);
      return;
    }
  }, [router, calledPush, requireAuth, authorized]);

  if (requireAuth && !authorized) return <></>;

  return children;
};

export default AuthComponentWrapper;
