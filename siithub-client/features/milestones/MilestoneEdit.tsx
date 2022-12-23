import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, type FC } from "react";
import { Button } from "../../core/components/Button";
import NotFound from "../../core/components/NotFound";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { closeMilestoneFor, openMilestoneFor } from "./milestoneActions";
import { MilestoneForm } from "./MilestoneForm";
import { useMilestone } from "./useMilestones";

type MilestoneEditProps = {
  repo: string, username: string, localId: number
}

export const MilestoneEdit: FC<MilestoneEditProps> = ({ repo, username, localId }) => {
  const { result, setResult } = useResult('milestones');
  const { milestone, error } = useMilestone(username, repo, localId, [result]);
  const router = useRouter();

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const closeMilestoneAction = useAction(closeMilestoneFor(username, repo), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: 'CLOSE_Milestone' });
      router.push(`/${username}/${repo}/milestones`);
    },
    onError: () => {}
  })
  const openMilestoneAction = useAction(openMilestoneFor(username, repo), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: 'OPEN_Milestone' });
      router.push(`/${username}/${repo}/milestones`);
    },
    onError: () => {}
  })

  if (error) return <NotFound/>;

  return (
    <>
      {milestone ? <>
      <MilestoneForm username={username} repo={repo} existingMilestone={milestone} />
      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
        <Button><Link href={`/${username}/${repo}/milestones`}>Cancel</Link></Button>
        <Button onClick={() => (milestone.isOpen ? closeMilestoneAction : openMilestoneAction)(milestone)}>
          {milestone?.isOpen ? "Close" : "Reopen"} milestone
        </Button>
      </div>
      </> : <></>}
    </>
  )
}