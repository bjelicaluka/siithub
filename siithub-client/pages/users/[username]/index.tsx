import { useRouter } from "next/router";
import { PersonalProfile } from "../../../features/users/profile/PersonalProfile";

const Profile = () => {
  const router = useRouter();
  const { username } = router.query;

  if (!username) return <></>;

  return (
    <>
      <PersonalProfile username={username.toString()} />
    </>
  );
};

export default Profile;
