import { useEffect, type FC } from "react";
import { Button } from "../../core/components/Button";
import { InputField } from "../../core/components/InputField";
import { createNewIssue, instantCloseIssue, instantReopenIssue, updateData, updateExistingIssue, useIssueContext } from "./IssueContext";
import { z } from "zod";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { useQuill } from 'react-quilljs';
import { IssueState } from "./issueActions";
import { useAuthContext } from "../../core/contexts/Auth";
import 'quill/dist/quill.snow.css';

const describeIssueSchema = z.object({
  title: z.string()
    .min(3, "Title should have at least 3 characters."),
  description: z.string()
});

type DescribeIssueType = z.infer<typeof describeIssueSchema>;

let initiallySet = false;

export const DescribeIssueForm: FC = () => {
  
  const { user } = useAuthContext();
  const executedBy = user?._id ?? '';

  const { isEdit, issue, issueDispatcher } = useIssueContext();
  const { register: describeIssueForm, handleSubmit, watch, reset, setValue, formState: { errors } } = useZodValidatedFrom<DescribeIssueType>(describeIssueSchema, issue?.csm);

  const title = watch('title');
  const description = watch('description');

  const isOpened = [IssueState.Open, IssueState.Reopened].includes(issue.csm?.state ?? IssueState.Closed);

  useEffect(() => {
    issueDispatcher(updateData({ title, description }));
  }, [title, description]);

  useEffect(() => {
    if (!isEdit || initiallySet) return;
    initiallySet = true;
    reset(issue?.csm);
    quill && quill.clipboard.dangerouslyPasteHTML(issue?.csm?.description || '');
  }, [issue.csm.title, issue.csm.description]);
  
  const onSubmit = () => {
    issueDispatcher(isEdit ? updateExistingIssue(issue, executedBy) : createNewIssue(issue, executedBy));
  }

  const onClose = () => {
    issueDispatcher(isOpened ? instantCloseIssue(issue, executedBy) : instantReopenIssue(issue, executedBy));
  }

  
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setValue('description', quill.root.innerHTML.toString());
      });
    }
  }, [quill]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>

          
          <div className="bg-white px-4 py-5 sm:p-6 mb-1">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <InputField
                  label="Title"
                  formElement={describeIssueForm("title")}
                  errorMessage={errors?.title?.message}/>
              </div>

              <div className="col-span-6">
                <div style={{ height: 250 }}>
                  <div ref={quillRef} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6">
            {
              issue._id ? <div className="col-span-3 bg-gray-50 px-4 py-3 text-left sm:px-6 mt-10">
                <Button type="button" onClick={onClose}>{isOpened ? 'Close' : 'Reopen'}</Button>
              </div> : <></>
            }
            <div className={`${issue._id ? "col-span-3" : "col-span-6"} bg-gray-50 px-4 py-3 text-right sm:px-6 mt-10` }>
              <Button>Submit</Button>
            </div>
          </div>

      </form>
    </>
  );
}