import { type FC, type PropsWithChildren, createContext, useContext } from "react";
import { useReducerWithThunkAndImmer } from "../../core/hooks/useReducerCustom";
import {
  type PullRequest,
  type CreatePullRequest,
  type UpdatePullRequest,
  createPullRequest,
  updatePullRequest,
} from "./pullRequestActions";
import Router from "next/router";
import { notifications } from "../../core/hooks/useNotifications";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";
import { type User } from "../users/user.model";

type PullRequestContextType = {
  pullRequest: PullRequest;
  isEdit: boolean;
  pullRequestDispatcher: any;
};

export const initialPullRequest: PullRequest = {
  _id: "",
  localId: 0,
  repositoryId: "",
  events: [],
  csm: {
    title: "",
    base: "",
    compare: "",
    labels: [],
    milestones: [],
    assignees: [],
  },
};

type ActionType = {
  type: string;
  payload?: any;
};

const pullRequestReducer = {
  ["TEST"]: (state: PullRequest, action: ActionType) => {
    state.csm.title = action.payload;
    return state;
  },
  ["SET_PULL_REQUEST"]: (state: PullRequest, action: ActionType) => {
    state = { ...action.payload };
    return state;
  },
  ["DEFINE_PULL_REQUEST"]: (state: PullRequest, action: ActionType) => {
    state.csm = {
      ...state.csm,
      ...action.payload,
    };
    return state;
  },
  ["ADD_EVENT"]: (state: PullRequest, action: ActionType) => {
    state.events.push(action.payload);
    return state;
  },
  ["ASSIGN_LABEL"]: assignEntityTo("labels"),
  ["ASSIGN_MILESTONE"]: assignEntityTo("milestones"),
  ["ASSIGN_USER"]: assignEntityTo("assignees"),
  ["UNASSIGN_LABEL"]: unassignEntityFrom("labels"),
  ["UNASSIGN_MILESTONE"]: unassignEntityFrom("milestones"),
  ["UNASSIGN_USER"]: unassignEntityFrom("assignees"),
};

function assignEntityTo(entityName: "labels" | "milestones" | "assignees") {
  return (state: PullRequest, action: ActionType) => {
    state.csm[entityName]?.push(action.payload);
    return state;
  };
}

function unassignEntityFrom(entityName: "labels" | "milestones" | "assignees") {
  return (state: PullRequest, action: ActionType) => {
    state.csm[entityName] = state.csm[entityName]?.filter((e) => e !== action.payload);
    return state;
  };
}

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

export function assignLabelToPR(pullRequest: PullRequest, labelId: Label["_id"], by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "LabelAssignedEvent", labelId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "ASSIGN_LABEL", payload: labelId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function unassignLabelFromPR(pullRequest: PullRequest, labelId: Label["_id"], by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "LabelUnassignedEvent", labelId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "UNASSIGN_LABEL", payload: labelId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {});
}

export function assignMilestoneToPR(pullRequest: PullRequest, milestoneId: Milestone["_id"], by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "MilestoneAssignedEvent", milestoneId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "ASSIGN_MILESTONE", payload: milestoneId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function unassignMilestoneFromPR(pullRequest: PullRequest, milestoneId: Milestone["_id"], by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "MilestoneUnassignedEvent", milestoneId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "UNASSIGN_MILESTONE", payload: milestoneId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {});
}

export function assignUserToPR(pullRequest: PullRequest, userId: User["_id"], by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "UserAssignedEvent", userId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "ASSIGN_USER", payload: userId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function anassignUserFromPR(pullRequest: PullRequest, userId: User["_id"], by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "UserUnassignedEvent", userId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "UNASSIGN_USER", payload: userId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {});
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
