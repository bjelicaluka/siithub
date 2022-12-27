import { useRouter } from "next/router";
import { type FC } from "react";
import { Button } from "../../core/components/Button";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { deleteRepository } from "./repository.service";

export const RepositoryView: FC = () => {
  const router = useRouter();
  const notifications = useNotifications();
  const { setResult } = useResult("delete-repo");
  const repositoryId = router.query?.repository?.toString() ?? "";

  const deleteRepositoryAction = useAction<string>(
    (id) => deleteRepository(id),
    {
      onSuccess: () => {
        notifications.success(
          "You have successfully deleted a new repository."
        );
        setResult({ status: ResultStatus.Ok, type: "CREATE_REPO" });
        router.push("/");
      },
      onError: (error: any) => {
        notifications.error(extractErrorMessage(error));
        setResult({ status: ResultStatus.Error, type: "CREATE_REPO" });
      },
    }
  );

  return (
    <div>
      {repositoryId}
      <Button onClick={() => deleteRepositoryAction(repositoryId)}>
        Delete
      </Button>
    </div>
  );
};
