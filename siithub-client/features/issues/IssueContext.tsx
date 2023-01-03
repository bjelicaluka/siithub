import { type FC, PropsWithChildren, createContext, useContext } from "react";
import {
  type CreateIssue,
  type Issue,
  IssueState,
  type UpdateIssue,
  createIssue,
  updateIssue,
  CommentState,
} from "./issueActions";
import { useReducerWithThunk } from "../../core/hooks/useReducerWithThunk";
import Router from "next/router";
import { notifications } from "../../core/hooks/useNotifications";
import { type User } from "../users/user.model";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";
import { type Comment } from "./issueActions";

type IssueContextType = {
  issue: Issue;
  isEdit: boolean;
  issueDispatcher: any;
};

export const initialIssue = {
  _id: "",
  repositoryId: "",
  events: [],
  csm: {
    state: IssueState.Open,
    labels: [],
    milestones: [],
    assignees: [],
    comments: [],
    title: "",
    description: "",
  },
};

const initialIssueContextValues = {
  issue: initialIssue,
  isEdit: false,
  issueDispatcher: () => {},
};

type ActionType = {
  type: string;
  payload?: any;
};

function issueReducer(issue: Issue, action: ActionType) {
  switch (action.type) {
    case "SET_ISSUE": {
      return {
        ...action.payload,
      };
    }

    case "ADD_EVENT": {
      const events = [...issue.events, action.payload];
      return {
        ...issue,
        events,
      };
    }

    case "DESCRIBE_ISSUE": {
      return {
        ...issue,
        csm: {
          ...issue.csm,
          ...action.payload,
        },
      };
    }

    case "CHANGE_STATE": {
      return {
        ...issue,
        csm: {
          ...issue.csm,
          state: action.payload,
        },
      };
    }

    case "ASSIGN_LABEL": {
      const labels = [...(issue.csm?.labels ?? []), action.payload];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          labels,
        },
      };
    }

    case "UNASSIGN_LABEL": {
      const labels = issue.csm?.labels?.filter((l) => l !== action.payload) ?? [];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          labels,
        },
      };
    }

    case "ASSIGN_MILESTONE": {
      const milestones = [...(issue.csm?.milestones ?? []), action.payload];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          milestones,
        },
      };
    }

    case "UNASSIGN_MILESTONE": {
      const milestones = issue.csm?.milestones?.filter((m) => m !== action.payload) ?? [];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          milestones,
        },
      };
    }

    case "ASSIGN_USER": {
      const assignees = [...(issue.csm?.assignees ?? []), action.payload];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          assignees,
        },
      };
    }

    case "UNASSIGN_USER": {
      const assignees = issue.csm?.assignees?.filter((l) => l !== action.payload) ?? [];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          assignees,
        },
      };
    }
    case "CREATE_COMMENT": {
      const comments = [...(issue.csm?.comments ?? []), action.payload];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          comments,
        },
      };
    }
    case "UPDATE_COMMENT": {
      const comments = [...(issue.csm?.comments ?? [])];
      const commentToBeUpdated = comments.find((c) => c._id === action.payload._id) as Comment;
      commentToBeUpdated.text = action.payload.text;
      return {
        ...issue,
        csm: {
          ...issue.csm,
          comments,
        },
      };
    }
    case "DELETE_COMMENT": {
      const comments = [...(issue.csm?.comments ?? [])];
      const commentToBeDeleted = comments.find((c) => c._id === action.payload) as Comment;
      commentToBeDeleted.state = CommentState.Deleted;

      return {
        ...issue,
        csm: {
          ...issue.csm,
          comments,
        },
      };
    }
    case "HIDE_COMMENT": {
      const comments = [...(issue.csm?.comments ?? [])];
      const commentToBeHidden = comments.find((c) => c._id === action.payload) as Comment;
      commentToBeHidden.state = CommentState.Hidden;

      return {
        ...issue,
        csm: {
          ...issue.csm,
          comments,
        },
      };
    }
    case "ADD_REACTION": {
      const code = action.payload.code;
      const comments = [...(issue.csm?.comments ?? [])];
      const commentToAddReactionTo = comments.find((c) => c._id === action.payload.commentId) as Comment;

      commentToAddReactionTo.reactions[code] = commentToAddReactionTo.reactions[code] + 1 || 1;

      return {
        ...issue,
        csm: {
          ...issue.csm,
          comments,
        },
      };
    }
    case "REMOVE_REACTION": {
      const code = action.payload.code;
      const comments = [...(issue.csm?.comments ?? [])];
      const commentToAddReactionTo = comments.find((c) => c._id === action.payload.commentId) as Comment;

      commentToAddReactionTo.reactions[code] = commentToAddReactionTo.reactions[code] - 1;

      if (commentToAddReactionTo.reactions[code] === 0) {
        delete commentToAddReactionTo.reactions[code];
      }

      return {
        ...issue,
        csm: {
          ...issue.csm,
          comments,
        },
      };
    }
    default:
      return {
        ...issue,
      };
  }
}

export function setIssue(issue: Issue) {
  return (dispatch: any) => dispatch({ type: "SET_ISSUE", payload: issue });
}

export function createNewIssue(issue: Issue, by: User["_id"]) {
  const newIssue: CreateIssue = {
    events: [{ by, type: "IssueCreatedEvent", ...issue.csm }, ...issue.events],
    repositoryId: issue.repositoryId,
  };

  createIssue(newIssue)
    .then((resp) => {
      Router.push(`${Router.asPath.replace("new", "")}${resp.data._id}`);
      notifications.success("You have successfully created a new issue.");
    })
    .catch((_) => {});

  return {};
}

export function updateExistingIssue(issue: Issue, by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "IssueUpdatedEvent", ...issue.csm }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully updated an existing issue.");
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function updateData(data: { title: string; description: string }) {
  return (dispatch: any) => {
    dispatch({ type: "DESCRIBE_ISSUE", payload: data });
  };
}

export function assignLabel(labelId: Label["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: "ASSIGN_LABEL", payload: labelId });
    dispatch({ type: "ADD_EVENT", payload: { by, type: "LabelAssignedEvent", labelId } });
  };
}

export function unassignLabel(labelId: Label["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: "UNASSIGN_LABEL", payload: labelId });
    dispatch({ type: "ADD_EVENT", payload: { by, type: "LabelUnassignedEvent", labelId } });
  };
}

export function instantAssignLabelTo(issue: Issue, labelId: Label["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "LabelAssignedEvent", labelId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "ASSIGN_LABEL", payload: labelId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantUnassignLabelFrom(issue: Issue, labelId: Label["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "LabelUnassignedEvent", labelId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "UNASSIGN_LABEL", payload: labelId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {});
}

export function assignMilestone(milestoneId: Milestone["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: "ASSIGN_MILESTONE", payload: milestoneId });
    dispatch({ type: "ADD_EVENT", payload: { by, type: "MilestoneAssignedEvent", milestoneId } });
  };
}

export function unassignMilestone(milestoneId: Milestone["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: "UNASSIGN_MILESTONE", payload: milestoneId });
    dispatch({ type: "ADD_EVENT", payload: { by, type: "MilestoneUnassignedEvent", milestoneId } });
  };
}

export function instantAssignMilestoneTo(issue: Issue, milestoneId: Milestone["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "MilestoneAssignedEvent", milestoneId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "ASSIGN_MILESTONE", payload: milestoneId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantUnassignMilestoneFrom(issue: Issue, milestoneId: Milestone["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "MilestoneUnassignedEvent", milestoneId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "UNASSIGN_MILESTONE", payload: milestoneId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {});
}

export function assignUser(userId: User["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: "ASSIGN_USER", payload: userId });
    dispatch({ type: "ADD_EVENT", payload: { by, type: "UserAssignedEvent", userId } });
  };
}

export function unassignUser(userId: User["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: "UNASSIGN_USER", payload: userId });
    dispatch({ type: "ADD_EVENT", payload: { by, type: "UserUnassignedEvent", userId } });
  };
}

export function instantAssignUserTo(issue: Issue, userId: User["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "UserAssignedEvent", userId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "ASSIGN_USER", payload: userId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantUnassignUserFrom(issue: Issue, userId: User["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "UserUnassignedEvent", userId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "UNASSIGN_USER", payload: userId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((error) => {});
}

export function instantReopenIssue(issue: Issue, by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "IssueReopenedEvent" }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully reopened an issue.");
        dispatch({ type: "CHANGE_STATE", payload: IssueState.Reopened });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantCloseIssue(issue: Issue, by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "IssueClosedEvent" }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully closed an issue.");
        dispatch({ type: "CHANGE_STATE", payload: IssueState.Closed });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantCreateComment(issue: Issue, by: User["_id"], text: string) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "CommentCreatedEvent", text }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully created a comment.");
        const commentCreated = resp.data.events.pop();
        dispatch({
          type: "CREATE_COMMENT",
          payload: { _id: commentCreated.commentId, text, state: CommentState.Existing, reactions: {} },
        });
        dispatch({ type: "ADD_EVENT", payload: commentCreated });
      })
      .catch((_) => {});
}

export function instantUpdateComment(issue: Issue, by: User["_id"], commentId: string, text: string) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "CommentUpdatedEvent", commentId, text }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully updated a comment.");
        const commentUpdated = resp.data.events.pop();
        dispatch({ type: "UPDATE_COMMENT", payload: { _id: commentId, text } });
        dispatch({ type: "ADD_EVENT", payload: commentUpdated });
      })
      .catch((_) => {});
}
export function instantDeleteComment(issue: Issue, by: User["_id"], commentId: string) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "CommentDeletedEvent", commentId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully deleted a comment.");
        dispatch({ type: "DELETE_COMMENT", payload: commentId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantHideComment(issue: Issue, by: User["_id"], commentId: string) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "CommentHiddenEvent", commentId }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        notifications.success("You have successfully hid a comment.");
        dispatch({ type: "HIDE_COMMENT", payload: commentId });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantAddReaction(issue: Issue, by: User["_id"], commentId: Comment["_id"], code: string) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "UserReactedEvent", commentId, code }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "ADD_REACTION", payload: { commentId, code } });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}

export function instantRemoveReaction(issue: Issue, by: User["_id"], commentId: Comment["_id"], code: string) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: "UserUnreactedEvent", commentId, code }],
    repositoryId: issue.repositoryId,
  };

  return (dispatch: any) =>
    updateIssue(newIssue)
      .then((resp) => {
        dispatch({ type: "REMOVE_REACTION", payload: { commentId, code } });
        dispatch({ type: "ADD_EVENT", payload: resp.data.events.pop() });
      })
      .catch((_) => {});
}
const IssueContext = createContext<IssueContextType>(initialIssueContextValues);

export const useIssueContext = () => useContext(IssueContext);

export const IssueContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [issue, issueDispatcher] = useReducerWithThunk<any, any>(issueReducer, initialIssue);
  const isEdit = !!(issue as Issue)._id;

  return (
    <IssueContext.Provider value={{ issue: issue as Issue, isEdit, issueDispatcher }}>{children}</IssueContext.Provider>
  );
};
