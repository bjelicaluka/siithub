import { FC, useState } from "react";
import { InputField } from "../../core/components/InputField";

type LabelsSearchFormProps = {
  existingName: string,
  onNameChange: (params: any) => any
};
 
export const LabelsSearchForm: FC<LabelsSearchFormProps> = ({ existingName, onNameChange }) => {
  const [name, setName] = useState(existingName);

  const onDataChange = (name: string) => {
    onNameChange(name);
    setName(name);
  }

  return <>
    <InputField label="Name" formElement={{ value: name, onChange: (e: any) => onDataChange(e.target.value) }} />
  </>
}