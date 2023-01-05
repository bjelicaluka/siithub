import { type FC } from "react";
import AsyncSelect from "react-select/async";
import { type Branch, getBranches } from "./branchesActions";

type SelectBranchFieldProps = {
  repo: string;
  username: string;
  showLabel?: boolean;
  defaultBranch?: string;
  onChange: (branch: string) => any;
};

export const SelectBranchField: FC<SelectBranchFieldProps> = ({
  repo,
  username,
  showLabel = true,
  defaultBranch = undefined,
  onChange,
}) => {
  const loadOptions = (inputValue: string, callback: (options: any[]) => void) => {
    getBranches(username, repo, inputValue).then((resp: any) => {
      const branchOptions = resp?.data.map((b: Branch) => ({ value: b, label: b }));
      callback(branchOptions);
    });
  };

  return (
    <>
      {showLabel ? <label className="block text-sm font-medium text-gray-700">Branch</label> : <></>}

      <AsyncSelect
        key={defaultBranch}
        defaultValue={defaultBranch ? { value: defaultBranch, label: defaultBranch } : {}}
        required={true}
        cacheOptions
        loadOptions={loadOptions}
        isMulti={false}
        name="branches"
        className="mt-1 basic-select"
        classNamePrefix="select"
        onChange={(branch) => onChange(branch?.value ?? "")}
        isClearable={true}
      />
    </>
  );
};
