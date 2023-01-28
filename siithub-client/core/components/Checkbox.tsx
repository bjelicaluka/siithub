import { type FC } from "react";

type CheckboxProps = {
  label: string;
  formElement: any;
};

export const Checkbox: FC<CheckboxProps> = ({ label, formElement }) => {
  return (
    <>
      <div className="flex space-x-2">
        <div>
          <input name={label} type="checkbox" {...formElement} />
        </div>
        <label className="text-lg font-medium text-gray-700" htmlFor={label}>
          {label}
        </label>
      </div>
    </>
  );
};
