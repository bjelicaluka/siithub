import Avatar from "boring-avatars";
import { type FC } from "react";

type ProfilePictureProps = {
  username: string;
  size?: number;
};

export const ProfilePictureOld: FC<ProfilePictureProps> = ({ username, size = 50 }) => {
  return (
    <Avatar
      size={size}
      name={username}
      variant="pixel"
      colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
    />
  );
};

const colors = ["#E02424", "#E3A008", "#0E9F6E", "#1C64F2", "#5850EC", "#7E3AF2", "#D61F69"] as const;
const white = "#E5E7EB" as const;

export const ProfilePicture: FC<ProfilePictureProps> = ({ username, size = 50 }) => {
  const color = colors[username.charCodeAt(0) % colors.length];
  const n = (username.charCodeAt(username.length - 1) % 4) + 6;
  const hash = hashCode(username);
  let c = 0;
  const pixels = Array.from({ length: 15 }, (_, i) => i < n).sort(() => 2 * (hash << c++) - 1);
  return (
    <svg viewBox="0 0 5 5" fill="none" width={size} height={size}>
      <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="5" height="5">
        <rect width="5" height="5" rx="3" fill="white" />
      </mask>
      <g mask="url(#mask0)">
        <rect y="0" x="0" width="1" height="1" fill={pixels[0] ? color : white} />
        <rect y="0" x="1" width="1" height="1" fill={pixels[1] ? color : white} />
        <rect y="0" x="2" width="1" height="1" fill={pixels[2] ? color : white} />
        <rect y="0" x="3" width="1" height="1" fill={pixels[1] ? color : white} />
        <rect y="0" x="4" width="1" height="1" fill={pixels[0] ? color : white} />
        <rect y="1" x="0" width="1" height="1" fill={pixels[3] ? color : white} />
        <rect y="1" x="1" width="1" height="1" fill={pixels[4] ? color : white} />
        <rect y="1" x="2" width="1" height="1" fill={pixels[5] ? color : white} />
        <rect y="1" x="3" width="1" height="1" fill={pixels[4] ? color : white} />
        <rect y="1" x="4" width="1" height="1" fill={pixels[3] ? color : white} />
        <rect y="2" x="0" width="1" height="1" fill={pixels[6] ? color : white} />
        <rect y="2" x="1" width="1" height="1" fill={pixels[7] ? color : white} />
        <rect y="2" x="2" width="1" height="1" fill={pixels[8] ? color : white} />
        <rect y="2" x="3" width="1" height="1" fill={pixels[7] ? color : white} />
        <rect y="2" x="4" width="1" height="1" fill={pixels[6] ? color : white} />
        <rect y="3" x="0" width="1" height="1" fill={pixels[9] ? color : white} />
        <rect y="3" x="1" width="1" height="1" fill={pixels[10] ? color : white} />
        <rect y="3" x="2" width="1" height="1" fill={pixels[11] ? color : white} />
        <rect y="3" x="3" width="1" height="1" fill={pixels[10] ? color : white} />
        <rect y="3" x="4" width="1" height="1" fill={pixels[9] ? color : white} />
        <rect y="4" x="0" width="1" height="1" fill={pixels[12] ? color : white} />
        <rect y="4" x="1" width="1" height="1" fill={pixels[13] ? color : white} />
        <rect y="4" x="2" width="1" height="1" fill={pixels[14] ? color : white} />
        <rect y="4" x="3" width="1" height="1" fill={pixels[13] ? color : white} />
        <rect y="4" x="4" width="1" height="1" fill={pixels[12] ? color : white} />
      </g>
    </svg>
  );
};

function hashCode(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    let character = name.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
