export default function InputField({ label, type="text", name, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      {label && (
        <label style={{ fontWeight: "bold" }}>{label}</label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginTop: "5px",
        }}
      />
    </div>
  );
}