import React, { useContext, useEffect, useReducer } from "react";
import LocalStorage, { LocalStorageKey } from "services/LocalStorage";

export interface UserEntity {
  id: number;
  publicAddress: string;
  avatar?: string;
  username?: string;
}

interface IAuthState {
  user: UserEntity | null;
  loading?: boolean;
  error?: any;
}

export enum AuthActionType {
  Login = "Login",
  Logout = "Logout",
  Reset = "Reset",
}

const initialState: IAuthState = {
  user: null,
  loading: false,
  error: null,
};

export const AuthContext = React.createContext<{
  state: IAuthState;
  dispatch: (action: any) => void;
}>({
  state: initialState,
  dispatch: () => {},
});

export const isLoggedIn = () => {
  return !!LocalStorage.getItem(LocalStorageKey.token);
};

const reducer = (state: IAuthState, action: any): IAuthState => {
  switch (action.type) {
    case AuthActionType.Login:
      return {
        ...state,
        user: action.payload.user,
      };
    case AuthActionType.Logout:
    case AuthActionType.Reset:
      return {
        ...state,
      };
    default:
      return state;
  }
};

const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  useEffect(() => {
    const token = LocalStorage.getItem(LocalStorageKey.token);
    if (token) {
    } else {
      dispatch({ type: AuthActionType.Reset });
    }
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthorization = () => useContext(AuthContext) ?? {};

export default AuthProvider;
