import { type FC, useEffect, useState } from "react";
import {
  assignLabel,
  instantAssignLabelTo,
  instantUnassignLabelFrom,
  unassignLabel,
  useIssueContext,
} from "./IssueContext";
import { findDifference } from "../common/utils";
import { useAuthContext } from "../../core/contexts/Auth";
import { ChooseLabelsField } from "../common/ChooseLabelsField";

export const LabelsForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const [selectedLabels, setSelectedLabels] = useState<any>([]);

  useEffect(() => {
    setSelectedLabels(issue.csm.labels ?? []);
  }, [issue.csm.labels]);

  const onLabelChange = (labels: any): void => {
    if (labels.length > selectedLabels.length) {
      const added = findDifference(labels, selectedLabels);
      issueDispatcher(isEdit ? instantAssignLabelTo(issue, added, executedBy) : assignLabel(added, executedBy));
    } else {
      const removed = findDifference(selectedLabels, labels);
      issueDispatcher(
        isEdit ? instantUnassignLabelFrom(issue, removed, executedBy) : unassignLabel(removed, executedBy)
      );
    }

    setSelectedLabels(labels);
  };

  return (
    <>
      <ChooseLabelsField
        key={selectedLabels.length}
        repositoryId={issue?.repositoryId}
        selectedLabels={selectedLabels}
        onLabelChange={onLabelChange}
      />
    </>
  );
};
