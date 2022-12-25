import { AuthUserType, useAuthContext } from "../contexts/Auth";

export type IsAuthorizedParams = {
  roles?: AuthUserType[];
};

export type IsAuthorizedFunction = (params?: IsAuthorizedParams) => boolean;

export function useIsAuthorized(): IsAuthorizedFunction {
  const { isAuthenticated, user } = useAuthContext();

  return ({ roles = undefined } = {}) => {
    const hasOneOfRoles = !roles || roles.includes(user?.type ?? -1)    
    return hasOneOfRoles && isAuthenticated;
  };

}
export const useIsUnauthorized: () => boolean = () => {
  const { isAuthenticated } = useAuthContext();

  return !isAuthenticated;
}