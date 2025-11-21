export default function Button({ text, type="button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px",
        background: "#007bff",
        border: "none",
        color: "#fff",
        fontSize: "16px",
        cursor: "pointer",
        borderRadius: "6px",
        marginTop: "10px"
      }}
    >
      {text}
    </button>
  );
}
