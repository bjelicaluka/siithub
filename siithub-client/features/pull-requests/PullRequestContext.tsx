import { type FC, type PropsWithChildren, createContext, useContext } from "react";
import { useReducerWithThunkAndImmer } from "../../core/hooks/useReducerCustom";
import {
  type PullRequest,
  type CreatePullRequest,
  type UpdatePullRequest,
  type PullRequestComment,
  type PullRequestConversation,
  createPullRequest,
  updatePullRequest,
  PullRequestState,
} from "./pullRequestActions";
import Router from "next/router";
import { notifications } from "../../core/hooks/useNotifications";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";
import { type User } from "../users/user.model";
import { CommentState } from "../issues/issueActions";

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
    author: "",
    isClosed: false,
    state: PullRequestState.Opened,
    title: "",
    base: "",
    compare: "",
    labels: [],
    milestones: [],
    assignees: [],
    comments: [],
    conversations: [],
  },
};

type ActionType = {
  type: string;
  payload?: any;
};

const pullRequestReducer = {
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
  ["CREATE_COMMENT"]: (state: PullRequest, action: ActionType) => {
    if (action.payload.conversation) {
      const conversation = state?.csm?.conversations?.find((c) => c.topic === action.payload.conversation);
      conversation?.comments?.push(action.payload);
    } else {
      state.csm?.comments?.push(action.payload);
    }
    return state;
  },
  ["UPDATE_COMMENT"]: (state: PullRequest, action: ActionType) => {
    const commentToBeUpdated = findComment(state, action.payload._id);
    commentToBeUpdated.text = action.payload.text;
    return state;
  },
  ["HIDE_COMMENT"]: (state: PullRequest, action: ActionType) => {
    const commentToBeHidden = findComment(state, action.payload);
    commentToBeHidden.state = CommentState.Hidden;

    return state;
  },
  ["DELETE_COMMENT"]: (state: PullRequest, action: ActionType) => {
    const commentToBeDeleted = findComment(state, action.payload);
    commentToBeDeleted.state = CommentState.Deleted;
    return state;
  },
  ["ADD_REACTION"]: (state: PullRequest, action: ActionType) => {
    const code = action.payload.code;
    const commentToAddReactionTo = findComment(state, action.payload.commentId);

    commentToAddReactionTo.reactions[code] = commentToAddReactionTo.reactions[code] + 1 || 1;
    return state;
  },
  ["REMOVE_REACTION"]: (state: PullRequest, action: ActionType) => {
    const code = action.payload.code;
    const commentToAddReactionTo = findComment(state, action.payload.commentId);

    commentToAddReactionTo.reactions[code] = commentToAddReactionTo.reactions[code] - 1;
    if (commentToAddReactionTo.reactions[code] === 0) {
      delete commentToAddReactionTo.reactions[code];
    }
    return state;
  },
  ["CREATE_CONVERSATION"]: (state: PullRequest, action: ActionType) => {
    state?.csm?.conversations?.push(action.payload);

    return state;
  },
  ["RESOLVE_CONVERSATION"]: (state: PullRequest, action: ActionType) => {
    const conversation = findConversation(state, action.payload);
    conversation.isResolved = true;

    return state;
  },
  ["UNRESOLVE_CONVERSATION"]: (state: PullRequest, action: ActionType) => {
    const conversation = findConversation(state, action.payload);
    conversation.isResolved = false;

    return state;
  },
  ["CHANGE_STATE"]: (state: PullRequest, action: ActionType) => {
    state.csm.state = action.payload;
    state.csm.isClosed = [PullRequestState.Merged, PullRequestState.Canceled].includes(action.payload);

    return state;
  },
};

function findComment(pullRequest: PullRequest, commentId: PullRequestComment["_id"]) {
  return [
    ...(pullRequest?.csm?.conversations?.flatMap((c) => c?.comments ?? []) ?? []),
    ...(pullRequest?.csm?.comments ?? []),
  ].find((c) => c._id === commentId) as PullRequestComment;
}

function findConversation(pullRequest: PullRequest, conversationId: PullRequestConversation["_id"]) {
  return pullRequest?.csm?.conversations?.find((c) => c._id === conversationId) as PullRequestConversation;
}

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

export function createNewPullRequest(pullRequest: PullRequest, by: User["_id"], comment: string) {
  const newPullRequest: CreatePullRequest = {
    events: [
      {
        by,
        type: "PullRequestCreatedEvent",
        title: pullRequest.csm.title,
        base: pullRequest.csm.base,
        compare: pullRequest.csm.compare,
      },
      {
        by,
        type: "CommentCreatedEvent",
        text: comment,
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

export function updateAnExistingPullRequest(pullRequest: PullRequest, by: User["_id"]) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [
      {
        by,
        type: "PullRequestUpdatedEvent",
        base: pullRequest.csm.base,
        compare: pullRequest.csm.compare,
        title: pullRequest.csm.title,
      },
    ],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        notifications.success("You have successfully updated an existing pull request.");
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {
        notifications.error(error?.response?.data?.message);
      });
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

export function createCommentOnPR(pullRequest: PullRequest, by: User["_id"], text: string, conversation?: string) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "CommentCreatedEvent", text, conversation }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        notifications.success("You have successfully created a comment.");
        const commentCreated = resp.data.events.pop();
        dispatch({
          type: "CREATE_COMMENT",
          payload: { _id: commentCreated.commentId, text, conversation, state: CommentState.Existing, reactions: {} },
        });
        dispatch({ type: "ADD_EVENT", payload: commentCreated });
      })
      .catch((_) => {});
}

export function updateCommentOnPR(pullRequest: PullRequest, by: User["_id"], commentId: string, text: string) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "CommentUpdatedEvent", commentId, text }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        notifications.success("You have successfully updated a comment.");
        const commentUpdated = resp.data.events.pop();
        dispatch({ type: "UPDATE_COMMENT", payload: { _id: commentId, text } });
        dispatch({ type: "ADD_EVENT", payload: commentUpdated });
      })
      .catch((_) => {});
}

export function deleteCommentOnPR(pullRequest: PullRequest, by: User["_id"], commentId: string) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "CommentDeletedEvent", commentId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        notifications.success("You have successfully deleted a comment.");
        dispatch({ type: "DELETE_COMMENT", payload: commentId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function hideCommentOnPR(pullRequest: PullRequest, by: User["_id"], commentId: string) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "CommentHiddenEvent", commentId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        notifications.success("You have successfully hid a comment.");
        dispatch({ type: "HIDE_COMMENT", payload: commentId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function addReactionToPRComment(
  pullRequest: PullRequest,
  by: User["_id"],
  commentId: PullRequestComment["_id"],
  code: string
) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "UserReactedEvent", commentId, code }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "ADD_REACTION", payload: { commentId, code } });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function removeReactionFromPRComment(
  pullRequest: PullRequest,
  by: User["_id"],
  commentId: PullRequestComment["_id"],
  code: string
) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "UserUnreactedEvent", commentId, code }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        dispatch({ type: "REMOVE_REACTION", payload: { commentId, code } });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function addConversation(pullRequest: PullRequest, by: User["_id"], topic: string, changes: any) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "ConversationCreatedEvent", topic, changes }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        const conversationCreated = resp.data.events.pop();
        dispatch({
          type: "CREATE_CONVERSATION",
          payload: { _id: conversationCreated.conversationId, isResolved: false, topic, changes, comments: [] },
        });
        dispatch({ type: "ADD_EVENT", payload: conversationCreated });
      })
      .catch((_) => {});
}

export function resolveConversation(
  pullRequest: PullRequest,
  by: User["_id"],
  conversationId: PullRequestConversation["_id"]
) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "ConversationResolvedEvent", conversationId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        const conversationResolved = resp.data.events.pop();
        dispatch({
          type: "RESOLVE_CONVERSATION",
          payload: conversationResolved.conversationId,
        });
        dispatch({ type: "ADD_EVENT", payload: conversationResolved });
      })
      .catch((_) => {});
}

export function unresolveConversation(
  pullRequest: PullRequest,
  by: User["_id"],
  conversationId: PullRequestConversation["_id"]
) {
  const newPullRequest: UpdatePullRequest = {
    localId: pullRequest.localId,
    events: [{ by, type: "ConversationUnresolvedEvent", conversationId }],
    repositoryId: pullRequest.repositoryId,
  };

  return (dispatch: any) =>
    updatePullRequest(newPullRequest)
      .then((resp) => {
        const conversationUnresolved = resp.data.events.pop();
        dispatch({
          type: "UNRESOLVE_CONVERSATION",
          payload: conversationUnresolved.conversationId,
        });
        dispatch({ type: "ADD_EVENT", payload: conversationUnresolved });
      })
      .catch((_) => {});
}

export function approvePullRequest(pullRequest: PullRequest, by: User["_id"]) {
  return changePullRequestState(
    "PullRequestApprovedEvent",
    PullRequestState.Approved,
    "You have successfully approved this Pull Request."
  )(pullRequest, by);
}

export function requireChangesForPullRequest(pullRequest: PullRequest, by: User["_id"]) {
  return changePullRequestState(
    "PullRequestChangesRequiredEvent",
    PullRequestState.ChangesRequired,
    "You have successfully requested changes for this Pull Request."
  )(pullRequest, by);
}

export function cancelPullRequest(pullRequest: PullRequest, by: User["_id"]) {
  return changePullRequestState(
    "PullRequestCanceledEvent",
    PullRequestState.Canceled,
    "You have successfully canceled this Pull Request."
  )(pullRequest, by);
}

export function mergePullRequest(pullRequest: PullRequest, by: User["_id"]) {
  return changePullRequestState(
    "PullRequestMergedEvent",
    PullRequestState.Merged,
    "You have successfully merged this Pull Request.",
    "Unable to merge pull request because of conflicts."
  )(pullRequest, by);
}

function changePullRequestState(eventType: string, newState: PullRequestState, message: string, errorMessage?: string) {
  return (pullRequest: PullRequest, by: User["_id"]) => {
    const newPullRequest: UpdatePullRequest = {
      localId: pullRequest.localId,
      events: [{ by, type: eventType }],
      repositoryId: pullRequest.repositoryId,
    };

    return (dispatch: any) =>
      updatePullRequest(newPullRequest)
        .then((resp) => {
          notifications.success(message);
          const pullRequestCanceled = resp.data.events.pop();
          dispatch({
            type: "CHANGE_STATE",
            payload: newState,
          });
          dispatch({ type: "ADD_EVENT", payload: pullRequestCanceled });
        })
        .catch((_: any) => errorMessage && notifications.error(errorMessage));
  };
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
