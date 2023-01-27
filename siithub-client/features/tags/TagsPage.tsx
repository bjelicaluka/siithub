import { type FC, useEffect, useState } from "react";
import { useSearchTags } from "./useTags";
import { type Tag, deleteTag } from "./tagActions";
import moment from "moment";
import { Button } from "../../core/components/Button";
import Link from "next/link";
import { ConfirmationModal } from "../../core/components/ConfirmationModal";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { extractErrorMessage } from "../../core/utils/errors";
import { TagCard } from "./TagCard";
import { InputField } from "../../core/components/InputField";
import debounce from "lodash.debounce";
import { useRefresh } from "../../core/hooks/useRefresh";

type TagSearchFormProps = {
  name: string;
  onNameChange: (name: string) => any;
};

const TagSearchForm: FC<TagSearchFormProps> = ({ name, onNameChange }) => {
  return (
    <>
      <InputField label="" formElement={{ value: name, onChange: (e: any) => onNameChange(e.target.value) }} />
    </>
  );
};

type TagsPageProps = {
  owner: string;
  name: string;
};

const debouncedCb = debounce((cb: () => void) => cb(), 300);

export const TagsPage: FC<TagsPageProps> = ({ owner, name: repoName }) => {
  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState(name);

  const { key, refresh } = useRefresh("tagsSearchForm");
  const { result, setResult } = useResult("tags");
  const { tags } = useSearchTags(owner, repoName, finalName, [result]);
  const notifications = useNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");

  const onTagRemove = (tag: Tag) => {
    setSelectedTag(tag.version);
    setIsModalOpen(true);
  };
  const removeTagAction = useAction<string>(deleteTag(owner, repoName), {
    onSuccess: () => {
      notifications.success("You have successfully removed an existing tag from the repo.");
      setResult({ status: ResultStatus.Ok, type: "REMOVE_TAG" });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "REMOVE_TAG" });
      setIsModalOpen(false);
    },
  });

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  useEffect(() => {
    debouncedCb(() => setFinalName(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const clearName = () => {
    setName("");
    refresh();
  };

  return (
    <>
      <ConfirmationModal
        title="Delete tag"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onYes={() => removeTagAction(selectedTag)}
      >
        Are you sure that you want to delete {selectedTag} tag?
      </ConfirmationModal>

      <div className="flex mb-5">
        <div key={key} className="w-[33%] flex space-x-2">
          <TagSearchForm
            name={name}
            onNameChange={(name) => {
              setName(name);
            }}
          />
          <span className="mt-1">
            <Button onClick={clearName}>Clear</Button>
          </span>
        </div>

        <div className="flex-1 text-right mt-1">
          <Button>
            <Link href={`/${owner}/${repoName}/tags/new`}>New tag</Link>
          </Button>
        </div>
      </div>

      <div>
        {tags
          ?.sort((t1: Tag, t2: Tag) => moment(t2.timeStamp).unix() - moment(t1.timeStamp).unix())
          .map((tag: Tag) => (
            <TagCard key={tag.version} tag={tag} owner={owner} name={repoName} onTagRemove={onTagRemove} />
          ))}
      </div>
    </>
  );
};
