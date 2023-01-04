import moment from "moment";
import Link from "next/link";
import { type FC, ReactElement, useState } from "react";
import { Button } from "../../core/components/Button";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { RepositoryCard } from "../repository/RepositoryCard";
import { type Activity, type NewCommentActivity, type NewIssueActivity, type StaringActivity } from "./activityActions";
import { useActivities } from "./useActivities";

type ActivitySharedWrapperProps = ActivityComponentProps & {
  children: ReactElement;
};

const ActivitySharedWrapper: FC<ActivitySharedWrapperProps> = ({ activity, children }) => {
  return (
    <>
      <li className="mb-5 ml-6">
        <span className="flex absolute -left-3 justify-center items-center bg-blue-200 rounded-full">
          <ProfilePicture username={activity.username} size={34} />
        </span>
        <div className="pl-2">
          <div className="grid grid-cols-12">
            <div className="col-span-10 text-left ">{children}</div>

            <div className="col-span-2 text-right">
              <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                {moment(activity.timeStamp).fromNow()}
              </time>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

const StarredActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const starredActivity = activity as StaringActivity;

  return (
    <>
      <ActivitySharedWrapper activity={starredActivity}>
        <div>
          <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
            {activity.username}
          </Link>{" "}
          has starred repo{" "}
          <Link
            className="text-blue-500 hover:underline"
            href={`/${starredActivity.repoOwner}/${starredActivity.repoName}`}
          >
            {starredActivity.repoOwner}/{starredActivity.repoName}
          </Link>
        </div>
      </ActivitySharedWrapper>
    </>
  );
};

const NewIssueActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const newIssueActivity = activity as NewIssueActivity;

  return (
    <>
      <ActivitySharedWrapper activity={newIssueActivity}>
        <div>
          <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
            {activity.username}
          </Link>{" "}
          has created a new issue{" "}
          <Link
            className="text-blue-500 hover:underline"
            href={`/${activity.repoOwner}/${activity.repoName}/issues/${newIssueActivity.issueId}`}
          >
            {newIssueActivity.title}
          </Link>{" "}
          inside{" "}
          <Link className="text-blue-500 hover:underline" href={`/${activity.repoOwner}/${activity.repoName}`}>
            {activity.repoOwner}/{activity.repoName}
          </Link>
        </div>
      </ActivitySharedWrapper>
    </>
  );
};

const NewCommentActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const newCommentActivity = activity as NewCommentActivity;

  return (
    <>
      <ActivitySharedWrapper activity={newCommentActivity}>
        <div>
          <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
            {activity.username}
          </Link>{" "}
          has posted a new comment on the{" "}
          <Link
            className="text-blue-500 hover:underline"
            href={`/${activity.repoOwner}/${activity.repoName}/issues/${newCommentActivity.issueId}`}
          >
            {newCommentActivity.title}
          </Link>{" "}
          inside{" "}
          <Link className="text-blue-500 hover:underline" href={`/${activity.repoOwner}/${activity.repoName}`}>
            {activity.repoOwner}/{activity.repoName}
          </Link>
        </div>
      </ActivitySharedWrapper>
    </>
  );
};

const ActivityComponents: any = {
  StaringActivity: StarredActivityComponent,
  NewIssueActivity: NewIssueActivityComponent,
  NewCommentActivity: NewCommentActivityComponent,
};

type ActivityComponentProps = { activity: Activity };

const ActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const Component = ActivityComponents[activity.type] || undefined;
  const repository: any = {
    owner: activity.repoOwner,
    name: activity.repoName,
    description: activity.repoDescription,
  };

  if (!Component) return <></>;

  return (
    <>
      <Component activity={activity} />
      <RepositoryCard repository={repository} />
    </>
  );
};

export const Activities: FC = () => {
  const [upTill, setUpTill] = useState(moment().startOf("M"));
  const { activities } = useActivities(upTill);

  const increaseUpTill = () => {
    setUpTill((upTill) => moment(upTill).add(-1, "M"));
  };

  return (
    <>
      <ol className="relative ml-10 mt-10">
        <div key={activities.length}>
          {activities.map((a: Activity, i: number) => {
            return (
              <div className="mb-5" key={i}>
                <ActivityComponent activity={a} />
              </div>
            );
          })}
        </div>
      </ol>

      <div className="flex justify-center">
        <Button onClick={increaseUpTill}>Load More</Button>
      </div>
    </>
  );
};
