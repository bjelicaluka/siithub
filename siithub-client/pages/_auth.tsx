import { type FC } from "react";
import { type NextPage } from "next";
import ErrorPage from "next/error";
import { useIsAuthorized } from "../core/hooks/useIsAuthorized";

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

  if (!requireAuth) {
    return children;
  }

  return isAuthorized({ roles: allowedRoles }) ? children : <ErrorPage statusCode={404} />;
};
