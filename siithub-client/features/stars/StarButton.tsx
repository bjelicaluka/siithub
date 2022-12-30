import { useEffect, type FC } from "react";
import { AuthUser, useAuthContext } from "../../core/contexts/Auth";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useStar } from "./useStars";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { useAction } from "../../core/hooks/useAction";
import { addStarFor, removeStarFor } from "./starActions";

type StarButtonProps = {
  repo: string;
  username: string;
};

export const StarButton: FC<StarButtonProps> = ({ repo, username }) => {
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
    <button onClick={removeStarAction} className="inline-flex justify-center rounded-md border p-2">
      <StarSolid className="h-6 w-6 text-yellow-500"></StarSolid>
      <span className="ml-3 font-medium">Starred</span>
    </button>
  ) : (
    <button onClick={addStarAction} className="inline-flex justify-center rounded-md border p-2" disabled={!userId}>
      <StarOutline className="h-6 w-6 text-yellow-500"></StarOutline>
      <span className="ml-3 font-medium">Star</span>
    </button>
  );
};
