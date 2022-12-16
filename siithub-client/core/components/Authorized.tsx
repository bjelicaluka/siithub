import { type FC } from "react";
import { AuthUserType } from "../contexts/Auth";
import { useIsAuthorized } from "../hooks/useIsAuthorized";

type AuthorizedProps = {
  roles?: AuthUserType[],
  children: React.ReactNode
};

export const Authorized: FC<AuthorizedProps> = ({
  children,
  roles = undefined,
}) => {

  const isAuthorized = useIsAuthorized();

  return isAuthorized({ roles }) ? (
    <>{children}</>
  ) : (
    <></>
  );
};