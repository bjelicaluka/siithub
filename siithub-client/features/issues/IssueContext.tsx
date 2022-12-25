import { type FC, PropsWithChildren, createContext, useContext } from "react";
import { type CreateIssue, type Issue, IssueState, type UpdateIssue, createIssue, updateIssue } from "./issueActions"
import { useReducerWithThunk } from "../../core/hooks/useReducerWithThunk";
import Router from 'next/router'
import { notifications } from "../../core/hooks/useNotifications";
import { type User } from "../users/user.model";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";


type IssueContextType = {
  issue: Issue,
  isEdit: boolean,
  issueDispatcher: any
};

export const initialIssue = {
  _id: '',
  repositoryId: '',
  events: [],
  csm: {
    state: IssueState.Open,
    labels: [],
    milestones: [],
    assignees: [],
    title: '',
    description: ''
  }
};

const initialIssueContextValues = {
  issue: initialIssue,
  isEdit: false,
  issueDispatcher: () => {}
};

type ActionType = {
  type: string,
  payload?: any
}

function issueReducer(issue: Issue, action: ActionType) {

  switch (action.type) {
    case 'SET_ISSUE': {
      return {
        ...action.payload
      }
    }

    case 'ADD_EVENT': {
      const events = [...issue.events, action.payload]
      return {
        ...issue,
        events
      }
    }

    case 'DESCRIBE_ISSUE': {
      return {
        ...issue,
        csm: {
          ...issue.csm,
          ...action.payload
        }
      };
    }

    case 'CHANGE_STATE': {
      return {
        ...issue,
        csm: {
          ...issue.csm,
          state: action.payload
        }
      };
    }

    case 'ASSIGN_LABEL': {
      const labels = [...issue.csm?.labels ?? [], action.payload]
      return {
        ...issue,
        csm: {
          ...issue.csm,
          labels
        }
      };
    }

    case 'UNASSIGN_LABEL': {
      const labels = issue.csm?.labels?.filter(l => l !== action.payload) ?? [];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          labels
        }
      };
    }

    case 'ASSIGN_MILESTONE': {
      const milestones = [...issue.csm?.milestones ?? [], action.payload]
      return {
        ...issue,
        csm: {
          ...issue.csm,
          milestones
        }
      };
    }

    case 'UNASSIGN_MILESTONE': {
      const milestones = issue.csm?.milestones?.filter(m => m !== action.payload) ?? [];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          milestones
        }
      };
    }

    case 'ASSIGN_USER': {
      const assignees = [...issue.csm?.assignees ?? [], action.payload]
      return {
        ...issue,
        csm: {
          ...issue.csm,
          assignees
        }
      };
    }

    case 'UNASSIGN_USER': {
      const assignees = issue.csm?.assignees?.filter(l => l !== action.payload) ?? [];
      return {
        ...issue,
        csm: {
          ...issue.csm,
          assignees
        }
      };
    }

    default: return {
      ...issue
    }
  }
}

export function setIssue(issue: Issue) {
  return (dispatch: any) => dispatch({ type: 'SET_ISSUE', payload: issue });
}

export function createNewIssue(issue: Issue, by: User["_id"]) {
  const newIssue: CreateIssue = {
    events: [{ by, type: 'IssueCreatedEvent', ...issue.csm }, ...issue.events],
    repositoryId: issue.repositoryId
  };

  createIssue(newIssue)
    .then(resp => {
      Router.push(`/repository/${issue.repositoryId}/issues/${resp.data._id}`);
      notifications.success("You have successfully created a new issue.");
    })
    .catch(_ => {});

  return {};
}

export function updateExistingIssue(issue: Issue, by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'IssueUpdatedEvent', ...issue.csm }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      notifications.success("You have successfully updated an existing issue.");
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function updateData(data: { title: string, description: string }) {
  return (dispatch: any) => {
    dispatch({ type: 'DESCRIBE_ISSUE', payload: data });
  }
}

export function assignLabel(labelId: Label["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: 'ASSIGN_LABEL', payload: labelId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'LabelAssignedEvent', labelId } });
  }
}

export function unassignLabel(labelId: Label["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: 'UNASSIGN_LABEL', payload: labelId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'LabelUnassignedEvent', labelId } });
  }
}

export function instantAssignLabelTo(issue: Issue, labelId: Label["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'LabelAssignedEvent', labelId }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'ASSIGN_LABEL', payload: labelId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantUnassignLabelFrom(issue: Issue, labelId: Label["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'LabelUnassignedEvent', labelId }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'UNASSIGN_LABEL', payload: labelId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(error => {});
}

export function assignMilestone(milestoneId: Milestone["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: 'ASSIGN_MILESTONE', payload: milestoneId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'MilestoneAssignedEvent', milestoneId } });
  }
}

export function unassignMilestone(milestoneId: Milestone["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: 'UNASSIGN_MILESTONE', payload: milestoneId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'MilestoneUnassignedEvent', milestoneId } });
  }
}

export function instantAssignMilestoneTo(issue: Issue, milestoneId: Milestone["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'MilestoneAssignedEvent', milestoneId }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'ASSIGN_MILESTONE', payload: milestoneId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantUnassignMilestoneFrom(issue: Issue, milestoneId: Milestone["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'MilestoneUnassignedEvent', milestoneId }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'UNASSIGN_MILESTONE', payload: milestoneId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(error => {});
}


export function assignUser(userId: User["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: 'ASSIGN_USER', payload: userId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'UserAssignedEvent', userId } });
  }
}

export function unassignUser(userId: User["_id"], by: User["_id"]) {
  return (dispatch: any) => {
    dispatch({ type: 'UNASSIGN_USER', payload: userId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'UserUnassignedEvent', userId } });
  }
}

export function instantAssignUserTo(issue: Issue, userId: User["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'UserAssignedEvent', userId }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'ASSIGN_USER', payload: userId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantUnassignUserFrom(issue: Issue, userId: User["_id"], by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'UserUnassignedEvent', userId }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'UNASSIGN_USER', payload: userId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(error => {});
}

export function instantReopenIssue(issue: Issue, by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'IssueReopenedEvent' }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      notifications.success("You have successfully reopened an issue.");
      dispatch({ type: 'CHANGE_STATE', payload: IssueState.Reopened });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantCloseIssue(issue: Issue, by: User["_id"]) {
  const newIssue: UpdateIssue = {
    _id: issue._id,
    events: [{ by, type: 'IssueClosedEvent' }],
    repositoryId: issue.repositoryId
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      notifications.success("You have successfully closed an issue.");
      dispatch({ type: 'CHANGE_STATE', payload: IssueState.Closed });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

const IssueContext = createContext<IssueContextType>(initialIssueContextValues);

export const useIssueContext = () => useContext(IssueContext);

export const IssueContextProvider: FC<PropsWithChildren> = ({ children }) => {

  const [issue, issueDispatcher] = useReducerWithThunk<any, any>(issueReducer, initialIssue);
  const isEdit = !!(issue as Issue)._id;

  return (
    <IssueContext.Provider value={{ issue: issue as Issue, isEdit, issueDispatcher }}>
      {children}
    </IssueContext.Provider>

  );
}