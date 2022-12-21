import { FC, PropsWithChildren, createContext, useContext, useReducer, useState } from "react";
import { Issue, IssueState, createIssue, updateIssue } from "./issueActions"
import { useReducerWithThunk } from "../../core/hooks/useReducerWithThunk";
import Router from 'next/router'
import { notifications } from "../../core/hooks/useNotifications";
import { Label } from "../labels/labelActions";


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
    labels: [],
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

// TODO USER IDDDD
export function createNewIssue(issue: Issue, by: string) {
  const newIssue = {
    events: [{ by, type: 'IssueCreatedEvent', ...issue.csm }, ...issue.events]
  };

  createIssue(newIssue)
    .then(resp => {
      Router.push(`/issues/${resp.data._id}`);
      notifications.success("You have successfully created a new issue.");
    })
    .catch(_ => {});

  return {};
}

export function updateExistingIssue(issue: Issue, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'IssueUpdatedEvent', ...issue.csm }]
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

export function assignLabel(labelId: string, by: string) {
  return (dispatch: any) => {
    dispatch({ type: 'ASSIGN_LABEL', payload: labelId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'LabelAssignedEvent', labelId } });
  }
}

export function unassignLabel(labelId: string, by: string) {
  return (dispatch: any) => {
    dispatch({ type: 'UNASSIGN_LABEL', payload: labelId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'LabelUnassignedEvent', labelId } });
  }
}

export function instantAssignLabelTo(issue: Issue, labelId: string, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'LabelAssignedEvent', labelId }]
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'ASSIGN_LABEL', payload: labelId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantUnassignLabelFrom(issue: Issue, labelId: string, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'LabelUnassignedEvent', labelId }]
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'UNASSIGN_LABEL', payload: labelId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(error => {});
}

export function assignUser(userId: string, by: string) {
  return (dispatch: any) => {
    dispatch({ type: 'ASSIGN_USER', payload: userId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'UserAssignedEvent', userId } });
  }
}

export function unassignUser(userId: string, by: string) {
  return (dispatch: any) => {
    dispatch({ type: 'UNASSIGN_USER', payload: userId });
    dispatch({ type: 'ADD_EVENT', payload: { by, type: 'UserUnassignedEvent', userId } });
  }
}

export function instantAssignUserTo(issue: Issue, userId: string, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'UserAssignedEvent', userId }]
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'ASSIGN_USER', payload: userId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantUnassignUserFrom(issue: Issue, userId: string, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'UserUnassignedEvent', userId }]
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      dispatch({ type: 'UNASSIGN_USER', payload: userId });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(error => {});
}

export function instantReopenIssue(issue: Issue, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'IssueReopenedEvent' }]
  };

  return (dispatch: any) => updateIssue(newIssue)
    .then(resp => {
      notifications.success("You have successfully reopened an issue.");
      dispatch({ type: 'CHANGE_STATE', payload: IssueState.Reopened });
      dispatch({ type: 'ADD_EVENT', payload: resp.data.events.pop() });
    })
    .catch(_ => {});
}

export function instantCloseIssue(issue: Issue, by: string) {
  const newIssue = {
    _id: issue._id,
    events: [{ by, type: 'IssueClosedEvent' }]
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