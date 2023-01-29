import { type FC, useState } from "react";
import { findDifference } from "../common/utils";
import { useAuthContext } from "../../core/contexts/Auth";
import { ChooseMilestonesField } from "../common/ChooseMilestonesField";
import { assignMilestoneToPR, unassignMilestoneFromPR, usePullRequestContext } from "./PullRequestContext";

export const MilestonesForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const [selectedMilestones, setSelectedMilestones] = useState<any>(pullRequest.csm.milestones);

  const onMilestonesChange = (milestones: any): void => {
    if (milestones.length > selectedMilestones.length) {
      const added = findDifference(milestones, selectedMilestones);
      pullRequestDispatcher(assignMilestoneToPR(pullRequest, added, executedBy));
    } else {
      const removed = findDifference(selectedMilestones, milestones);
      pullRequestDispatcher(unassignMilestoneFromPR(pullRequest, removed, executedBy));
    }

    setSelectedMilestones(milestones);
  };

  return (
    <>
      <ChooseMilestonesField
        repositoryId={pullRequest.repositoryId}
        selectedMilestones={selectedMilestones}
        onMilestonesChange={onMilestonesChange}
      />
    </>
  );
};
