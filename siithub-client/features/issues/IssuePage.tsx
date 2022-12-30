import { useEffect, type FC } from "react";
import { DescribeIssueForm } from "./DescribeIssueForm";
import { useIssue } from "./useIssue";
import { LabelsForm } from "./LabelsForm";
import { initialIssue as emptyIssue, setIssue, useIssueContext } from "./IssueContext";
import { IssueHistory } from "./IssueHistory";
import { AssignessForm } from "./AssignessForm";
import { type Repository } from "../repository/repository.service";
import { MilestonesForm } from "./MilestonesForm";
import { CommentForm } from "./CommentForm";

type IssuePageProps = {
  repositoryId: Repository["_id"];
  existingIssueId?: string;
}

export const IssuePage: FC<IssuePageProps> = ({ repositoryId, existingIssueId = undefined }) => {

  const { issue: existingIssue } = useIssue(repositoryId, existingIssueId || '');
  const isEdit = !!existingIssueId;

  const { issue, issueDispatcher } = useIssueContext();

  useEffect(() => {
    const issue = existingIssue || emptyIssue;
    issue.repositoryId = repositoryId;

    issueDispatcher(setIssue(issue));
  }, [existingIssue]);


  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <DescribeIssueForm />
          </div>

          <IssueHistory/>

          { isEdit ? <div key={issue?.csm?.comments?.length}><CommentForm/></div> : <></> }
        </div>
        <div className="col-span-4">
          <div className="bg-white py-6">
            <LabelsForm/>
          </div>

          <div className="bg-white pb-6">
            <MilestonesForm />
          </div>

            <AssignessForm/>
        </div>
      </div>
    </>
  )
};