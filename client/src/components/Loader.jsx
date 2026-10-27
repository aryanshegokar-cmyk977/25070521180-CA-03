// A paper star that spins while something loads.
export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader">
      <svg className="loader-star" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 3l4.9 10.6 11.6 1.3-8.6 7.9 2.4 11.4L20 28.4 9.7 34.2l2.4-11.4-8.6-7.9 11.6-1.3z" />
      </svg>
      <p>{text}</p>
    </div>
  );
}
