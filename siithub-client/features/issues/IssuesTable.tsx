import moment from "moment";
import { useRouter } from "next/router";
import { type FC } from "react";
import { Label } from "../labels/labelActions";
import { LabelPreview } from "../labels/LabelPreview";
import { useLabels } from "../labels/useLabels";
import { useUsers } from "../users/registration/useUsers";
import { ClosedIcon, OpenedIcon } from "./Icons";
import { Issue, IssueState } from "./issueActions";
import { findLastEvent } from "./utils";

type IssuesTableType = {
  issues: Issue[]
}

export const IssuesTable: FC<IssuesTableType> = ({ issues }) => {
  
  const router = useRouter();
  const { labels } = useLabels("639b3fa0d40531fd5b576f0a");
  const { users } = useUsers();

  const navigateToIssueEdit = (issueId: string) => router.push(`/issues/${issueId}`);

  const AdditionalText = ({ issue }: { issue: Issue }) => {
    
    const issueCreated = findLastEvent(issue.events, (e: any) => e.type === 'IssueCreatedEvent');
    const issueClosed = findLastEvent(issue.events, (e: any) => e.type === 'IssueClosedEvent');

    const findUser = (userId: string) => users?.find((u: any) => u._id === userId);

    return <>
    {
      [IssueState.Open, IssueState.Reopened].includes(issue.csm?.state ?? -1) ?
        <div>was opened by {findUser(issueCreated.by)?.name} {moment(issueCreated.timeStamp).fromNow()}</div> :
        <div>{findUser(issueClosed.by)?.name} closed {moment(issueClosed.timeStamp).fromNow()}</div>
    }
    </>
  }
  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">

        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6"/>
            </tr>
          </thead>
          <tbody>
            {
              issues?.map((issue: Issue) =>
                <tr key={issue._id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                  <td className="py-4 px-6">
                    <div onClick={() => navigateToIssueEdit(issue._id)}>
                      <div className="flex">
                        <span className="mr-2 mt-2">
                          { issue.csm.state === IssueState.Closed ?
                            <ClosedIcon /> :
                            <OpenedIcon />
                          }
                        </span>
                        <span className="text-xl mr-2">
                          {issue.csm.title}
                        </span>
                        <span>
                          {
                            issue.csm.labels?.map(lId => {
                              const label = labels?.find((l: Label) => l._id === lId) ?? {};
                              return <LabelPreview {...label} />
                            })
                          }
                          </span>
                        </div>
                        <div className="ml-6">
                          <AdditionalText issue={issue} />
                        </div>
                    </div>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </>
  )
}