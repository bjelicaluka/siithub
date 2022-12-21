import { useEffect, type FC } from "react";
import { DescribeIssueForm } from "./DescribeIssueForm";
import { useIssue } from "./useIssue";
import { LabelsForm } from "./LabelsForm";
import { initialIssue as emptyIssue, setIssue, useIssueContext } from "./IssueContext";
import { IssueHistory } from "./IssueHistory";
import { AssignessForm } from "./AssignessForm";

type IssuePageProps = {
  existingIssueId?: string;
}

export const IssuePage: FC<IssuePageProps> = ({ existingIssueId = undefined }) => {

  const { issue: existingIssue } = useIssue('639b3fa0d40531fd5b576f0a', existingIssueId || '');

  const { issueDispatcher } = useIssueContext();

  useEffect(() => {
    issueDispatcher(setIssue(existingIssue || emptyIssue));
  }, [existingIssue]);


  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <DescribeIssueForm />
          </div>

          <IssueHistory/>

        </div>
        <div className="col-span-4">
          <div className="bg-white py-6">
            <LabelsForm/>
          </div>

            <AssignessForm/>
        </div>
      </div>
    </>
  )
};