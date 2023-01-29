import { useEffect, type FC } from "react";
import { type AuthUser, useAuthContext } from "../../core/contexts/Auth";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useStar } from "./useStars";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { useAction } from "../../core/hooks/useAction";
import { addStarFor, removeStarFor } from "./starActions";

type StarButtonProps = {
  repo: string;
  username: string;
  count: number;
};

export const StarButton: FC<StarButtonProps> = ({ repo, username, count }) => {
  const userId = (useAuthContext()?.user as AuthUser)?._id;
  const { result, setResult } = useResult("stars");
  const { star } = useStar(username, repo, [result]);

  const addStarAction = useAction(addStarFor(username, repo), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: "ADD_STAR" });
    },
    onError: () => {},
  });
  const removeStarAction = useAction(removeStarFor(username, repo), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: "REMOVE_STAR" });
    },
    onError: () => {},
  });

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  return star ? (
    <button onClick={removeStarAction} className="inline-flex rounded-md border p-2">
      <StarSolid className="h-6 w-6 text-yellow-500" />
      <span className="ml-3 font-medium">Starred</span>
      <span className="ml-3 bg-gray-300 border rounded-full px-2 font-semibold">{count}</span>
    </button>
  ) : (
    <button onClick={addStarAction} className="inline-flex rounded-md border p-2" disabled={!userId}>
      <StarOutline className="h-6 w-6 text-yellow-500" />
      <span className="ml-3 font-medium">Star</span>
      <span className="ml-3 bg-gray-300 border rounded-full px-2 font-semibold">{count}</span>
    </button>
  );
};
