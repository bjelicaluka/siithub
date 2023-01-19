import { type FC, type PropsWithChildren, createContext, useContext } from "react";
import { useReducerWithThunkAndImmer } from "../../core/hooks/useReducerCustom";
import { type CreatePullRequest, type PullRequest, createPullRequest } from "./pullRequestActions";
import { type User } from "../users/user.model";
import { notifications } from "../../core/hooks/useNotifications";
import Router from "next/router";

type PullRequestContextType = {
  pullRequest: PullRequest;
  isEdit: boolean;
  pullRequestDispatcher: any;
};

export const initialPullRequest = {
  _id: "",
  localId: 0,
  repositoryId: "",
  events: [],
  csm: {
    title: "",
    base: "",
    compare: "",
  },
};

type ActionType = {
  type: string;
  payload?: any;
};

const pullRequestReducer = {
  ["TEST"]: (state: any, action: ActionType) => {
    state.csm.title = action.payload;
    return state;
  },
  ["SET_PULL_REQUEST"]: (state: any, action: ActionType) => {
    state = { ...action.payload };
    return state;
  },
  ["DEFINE_PULL_REQUEST"]: (state: any, action: ActionType) => {
    state.csm = {
      ...state.csm,
      ...action.payload,
    };
    return state;
  },
};

export function createNewPullRequest(pullRequest: PullRequest, by: User["_id"]) {
  const newPullRequest: CreatePullRequest = {
    events: [
      {
        by,
        type: "PullRequestCreatedEvent",
        title: pullRequest.csm.title,
        base: pullRequest.csm.base,
        compare: pullRequest.csm.compare,
      },
      ...pullRequest.events,
    ],
    repositoryId: pullRequest.repositoryId,
  };

  createPullRequest(newPullRequest)
    .then((resp) => {
      Router.push(`${Router.asPath.replace("new", "")}${resp.data.localId}`);
      notifications.success("You have successfully created a new pull request.");
    })
    .catch((_) => {});

  return {};
}

export function setPullRequest(pullRequest: PullRequest) {
  return (dispatch: any) => dispatch({ type: "SET_PULL_REQUEST", payload: pullRequest });
}

export function updateData(data: { title: string; base: string; compare: string }) {
  return (dispatch: any) => {
    dispatch({ type: "DEFINE_PULL_REQUEST", payload: data });
  };
}

const initialPullRequestContextValues = {
  pullRequest: initialPullRequest,
  isEdit: false,
  pullRequestDispatcher: () => () => null,
};

const PullRequestContext = createContext<PullRequestContextType>(initialPullRequestContextValues);

export const usePullRequestContext = () => useContext(PullRequestContext);

export const PullRequestContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [pullRequest, pullRequestDispatcher] = useReducerWithThunkAndImmer<any, any>(
    pullRequestReducer,
    initialPullRequest
  );

  const isEdit = !!(pullRequest as PullRequest)._id;

  return (
    <PullRequestContext.Provider value={{ pullRequest: pullRequest as any, isEdit, pullRequestDispatcher }}>
      {children}
    </PullRequestContext.Provider>
  );
};
