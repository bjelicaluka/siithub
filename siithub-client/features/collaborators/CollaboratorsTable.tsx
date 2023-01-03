import { type FC } from "react";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import {
  removeCollaborator,
  type Collaborator,
  type RemoveCollaborator,
} from "./collaboratorAction";

type CollaboratorsTableProps = {
  repo: string;
  username: string;
  collaborators: Collaborator[];
};

export const CollaboratorsTable: FC<CollaboratorsTableProps> = ({
  repo,
  username,
  collaborators,
}) => {
  const notifications = useNotifications();
  const { setResult } = useResult("collaborators");

  const removeCollaboratorAction = useAction<RemoveCollaborator>(
    removeCollaborator(username, repo),
    {
      onSuccess: () => {
        notifications.success("You have successfully removed collaborator from the repo.");
        setResult({ status: ResultStatus.Ok, type: "REMOVE_COLLABORATOR" });
      },
      onError: (error: any) => {
        notifications.error(extractErrorMessage(error));
        setResult({ status: ResultStatus.Error, type: "REMOVE_COLLABORATOR" });
      },
    }
  );

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="py-3 px-6">
                Collaborators
              </th>
              <th scope="col" className="py-3 px-6" />
            </tr>
          </thead>
          <tbody>
            {collaborators?.map((collaborator: Collaborator) => (
              <tr
                key={collaborator._id}
                className="bg-white border-b dark:bg-gray-900 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {collaborator.user?.name}
                </th>
                <td className="py-4 px-6 text-right">
                  <a
                    href="#"
                    onClick={() => {
                      removeCollaboratorAction(collaborator);
                    }}
                    className="ml-4 font-medium text-blue-600 dark:text-blue-500 hover:underline text right"
                  >
                    Remove
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
