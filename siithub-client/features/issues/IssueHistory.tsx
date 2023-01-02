import { useMemo, type FC } from "react";
import { useIssueContext } from "./IssueContext";
import moment from "moment";
import { useLabels } from "../labels/useLabels";
import { type Label } from "../labels/labelActions";
import { useUsers } from "../users/registration/useUsers";
import { LabelPreview } from "../labels/LabelPreview";
import { type User } from "../users/user.model";
import { type Milestone } from "../milestones/milestoneActions";
import { useMilestonesByRepoId } from "./useMillestones";
import { CommentPreview } from "./CommentPreview";
import { type Comment } from "./issueActions";


export const IssueHistory: FC = () => {

  const { issue } = useIssueContext();
  const { labels } = useLabels(issue.repositoryId);
  const { milestones } = useMilestonesByRepoId(issue.repositoryId);
  const { users } = useUsers();


  const IssuesWrapper = ({ events }: any) => {
    return <ol className="relative border-l border-gray-200 dark:border-gray-700">
      <div key={events.length}>
        {
          events.filter((e: any) => e._id).map((e: any, i: number) => {
            return <IssueComponent event={e} key={i} />
          })
        }
      </div>
    </ol>
  };

  const IssueComponent = ({ event }: any) => {

    const EventText = ({ event }: any) => {
      switch (event.type) {
        case 'IssueCreatedEvent': return <>has opened this issue</>
        case 'IssueUpdatedEvent': return <>has updated this issue</>

        case 'LabelAssignedEvent': {
          const label = labels?.find((l: Label) => l._id === event.labelId) ?? {};
          return <>added the <LabelPreview {...label} /> label</>
        }
        case 'LabelUnassignedEvent': {
          const label = labels?.find((l: Label) => l._id === event.labelId) ?? {};
          return <>removed the <LabelPreview {...label} /> label</>
        }

        case 'MilestoneAssignedEvent': {
          const milestone = milestones?.find((m: Milestone) => m._id === event.milestoneId) ?? {};
          return <>added the {milestone.title} milestone</>
        }
        case 'MilestoneUnassignedEvent': {
          const milestone = milestones?.find((m: Milestone) => m._id === event.milestoneId) ?? {};
          return <>removed the {milestone.title} milestone</>
        }

        case 'UserAssignedEvent': return <>assigned {users?.find((u: User) => u._id === event.userId)?.name}</>
        case 'UserUnassignedEvent': return <>removed {users?.find((u: User) => u._id === event.userId)?.name}</>

        case 'IssueReopenedEvent': return <>reopened this issue</>
        case 'IssueClosedEvent': return <>closed this issue</>

        case 'CommentCreatedEvent': return <>commented <br/><CommentPreview comment = { issue.csm.comments?.find(c => c._id === event.commentId) as Comment }/></>
        case 'CommentUpdatedEvent': {
          const commentById = issue.events?.find(e => e.commentId === event.commentId && e.type === 'CommentCreatedEvent').by;
          const commentedBy = users?.find((u: User) => u._id === commentById)?.name;
          return <> edited comment from {commentedBy}</>
        }
        case 'CommentHiddenEvent': {
          const commentById = issue.events?.find(e => e.commentId === event.commentId && e.type === 'CommentCreatedEvent').by;
          const commentedBy = users?.find((u: User) => u._id === commentById)?.name;
          return <> hid comment from {commentedBy}</>
        }
        case 'CommentDeletedEvent': {
          const commentById = issue.events?.find(e => e.commentId === event.commentId && e.type === 'CommentCreatedEvent').by;
          const commentedBy = users?.find((u: User) => u._id === commentById)?.name;
          return <> deleted comment from {commentedBy}</>
        }

        default: return <></>
      }
    };

    const DoneBy = ({ userId }: any) => {
      const username = useMemo(() => {
        return users?.find((u: any) => u._id === userId)?.name
      }, [userId]);

      return <>{username}</>
    };

    return <li className="mb-10 ml-6">
      <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
        <img className="rounded-full shadow-lg" src="https://avatars.githubusercontent.com/u/55081607?v=4" alt="Bonnie image" />
      </span>
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600">

        <div className="grid grid-cols-12">
          <div className="col-span-10 text-left ">
            <DoneBy userId={event.by} /> <EventText event={event} />
          </div>
        
          <div className="col-span-2 text-right">
            <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
              {moment(event.timeStamp).fromNow()}
            </time>
          </div>
        </div>

       

      </div>
    </li>

  }

  return (
    <>
      <IssuesWrapper events={issue?.events} />
    </>
  )
};