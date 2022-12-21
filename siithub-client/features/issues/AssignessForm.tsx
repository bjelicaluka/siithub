import { FC, useEffect, useState } from "react";
import Select from 'react-select'
import { assignUser, instantAssignUserTo, instantUnassignUserFrom, unassignUser, useIssueContext } from "./IssueContext";
import { useUsers } from "../users/registration/useUsers";
import { useAuthContext } from "../../core/contexts/Auth";


function findDifference(arr1: any, arr2: any): any {
  return arr1.filter(({ value: id1 }: any) => !arr2.some(({ value: id2 }: any) => id2 === id1)).pop();
}


export const AssignessForm: FC = () => {
  
  const { user } = useAuthContext();
  const executedBy = user?._id ?? '';

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const { users } = useUsers();
  // TODO: DODAJ TIP
  const userOptions = users?.map((u: any) => ({ value: u._id, label: u.name }));
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    users && setSelectedUsers(userOptions.filter((u: any) => issue.csm.assignees?.includes(u.value)));
  }, [users, issue.csm.assignees]);

  const onUsersChange = (users: any): void => {

    if (users.length > selectedUsers.length) {
      const added = findDifference(users, selectedUsers);
      issueDispatcher(isEdit ? instantAssignUserTo(issue, added.value, executedBy) : assignUser(added.value, executedBy));
    } else {
      const removed = findDifference(selectedUsers, users);
      issueDispatcher(isEdit ? instantUnassignUserFrom(issue, removed.value, executedBy) : unassignUser(removed.value, executedBy));
    }

    setSelectedUsers(users);
  }

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Users</label>

      <Select
        key={selectedUsers.length}
        isMulti
        name="users"
        defaultValue={selectedUsers}
        options={userOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(users) => onUsersChange(users)}
      />
    </>
  );

}