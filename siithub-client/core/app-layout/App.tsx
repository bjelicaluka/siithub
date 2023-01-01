import { FC, PropsWithChildren } from "react";
import { useAuthContext } from "../contexts/Auth";
import { NotAuthenticatedLayout } from "./NotAuthenticated";
import { AuthenticatedLayout } from "./Authenticated";

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) return <NotAuthenticatedLayout>{children}</NotAuthenticatedLayout>;

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};
