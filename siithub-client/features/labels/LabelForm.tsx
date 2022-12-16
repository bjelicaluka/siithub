import { FC } from "react";
import { useNotifications } from "../../core/hooks/useNotifications";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { createLabelFor, CreateLabel, labelBodySchema, Label, updateLabelFor, UpdateLabel } from "./labelActions";
import { extractErrorMessage } from "../../core/utils/errors";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { InputField } from "../../core/components/InputField";
import { Button } from "../../core/components/Button";

type Props = {
  existingLabel?: Label;
}

export const LabelForm: FC<Props> = ({ existingLabel = undefined }) => {
  const notifications = useNotifications();
  const { setResult } = useResult('labels');
  const { register: createLabelForm, handleSubmit, watch, formState: { errors } } = useZodValidatedFrom<CreateLabel>(labelBodySchema, existingLabel);
  const currName = watch('name');
  const curColor = watch('color');
  const isEdit = !!existingLabel;

  const createLabelAction = useAction<CreateLabel>(createLabelFor('639b3fa0d40531fd5b576f0a'), {
    onSuccess: () => {
      notifications.success('You have successfully created a new label.');
      setResult({ status: ResultStatus.Ok, type: 'CREATE_LABEL' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'CREATE_LABEL' });
    }
  })

  const updateLabelAction = useAction<UpdateLabel>(updateLabelFor('639b3fa0d40531fd5b576f0a', existingLabel?._id ?? ''), {
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
              <button type="button" className="text-md font-medium leading-6 text-white rounded-full px-2" style={{backgroundColor: curColor, minWidth: '100px'}} >{currName || 'Label preview'}</button>
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