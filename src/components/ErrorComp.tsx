export const ErrorComp: React.FC<{
  error: string | null;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="text-red-600 capitalize text-center font-semibold flex justify-center items-center flex-col">
      {error}
      <button
        onClick={onRetry}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4 block mt-4"
      >
        Try Again
      </button>
    </div>
  );
};
