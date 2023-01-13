import { type FC } from "react";
import { Emoji, EmojiStyle } from "emoji-picker-react";

type EmojiPreviewProps = {
  emoji: string;
  counter: number;
  isSelected: boolean;
  onClick: () => any;
}

export const EmojiPreview: FC<EmojiPreviewProps> = ({ emoji, counter, isSelected, onClick }) => {

  return (
    <>
      <button
        type="button"
        className={"text-md font-medium leading-6 bg-indigo-100 rounded-full px-1 " + (isSelected ? "hover:bg-indigo-400" : "")}
        onClick={onClick}
      >
        <Emoji
          unified={emoji}
          emojiStyle={EmojiStyle.NATIVE}
          size={18}
        />{" "}
        <span className="text-lg text-gray-800">{counter}</span>
      </button>
    </>
  )
};