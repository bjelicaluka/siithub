import { useEffect, type FC } from "react";
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
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isAuthorized({ roles: allowedRoles })) {
      router && router.push("/auth");
      return;
    }
  }, [router, requireAuth, allowedRoles, isAuthorized]);

  return children;
};
