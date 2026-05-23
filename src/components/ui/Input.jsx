import "./Input.css"

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  min,
  readOnly = false,

}) {
  return (
    <input
      className="ui-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      min={min}
      readOnly={readOnly}
    />
  )
}