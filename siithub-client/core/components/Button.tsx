import { FC } from "react"

type ButtonProps = {
  type?: 'submit'|'button',
  children: React.ReactNode
}

export const Button: FC<ButtonProps> = ({ type = 'submit', children }) => {
  return (
    <button
      type={type}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {children}
    </button>

  )
}