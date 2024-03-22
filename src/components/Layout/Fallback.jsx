export default function Fallback({ text = "Not Found" }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
        fontSize: 24,
        padding: 16,
      }}
    >
      {text}
    </div>
  );
}
