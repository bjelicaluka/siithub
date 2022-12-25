import { useRouter } from "next/router";
import { PersonalProfile } from "../../features/users/profile/PersonalProfile";

const Profile = () => {
  
  const router = useRouter();
  const {username} = router.query;

  return (
    <>
      {
        username ? <>
          <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-">
              <PersonalProfile username={username.toString()} />
            </div>
          </div>
        </> :
        <></>
      }
    </>
  );
};

export default Profile;