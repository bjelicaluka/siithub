import { type FC, useState } from "react";
import { InputField } from "../../core/components/InputField";

type BranchesSearchFormProps = {
  existingName: string;
  onNameChange: (params: any) => any;
};

export const BranchesSearchForm: FC<BranchesSearchFormProps> = ({ existingName, onNameChange }) => {
  const [name, setName] = useState(existingName);

  const onDataChange = (name: string) => {
    onNameChange(name);
    setName(name);
  };

  return (
    <>
      <InputField label="Name" formElement={{ value: name, onChange: (e: any) => onDataChange(e.target.value) }} />
    </>
  );
};
