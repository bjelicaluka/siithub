import { type FC } from "react";
import { useNotifications } from "../../core/hooks/useNotifications";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { createLabelFor, type CreateLabel, labelBodySchema, type Label, updateLabelFor, type UpdateLabel } from "./labelActions";
import { extractErrorMessage } from "../../core/utils/errors";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { InputField } from "../../core/components/InputField";
import { Button } from "../../core/components/Button";
import { LabelPreview } from "./LabelPreview";
import { type Repository } from "../repository/repository.service";

type Props = {
  repositoryId: Repository["_id"];
  existingLabel?: Label;
}

export const LabelForm: FC<Props> = ({ repositoryId, existingLabel = undefined }) => {
  const notifications = useNotifications();
  const { setResult } = useResult('labels');
  const { register: createLabelForm, handleSubmit, watch, formState: { errors } } = useZodValidatedFrom<CreateLabel>(labelBodySchema, existingLabel);
  const currName = watch('name');
  const curColor = watch('color');
  const isEdit = !!existingLabel;

  const createLabelAction = useAction<CreateLabel>(createLabelFor(repositoryId), {
    onSuccess: () => {
      notifications.success('You have successfully created a new label.');
      setResult({ status: ResultStatus.Ok, type: 'CREATE_LABEL' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'CREATE_LABEL' });
    }
  })

  const updateLabelAction = useAction<UpdateLabel>(updateLabelFor(repositoryId, existingLabel?._id ?? ''), {
    onSuccess: () => {
      notifications.success('You have successfully updated label.');
      setResult({ status: ResultStatus.Ok, type: 'UPDATE_LABEL' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'UPDATE_LABEL' });
    }
  })

  return (
    <>
      
      <form onSubmit={handleSubmit(isEdit ? updateLabelAction : createLabelAction)}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">

            <div className="pb-3">
              <LabelPreview name={currName || ''} color={curColor || ''} />
            </div>

            <div className="grid grid-cols-6 gap-6">

              <div className="col-span-2">
                <InputField
                  label="Label Name"
                  formElement={createLabelForm("name")}
                  errorMessage={errors?.name?.message}/>
              </div>

              <div className="col-span-2">
                <InputField
                  label="Description"
                  formElement={createLabelForm("description")}
                  errorMessage={errors?.description?.message} />
              </div>

              <div className="col-span-2">
                <InputField
                  type="color"
                  label="Color"
                  formElement={createLabelForm("color")}
                  errorMessage={errors?.color?.message} />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button>Submit</Button>
          </div>
        </div>
      </form>
    </>
  )
} 