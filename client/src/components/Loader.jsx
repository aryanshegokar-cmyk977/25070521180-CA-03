export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader">
      <div className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}
