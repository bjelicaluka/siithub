import { useRouter } from "next/router";
import { type FC } from "react";
import { AreaField } from "../../core/components/AreaField";
import { Button } from "../../core/components/Button";
import { InputField } from "../../core/components/InputField";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../core/utils/errors";
import { CreateMilestone, createMilestoneFor, type Milestone, milestoneBodySchema, UpdateMilestone, updateMilestoneFor } from "./milestoneActions";

type Props = {
  repo: string, username: string, existingMilestone?: Milestone
}

export const MilestoneForm: FC<Props> = ({repo, username, existingMilestone}) => {
  const notifications = useNotifications();
  const router = useRouter();
  const { setResult } = useResult('milestones');
  const { register: createMilestoneForm, handleSubmit, formState: { errors } } = useZodValidatedFrom<CreateMilestone>(milestoneBodySchema, existingMilestone);
  const isEdit = !!existingMilestone;
  if (existingMilestone?.dueDate) {
    existingMilestone.dueDate = existingMilestone.dueDate.substring(0,10);
  }
  
  const createMilestoneAction = useAction<CreateMilestone>(createMilestoneFor(username, repo), {
    onSuccess: () => {
      notifications.success('You have successfully created a new Milestone.');
      router.push(`/${username}/${repo}/milestones`);
      setResult({ status: ResultStatus.Ok, type: 'CREATE_Milestone' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'CREATE_Milestone' });
    }
  })

  const updateMilestoneAction = useAction<UpdateMilestone>(updateMilestoneFor(username, repo, existingMilestone?.localId ?? 0), {
    onSuccess: () => {
      notifications.success('You have successfully updated Milestone.');
      router.push(`/${username}/${repo}/milestones`);
      setResult({ status: ResultStatus.Ok, type: 'UPDATE_Milestone' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
    }
  })

  return (
    <>
      <p className="text-4xl">{isEdit ? "Edit" : "New"} milestone</p>
      {isEdit ? <></> : <p className="m-1">Create a new milestone to help organize your issues and pull requests.</p>}

      <form onSubmit={handleSubmit(isEdit ? updateMilestoneAction : createMilestoneAction)}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="">
              <div className="p-2">
                <InputField
                  label="Title"
                  formElement={createMilestoneForm("title")}
                  errorMessage={errors?.title?.message} />
              </div>

              <div className="p-2">
                <InputField
                  type="date"
                  label="Due date (optional)"
                  formElement={createMilestoneForm("dueDate")}
                  errorMessage={errors?.dueDate?.message} />
              </div>

              <div className="p-2">
                <AreaField
                  label="Description"
                  rows={10}
                  formElement={createMilestoneForm("description")}
                  errorMessage={errors?.description?.message} />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button>{isEdit ? "Save changes" : "Create milestone"}</Button>
          </div>
        </div>
      </form>

    </>
  )
}