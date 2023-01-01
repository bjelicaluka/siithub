import { useRouter } from "next/router";
import { type FC } from "react";
import { Button } from "../../core/components/Button";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { deleteRepository } from "./repository.service";

type RepoSettingsPageProps = {
  repo: string;
  username: string;
};

export const RepoSettingsPage: FC<RepoSettingsPageProps> = ({ username, repo }) => {
  const router = useRouter();
  const notifications = useNotifications();
  const { setResult } = useResult("delete-repo");

  const deleteRepositoryAction = useAction<void>(deleteRepository(username, repo), {
    onSuccess: () => {
      notifications.success("You have successfully deleted repository.");
      setResult({ status: ResultStatus.Ok, type: "DELETE_REPO" });
      router.push("/");
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "DELETE_REPO" });
    },
  });

  return (
    <>
      <div className="flex items-center border-2 rounded-lg border-red-700 p-2">
        <div className="grow">
          <p className="font-medium">Delete this repository</p>
          <p>Once you delete a repository, there is no going back. Please be certain.</p>
        </div>

        <Button className="text-right" onClick={deleteRepositoryAction}>
          Delete this repo
        </Button>
      </div>
    </>
  );
};
