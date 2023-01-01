import Link from "next/link";
import { useRouter } from "next/router";
import { Children, type FC, type ReactNode } from "react";

type HashtagLinkProps = { children: ReactNode; href?: string };

export const HashtagLink: FC<HashtagLinkProps> = ({ children, href }) => {
  const router = useRouter();
  const { repository, username } = router.query;
  const things = { I: "issues", M: "milestones", P: "pulls" };
  const re = RegExp("#[MIP]\\d+[,\\.\\s]", "g");

  const wrap = (text: string) =>
    href ? (
      <Link href={href} className="hover:text-blue-400 hover:underline">
        {text}
      </Link>
    ) : (
      text
    );

  return (
    <>
      {Children.map(children, (child) => {
        if (typeof child !== "string") return child;
        let hashtags: { text: string; start: number; end: number }[] = [];
        let result;
        while ((result = re.exec(child)) !== null)
          hashtags.push({ text: result[0], start: re.lastIndex - result[0].length, end: re.lastIndex });
        let index = 0;
        let newChildren = [];
        for (let tag of hashtags) {
          newChildren.push(wrap(child.slice(index, tag.start)));
          newChildren.push(
            <Link
              href={`/${username}/${repository}/${things[tag.text.charAt(1) as "I" | "M" | "P"]}/${tag.text.slice(2)}`}
              key={index}
              className="text-blue-400 hover:underline"
            >
              {tag.text}
            </Link>
          );
          index = tag.end;
        }
        newChildren.push(wrap(child.slice(index)));
        return newChildren;
      })}
    </>
  );
};
