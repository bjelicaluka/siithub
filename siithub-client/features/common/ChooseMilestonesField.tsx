import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type Milestone } from "../milestones/milestoneActions";
import { useMilestonesByRepoId } from "../milestones/useMilestones";
import Select from "react-select";

type ChooseMilestonesFieldProps = {
  repositoryId: Repository["_id"];
  selectedMilestones: any;
  onMilestonesChange: (milestones: any) => any;
};

export const ChooseMilestonesField: FC<ChooseMilestonesFieldProps> = ({
  repositoryId,
  selectedMilestones,
  onMilestonesChange,
}) => {
  const { milestones } = useMilestonesByRepoId(repositoryId);

  const milestoneOptions = milestones?.map((m: Milestone) => ({ value: m._id, label: m.title })) ?? [];
  const defaultValue = milestoneOptions.filter((m: any) => selectedMilestones?.includes(m.value));

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Milestones</label>

      <Select
        isMulti
        name="milestones"
        key={milestones?.length}
        defaultValue={defaultValue}
        options={milestoneOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(milestones) => onMilestonesChange(milestones?.map((m) => m.value))}
      />
    </>
  );
};
