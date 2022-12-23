import { type FC, useEffect, useState } from "react";
import { useLabels } from "../labels/useLabels";
import Select from 'react-select'
import { type Label } from "../labels/labelActions";
import { assignLabel, instantAssignLabelTo, instantUnassignLabelFrom, unassignLabel, useIssueContext } from "./IssueContext";
import { findDifference } from "./utils";
import { useAuthContext } from "../../core/contexts/Auth";


export const LabelsForm: FC = () => {
 
  const { user } = useAuthContext();
  const executedBy = user?._id ?? '';

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const { labels } = useLabels(issue.repositoryId);
  const labelOptions = labels?.map((l: Label) => ({ value: l._id, label: l.name }));
  const [selectedLabels, setSelectedLabels] = useState([]);

  useEffect(() => {
    labels && setSelectedLabels(labelOptions.filter((l: any) => issue.csm.labels?.includes(l.value)));
  }, [labels, issue.csm.labels]);

  const onLabelChange = (labels: any): void => {

    if (labels.length > selectedLabels.length) {
      const added = findDifference(labels, selectedLabels);
      issueDispatcher(isEdit ? instantAssignLabelTo(issue, added.value, executedBy) : assignLabel(added.value, executedBy));
    } else {
      const removed = findDifference(selectedLabels, labels);
      issueDispatcher(isEdit ? instantUnassignLabelFrom(issue, removed.value, executedBy) : unassignLabel(removed.value, executedBy));
    }

    setSelectedLabels(labels);
  }

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Labels</label>

      <Select
        key={selectedLabels.length}
        isMulti
        name="labels"
        defaultValue={selectedLabels}
        options={labelOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(labels) => onLabelChange(labels)}
      />
    </>
  );

}