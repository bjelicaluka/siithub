import axios from "axios"
import { createContext, type FC, type PropsWithChildren, useContext, useEffect, useReducer } from "react"
import { setAxiosInterceptors } from "../utils/axios"
import { getToken, getUserIdFromToken, removeToken, setToken } from "../utils/token"

export enum AuthUserType {
  None = -1,
  Developer,
  Admin
};

export type AuthUser = {
  _id: string,
  username: string,
  type: AuthUserType
}

type AuthContextType = {
  user?: AuthUser,
  isAuthenticated: boolean,
  authDispatcher: (f: any) => any
}

const initialAuthContextValues = {
  user: undefined,
  isAuthenticated: false,
  authDispatcher: () => {}
};

const AuthContext = createContext<AuthContextType>(initialAuthContextValues);


type ActionType = {
  type: string,
  payload?: AuthUser
}

function authReducer(user: AuthUser | undefined, action: ActionType) {
  switch (action.type) {
    case 'login': {
      return {
        ...user,
        ...action.payload
      };
    }
    case 'logout': {
      return undefined;
    }
  }
}

export function onLogin({ user, token }: any) {
  setToken(token);

  setAxiosInterceptors(axios, () => {
    _authDispatcher(onLogout());
  })

  return {
    type: 'login',
    payload: user
  };
}

export function onLogout() {
  removeToken();
  window.location.href = "/";

  return {
    type: 'logout'
  };
}

export const useAuthContext = () => useContext(AuthContext);

let _authDispatcher: any = null;

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {

  const [user, authDispatcher] = useReducer<any>(authReducer, undefined);
  const isAuthenticated = !!user;
  _authDispatcher = authDispatcher;

  useEffect(() => {
    if (!getToken()) return;

    axios.get('/api/users/' + getUserIdFromToken())
      .then((response: any) => {
        const auth = { user: response.data as AuthUser, token: getToken() + '' };
        _authDispatcher(onLogin(auth));
      })
      .catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user: user as AuthUser, isAuthenticated, authDispatcher }}>
      {children}
    </AuthContext.Provider>

  );
}