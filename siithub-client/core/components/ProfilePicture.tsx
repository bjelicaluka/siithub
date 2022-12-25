import Avatar from "boring-avatars"
import { type FC } from "react"

type ButtonProps = {
  username: string,
  size?: number
}

export const ProfilePicture: FC<ButtonProps> = ({ username, size = 50 }) => {
  return (
    <Avatar
      size={size}
      name={username}
      variant="pixel"
      colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
    />
  )
}