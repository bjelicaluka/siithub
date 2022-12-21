import { useMemo, type FC } from "react";
import { useIssueContext } from "./IssueContext";
import moment from "moment";
import { useLabels } from "../labels/useLabels";
import { Label } from "../labels/labelActions";
import { useUsers } from "../users/registration/useUsers";
import { LabelPreview } from "../labels/LabelPreview";


export const IssueHistory: FC = () => {

  const { labels } = useLabels('639b3fa0d40531fd5b576f0a');
  const { users } = useUsers();

  const { issue } = useIssueContext();

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

        // TODO: TTYPE
        case 'UserAssignedEvent': return <>assigned {users?.find((u: any) => u._id === event.userId)?.name}</>
        case 'UserUnassignedEvent': return <>removed {users?.find((u: any) => u._id === event.userId)?.name}</>

        case 'IssueReopenedEvent': return <>reopened this issue</>
        case 'IssueClosedEvent': return <>closed this issue</>
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
      <div className="justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm sm:flex dark:bg-gray-700 dark:border-gray-600">
        <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
          {moment(event.timeStamp).fromNow()}
        </time>
        <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
          <DoneBy userId={event.by} /> <EventText event={event} />
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