import { type FC } from "react";
import { useUser } from "../users/profile/useUser";
import moment from "moment";
import parse from "html-react-parser";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { CommitIcon, TagIcon } from "./Icons";
import { LabelPreview } from "../labels/LabelPreview";
import { TrashIcon } from "@heroicons/react/24/outline";
import { type Tag } from "./tagActions";
import Link from "next/link";

type TagCardProps = {
  tag: Tag;
  owner: string;
  name: string;
  onTagRemove: (tag: Tag) => any;
};

export const TagCard: FC<TagCardProps> = ({ tag, owner, name, onTagRemove }) => {
  const { user } = useUser(tag.author);

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-3 mt-3 space-y-1">
          <div className="text-lg font-medium">{moment(tag.timeStamp).fromNow()}</div>
          <div className="flex space-x-1">
            <ProfilePicture size={18} username={user?.username ?? ""} />
            <Link href={`/users/${user?.username}`}>{user?.username}</Link>
          </div>
          <div className="flex space-x-1">
            <TagIcon className="mt-1 mr-1" />
            <span>{tag.version}</span>
          </div>
          <div className="flex space-x-1">
            <CommitIcon className="mt-1 mr-1" />
            <Link href={`/${owner}/${name}/tree/${tag.commitSha}`}>{tag.commitSha.substring(0, 7)}</Link>
          </div>
        </div>
        <div className="col-span-9">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <div className="bg-white px-4 py-5 sm:p-6 mb-1">
              <div className="flex">
                <div className="text-3xl font-medium mb-5">{tag.name}</div>
                <div className="ml-2 mt-2 space-x-2">
                  {tag.isLatest ? <LabelPreview name={"Latest"} color={"#238636"} /> : <></>}
                  {tag.isPreRelease ? <LabelPreview name={"Pre-release"} color={"#9e6a03"} /> : <></>}
                </div>

                <div className="flex-1">
                  <TrashIcon
                    className="float-right"
                    style={{ width: "16px", height: "16px" }}
                    onClick={() => onTagRemove(tag)}
                  />
                </div>
              </div>
              <div>{parse(tag.description)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
