import { FC } from "react";

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export const PrOpenIcon: FC<IconProps> = ({ width = 16, height = 16, color = "black" }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path
          fillRule="evenodd"
          style={{ fill: color }}
          d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"
        ></path>
      </svg>
    </>
  );
};

export const PrMergedIcon: FC<IconProps> = ({ width = 16, height = 16, color = "black" }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path
          fillRule="evenodd"
          style={{ fill: color }}
          d="M5 3.254V3.25v.005a.75.75 0 110-.005v.004zm.45 1.9a2.25 2.25 0 10-1.95.218v5.256a2.25 2.25 0 101.5 0V7.123A5.735 5.735 0 009.25 9h1.378a2.251 2.251 0 100-1.5H9.25a4.25 4.25 0 01-3.8-2.346zM12.75 9a.75.75 0 100-1.5.75.75 0 000 1.5zm-8.5 4.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
        ></path>
      </svg>
    </>
  );
};

export const PrClosedIcon: FC<IconProps> = ({ width = 16, height = 16, color = "black" }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path
          fillRule="evenodd"
          style={{ fill: color }}
          d="M10.72 1.227a.75.75 0 011.06 0l.97.97.97-.97a.75.75 0 111.06 1.061l-.97.97.97.97a.75.75 0 01-1.06 1.06l-.97-.97-.97.97a.75.75 0 11-1.06-1.06l.97-.97-.97-.97a.75.75 0 010-1.06zM12.75 6.5a.75.75 0 00-.75.75v3.378a2.251 2.251 0 101.5 0V7.25a.75.75 0 00-.75-.75zm0 5.5a.75.75 0 100 1.5.75.75 0 000-1.5zM2.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.25 1a2.25 2.25 0 00-.75 4.372v5.256a2.251 2.251 0 101.5 0V5.372A2.25 2.25 0 003.25 1zm0 11a.75.75 0 100 1.5.75.75 0 000-1.5z"
        ></path>
      </svg>
    </>
  );
};

export const CollapseIcon: FC<IconProps> = ({ width = 16, height = 16 }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path
          fillRule="evenodd"
          d="M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z"
        ></path>
      </svg>
    </>
  );
};

export const CollapsedIcon: FC<IconProps> = ({ width = 16, height = 16 }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path
          fillRule="evenodd"
          d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"
        ></path>
      </svg>
    </>
  );
};

export const PlusIcon: FC<IconProps> = ({ width = 16, height = 16, className = "" }) => {
  return (
    <>
      <div className={className}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          <path
            fillRule="evenodd"
            d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 110 1.5H8.5v4.25a.75.75 0 11-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"
          ></path>
        </svg>
      </div>
    </>
  );
};

export const HideResolvedIcon: FC<IconProps> = ({ width = 16, height = 16 }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path d="M10.896 2H8.75V.75a.75.75 0 00-1.5 0V2H5.104a.25.25 0 00-.177.427l2.896 2.896a.25.25 0 00.354 0l2.896-2.896A.25.25 0 0010.896 2zM8.75 15.25a.75.75 0 01-1.5 0V14H5.104a.25.25 0 01-.177-.427l2.896-2.896a.25.25 0 01.354 0l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25zm-6.5-6.5a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z"></path>
      </svg>
    </>
  );
};

export const ShowResolvedIcon: FC<IconProps> = ({ width = 16, height = 16 }) => {
  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <path d="M8.177.677l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25a.75.75 0 01-1.5 0V4H5.104a.25.25 0 01-.177-.427L7.823.677a.25.25 0 01.354 0zM7.25 10.75a.75.75 0 011.5 0V12h2.146a.25.25 0 01.177.427l-2.896 2.896a.25.25 0 01-.354 0l-2.896-2.896A.25.25 0 015.104 12H7.25v-1.25zm-5-2a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z"></path>
      </svg>{" "}
    </>
  );
};
