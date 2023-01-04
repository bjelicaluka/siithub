import { type FC, type PropsWithChildren, useMemo } from "react";
import { useAuthContext } from "../contexts/Auth";
import { NotAuthenticatedLayout } from "./NotAuthenticated";
import { AuthenticatedLayout } from "./Authenticated";

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();

  const Layout = useMemo(() => (user ? AuthenticatedLayout : NotAuthenticatedLayout), [user]);

  return <Layout>{children}</Layout>;
};
