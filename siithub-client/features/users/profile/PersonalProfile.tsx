import { type FC } from "react";

type PersonalProfileProps = {
  username: string;
};

export const PersonalProfile: FC<PersonalProfileProps> = ({ username }) => {
  return <>{username}</>;
};
