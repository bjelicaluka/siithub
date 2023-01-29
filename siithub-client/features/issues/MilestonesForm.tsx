import { type FC, useEffect, useState } from "react";
import {
  assignMilestone,
  instantAssignMilestoneTo,
  instantUnassignMilestoneFrom,
  unassignMilestone,
  useIssueContext,
} from "./IssueContext";
import { findDifference } from "../common/utils";
import { useAuthContext } from "../../core/contexts/Auth";
import { ChooseMilestonesField } from "../common/ChooseMilestonesField";

export const MilestonesForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const [selectedMilestones, setSelectedMilestones] = useState<any>([]);

  useEffect(() => {
    setSelectedMilestones(issue.csm.milestones);
  }, [issue.csm.milestones]);

  const onMilestonesChange = (milestones: any): void => {
    if (milestones.length > selectedMilestones.length) {
      const added = findDifference(milestones, selectedMilestones);
      issueDispatcher(isEdit ? instantAssignMilestoneTo(issue, added, executedBy) : assignMilestone(added, executedBy));
    } else {
      const removed = findDifference(selectedMilestones, milestones);
      issueDispatcher(
        isEdit ? instantUnassignMilestoneFrom(issue, removed, executedBy) : unassignMilestone(removed, executedBy)
      );
    }

    setSelectedMilestones(milestones);
  };

  return (
    <>
      <ChooseMilestonesField
        key={selectedMilestones.length}
        repositoryId={issue?.repositoryId}
        selectedMilestones={selectedMilestones}
        onMilestonesChange={onMilestonesChange}
      />
    </>
  );
};
