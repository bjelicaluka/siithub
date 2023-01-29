import { type FC, useEffect, useState } from "react";
import {
  assignUser,
  instantAssignUserTo,
  instantUnassignUserFrom,
  unassignUser,
  useIssueContext,
} from "./IssueContext";
import { useAuthContext } from "../../core/contexts/Auth";
import { findDifference } from "../common/utils";
import { ChooseAssignessField } from "../common/ChooseAssignessField";

export const AssignessForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const [selectedUsers, setSelectedUsers] = useState<any>([]);

  useEffect(() => {
    setSelectedUsers(issue.csm.assignees ?? []);
  }, [issue.csm.assignees]);

  const onUsersChange = (users: any): void => {
    if (users.length > selectedUsers.length) {
      const added = findDifference(users, selectedUsers);
      issueDispatcher(isEdit ? instantAssignUserTo(issue, added, executedBy) : assignUser(added, executedBy));
    } else {
      const removed = findDifference(selectedUsers, users);
      issueDispatcher(isEdit ? instantUnassignUserFrom(issue, removed, executedBy) : unassignUser(removed, executedBy));
    }

    setSelectedUsers(users);
  };

  return (
    <>
      <ChooseAssignessField
        key={selectedUsers.length}
        repositoryId={issue?.repositoryId}
        selectedAssignes={selectedUsers}
        onAssignessChange={onUsersChange}
      />
    </>
  );
};
