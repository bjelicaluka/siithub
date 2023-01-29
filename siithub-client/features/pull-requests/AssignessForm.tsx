import { type FC, useState } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { findDifference } from "../common/utils";
import { ChooseAssignessField } from "../common/ChooseAssignessField";
import { anassignUserFromPR, assignUserToPR, usePullRequestContext } from "./PullRequestContext";

export const AssignessForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const [selectedUsers, setSelectedUsers] = useState<any>(pullRequest.csm.assignees);

  const onUsersChange = (users: any): void => {
    if (users.length > selectedUsers.length) {
      const added = findDifference(users, selectedUsers);
      pullRequestDispatcher(assignUserToPR(pullRequest, added, executedBy));
    } else {
      const removed = findDifference(selectedUsers, users);
      pullRequestDispatcher(anassignUserFromPR(pullRequest, removed, executedBy));
    }

    setSelectedUsers(users);
  };

  return (
    <>
      <ChooseAssignessField
        repositoryId={pullRequest.repositoryId}
        selectedAssignes={selectedUsers}
        onAssignessChange={onUsersChange}
      />
    </>
  );
};
