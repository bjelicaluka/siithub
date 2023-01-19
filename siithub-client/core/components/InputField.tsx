import { type FC, useState } from "react";

type InputFieldProps = {
  type?: string;
  label: string;
  formElement: any;
  errorMessage?: any;
  disabled?: boolean;
};

export const InputField: FC<InputFieldProps> = ({
  type = "text",
  label = "",
  formElement,
  errorMessage = "",
  disabled = false,
}: any) => {
  const [localErrorMessage, setLocalErrorMessage] = useState("");
  if (localErrorMessage != errorMessage) {
    setLocalErrorMessage(errorMessage);
  }

  return (
    <>
      {label ? <label className="block text-lg font-medium text-gray-700">{label}</label> : <></>}
      <input
        type={type}
        disabled={disabled ?? false}
        className={
          localErrorMessage
            ? "mt-1 bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full"
            : "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xl"
        }
        {...formElement}
      />
      {localErrorMessage ? <p className="font-medium mt-2 text-sm text-red-600">{localErrorMessage}</p> : <></>}
    </>
  );
};
