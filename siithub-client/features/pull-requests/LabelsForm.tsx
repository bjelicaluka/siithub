import { type FC, useState } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { ChooseLabelsField } from "../common/ChooseLabelsField";
import { assignLabelToPR, unassignLabelFromPR, usePullRequestContext } from "./PullRequestContext";
import { findDifference } from "../common/utils";

export const LabelsForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const [selectedLabels, setSelectedLabels] = useState<any>(pullRequest.csm.labels);

  const onLabelChange = (labels: any): void => {
    if (labels.length > selectedLabels.length) {
      const added = findDifference(labels, selectedLabels);
      pullRequestDispatcher(assignLabelToPR(pullRequest, added, executedBy));
    } else {
      const removed = findDifference(selectedLabels, labels);
      pullRequestDispatcher(unassignLabelFromPR(pullRequest, removed, executedBy));
    }

    setSelectedLabels(labels);
  };

  return (
    <>
      <ChooseLabelsField
        repositoryId={pullRequest.repositoryId}
        selectedLabels={selectedLabels}
        onLabelChange={onLabelChange}
      />
    </>
  );
};
