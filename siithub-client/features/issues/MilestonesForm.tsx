import { type FC, useEffect, useState } from "react";
import Select from 'react-select'
import { type Milestone } from "../milestones/milestoneActions";
import { assignMilestone, instantAssignMilestoneTo, instantUnassignMilestoneFrom, unassignMilestone, useIssueContext } from "./IssueContext";
import { findDifference } from "./utils";
import { useAuthContext } from "../../core/contexts/Auth";
import { useMilestonesByRepoId } from "./useMillestones";


export const MilestonesForm: FC = () => {
 
  const { user } = useAuthContext();
  const executedBy = user?._id ?? '';

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const { milestones } = useMilestonesByRepoId(issue.repositoryId);
  const milestoneOptions = milestones?.map((m: Milestone) => ({ value: m._id, label: m.title }));
  const [selectedMilestones, setSelectedMilestones] = useState([]);

  useEffect(() => {
    milestones && setSelectedMilestones(milestoneOptions.filter((m: any) => issue.csm.milestones?.includes(m.value)));
  }, [milestones, issue.csm.milestones]);

  const onMilestonesChange = (milestones: any): void => {

    if (milestones.length > selectedMilestones.length) {
      const added = findDifference(milestones, selectedMilestones);
      issueDispatcher(isEdit ? instantAssignMilestoneTo(issue, added.value, executedBy) : assignMilestone(added.value, executedBy));
    } else {
      const removed = findDifference(selectedMilestones, milestones);
      issueDispatcher(isEdit ? instantUnassignMilestoneFrom(issue, removed.value, executedBy) : unassignMilestone(removed.value, executedBy));
    }

    setSelectedMilestones(milestones);
  }

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Milestones</label>

      <Select
        key={selectedMilestones.length}
        isMulti
        name="milestones"
        defaultValue={selectedMilestones}
        options={milestoneOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(milestones) => onMilestonesChange(milestones)}
      />
    </>
  );

}