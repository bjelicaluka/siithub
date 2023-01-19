import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type Label } from "../labels/labelActions";
import { useLabels } from "../labels/useLabels";
import Select from "react-select";

type ChooseLabelsFieldProps = {
  repositoryId: Repository["_id"];
  selectedLabels: any;
  onLabelChange: (labels: any) => any;
};

export const ChooseLabelsField: FC<ChooseLabelsFieldProps> = ({ repositoryId, selectedLabels, onLabelChange }) => {
  const { labels } = useLabels(repositoryId);

  const labelOptions = labels?.map((l: Label) => ({ value: l._id, label: l.name })) ?? [];
  const defaultValue = labelOptions?.filter((l: any) => selectedLabels?.includes(l.value));

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Labels</label>

      <Select
        isMulti
        name="labels"
        key={labels?.length}
        defaultValue={defaultValue}
        options={labelOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(labels) => onLabelChange(labels.map((l) => l.value))}
      />
    </>
  );
};
