import { useState, type FC } from "react";
import { Button } from "../../core/components/Button";
import { ConfirmationModal } from "../../core/components/ConfirmationModal";
import { InputField } from "../../core/components/InputField";
import { Modal } from "../../core/components/Modal";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { changeDefaultBranch, DefaultBranch, removeBranch, renameBranch, type Branch } from "./branchesActions";
import { SelectBranchField } from "./SelectBranchField";

type BranchesTableProps = {
  repo: string;
  username: string;
  branches: Branch[];
  defaultBranch: DefaultBranch;
};

const RenameBranchForm = ({ onSubmit }: any) => {
  const [newName, setNewName] = useState("");

  return (
    <>
      <form onSubmit={() => onSubmit(newName)}>
        <InputField label="Name" formElement={{ value: newName, onChange: (e: any) => setNewName(e.target.value) }} />

        <div className="py-3 text-right">
          <Button>Submit</Button>
        </div>
      </form>
    </>
  );
};

const ChangeDefaultBranchForm = ({ username, repo, onSubmit }: any) => {
  const [newDefaultBranch, setNewDefaultBranch] = useState("");

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(newDefaultBranch);
        }}
      >
        <SelectBranchField username={username} repo={repo} onChange={(branch) => setNewDefaultBranch(branch)} />

        <div className="py-3 text-right">
          <Button>Submit</Button>
        </div>
      </form>
    </>
  );
};

export const BranchesTable: FC<BranchesTableProps> = ({ repo, username, branches, defaultBranch }) => {
  const notifications = useNotifications();
  const { setResult: setBranchesResult } = useResult("branches");
  const { setResult: setDefaultBranchResult } = useResult("default_branch");

  const [selectedBranch, setSelectedBranch] = useState("");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChangeOpen, setIsChangeOpen] = useState(false);

  const renameSelected = (branch: string) => {
    setSelectedBranch(branch);
    setIsRenameOpen(true);
  };

  const renameBranchAction = useAction<any>(renameBranch(username, repo), {
    onSuccess: () => {
      notifications.success("You have successfully renamed an existing branch from the repo.");
      setBranchesResult({ status: ResultStatus.Ok, type: "RENAME" });
      setIsRenameOpen(false);
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setBranchesResult({ status: ResultStatus.Error, type: "RENAME" });
      setIsRenameOpen(false);
    },
  });

  const deleteSelected = (branch: string) => {
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  const removeBranchAction = useAction<string>(removeBranch(username, repo), {
    onSuccess: () => {
      notifications.success("You have successfully removed an existing branch from the repo.");
      setBranchesResult({ status: ResultStatus.Ok, type: "REMOVE_BRANCH" });
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setBranchesResult({ status: ResultStatus.Error, type: "REMOVE_BRANCH" });
      setIsDeleteOpen(false);
    },
  });

  const changeSelected = () => {
    setIsChangeOpen(true);
  };

  const changeDefaultBranchAction = useAction<string>(changeDefaultBranch(username, repo), {
    onSuccess: () => {
      notifications.success("You have successfully changed default branch for the repo the repo.");
      setDefaultBranchResult({ status: ResultStatus.Ok, type: "CHANGE_BRANCH" });
      setIsChangeOpen(false);
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setDefaultBranchResult({ status: ResultStatus.Error, type: "CHANGE_BRANCH" });
      setIsChangeOpen(false);
    },
  });

  return (
    <>
      <ConfirmationModal
        title="Delete branch"
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onYes={() => removeBranchAction(selectedBranch)}
      >
        Are you sure that you want to delete {selectedBranch} branch?
      </ConfirmationModal>

      <Modal title="Rename branch" isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)}>
        <RenameBranchForm
          onSubmit={(newBranchName: string) => {
            renameBranchAction({
              branchName: selectedBranch,
              newBranchName,
            });
          }}
        />
      </Modal>

      <Modal title="Change default branch" isOpen={isChangeOpen} onClose={() => setIsChangeOpen(false)}>
        <ChangeDefaultBranchForm
          username={username}
          repo={repo}
          onSubmit={(newBranchName: string) => {
            changeDefaultBranchAction(newBranchName);
          }}
        />
      </Modal>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Branch
              </th>
              <th scope="col" className="py-3 px-6" />
            </tr>
          </thead>
          <tbody>
            {branches?.map((branch: Branch, i: number) => (
              <tr key={i} className="bg-white border-b">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {branch} {defaultBranch?.branch === branch ? " (default)" : ""}
                </th>
                <td className="py-4 px-6 text-right">
                  {defaultBranch?.branch === branch ? (
                    <a
                      href="#"
                      onClick={() => changeSelected()}
                      className="ml-4 font-medium text-blue-600 hover:underline text right"
                    >
                      Change
                    </a>
                  ) : (
                    <></>
                  )}
                  <a
                    href="#"
                    onClick={() => renameSelected(branch)}
                    className="ml-4 font-medium text-blue-600 hover:underline text right"
                  >
                    Rename
                  </a>{" "}
                  <a
                    href="#"
                    onClick={() => deleteSelected(branch)}
                    className="ml-4 font-medium text-blue-600 hover:underline text right"
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
