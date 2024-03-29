import { type FC, useEffect, useState } from "react";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { deleteLabelFor, type Label } from "./labelActions";
import { LabelForm } from "./LabelForm";
import { LabelPreview } from "./LabelPreview";
import { type Repository } from "../repository/repository.service";

type LabelsTableProps = {
  repositoryId: Repository["_id"];
  labels: Label[];
};

export const LabelsTable: FC<LabelsTableProps> = ({ repositoryId, labels }) => {
  const notifications = useNotifications();
  const { result, setResult } = useResult("labels");
  const [selectedLabel, setSelectedLabel] = useState<Label | undefined>(undefined);

  useEffect(() => {
    if (!result) return;

    if (result.status === ResultStatus.Ok && result.type === "UPDATE_LABEL") {
      setSelectedLabel(undefined);
    }
  }, [result, setResult]);

  const deleteLabelAction = useAction(deleteLabelFor(repositoryId), {
    onSuccess: () => {
      notifications.success("You have successfully deleted label.");
      setResult({ status: ResultStatus.Ok, type: "DELETE_LABEL" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "DELETE_LABEL" });
    },
  });

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <div hidden={!selectedLabel} key={selectedLabel?._id}>
          <LabelForm repositoryId={repositoryId} existingLabel={selectedLabel} />
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Label name
              </th>
              <th scope="col" className="py-3 px-6">
                Description
              </th>
              <th scope="col" className="py-3 px-6" />
            </tr>
          </thead>
          <tbody>
            {labels?.map((label: Label) => (
              <tr key={label._id} className="bg-white border-b">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  <LabelPreview name={label.name || ""} color={label.color || ""} />
                </th>
                <td className="py-4 px-6">{label.description}</td>
                <td className="py-4 px-6 text-right">
                  <a
                    href="#"
                    onClick={() => setSelectedLabel(label)}
                    className="ml-2 font-medium text-blue-600 hover:underline text-right"
                  >
                    Edit
                  </a>
                  <a
                    href="#"
                    onClick={() => {
                      setSelectedLabel(undefined);
                      deleteLabelAction(label);
                    }}
                    className="ml-4 font-medium text-blue-600 hover:underline text right"
                  >
                    Delete
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
