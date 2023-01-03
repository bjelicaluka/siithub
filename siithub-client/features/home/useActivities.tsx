import { type Moment } from "moment";
import { useQuery } from "react-query";
import { getActivities } from "./activityActions";

export function useActivities(upTill?: Moment) {
  const { data } = useQuery([`activities_${upTill?.format()}`, upTill], () => getActivities(upTill));

  return {
    activities: data?.data?.activities ?? [],
  };
}
