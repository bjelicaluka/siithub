import { type FC } from "react";
import { type TagWithRepository } from "../tags/tagActions";
import { LabelPreview } from "../labels/LabelPreview";
import parse from "html-react-parser";
import moment from "moment";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { useUser } from "../users/profile/useUser";
import Link from "next/link";
import { CommitIcon } from "../tags/Icons";
import { HashtagLink } from "../../core/components/HashtagLink";

type TagCardProps = {
  tag: TagWithRepository;
};

export const TagCard: FC<TagCardProps> = ({ tag }) => {
  const { user } = useUser(tag.author);

  return (
    <div className="flex items-center bg-white border-2 p-3 border-gray-200 text-md">
      <div className="w-5/6">
        <div className="bg-white px-4">
          <div className="flex">
            <div className="text-3xl font-medium mb-1">{tag.name}</div>
            <div className="ml-2 mt-2 space-x-2">
              {tag.isLatest ? <LabelPreview name={"Latest"} color={"#238636"} /> : <></>}
              {tag.isPreRelease ? <LabelPreview name={"Pre-release"} color={"#9e6a03"} /> : <></>}
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <ProfilePicture size={14} username={user?.username ?? ""} />
            <span className="ml-1">
              <Link href={`/users/${user?.username}`}>{user?.username}</Link> created{" "}
              <span className="font-medium">{tag.version}</span> {moment(tag.timeStamp).fromNow()}
            </span>
          </div>
          <div className="mt-2">
            <HashtagLink>{parse(tag.description)}</HashtagLink>
          </div>
        </div>
      </div>
      <div className="w-2/12 text-blue-400 text-sm p-2 flex">
        <CommitIcon className="mt-1 mr-1" />
        <Link href={`/${tag.repository.owner}/${tag.repository.name}/tree/${tag.commitSha}`}>
          {tag.commitSha.substring(0, 6)}
        </Link>
      </div>
    </div>
  );
};
