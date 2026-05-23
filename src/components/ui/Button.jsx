import "./Button.css"

export default function Button({
  children,
  onClick,
  type = "primary",
  disabled = false,

}) {

  return (
    <button
      className={`ui-button ${type}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}