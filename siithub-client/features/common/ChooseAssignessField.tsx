import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type User } from "../users/user.model";
import { useUsers } from "../users/registration/useUsers";
import Select from "react-select";

type ChooseAssignessFieldProps = {
  repositoryId: Repository["_id"];
  selectedAssignes: any;
  onAssignessChange: (assigness: any) => any;
};

export const ChooseAssignessField: FC<ChooseAssignessFieldProps> = ({
  repositoryId,
  selectedAssignes,
  onAssignessChange,
}) => {
  const { users } = useUsers(); // TODO: use collaborators

  const assignessOptions = users?.map((u: User) => ({ value: u._id, label: u.name })) ?? [];
  const defaultValue = assignessOptions?.filter((a: any) => selectedAssignes?.includes(a.value));

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Assigness</label>

      <Select
        isMulti
        name="assigness"
        key={users?.length}
        defaultValue={defaultValue}
        options={assignessOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(assignees) => onAssignessChange(assignees.map((a) => a.value))}
      />
    </>
  );
};
