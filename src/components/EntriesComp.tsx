interface EntriesPerPageProps {
  entriesPerPage: number;
  setEntriesPerPage: (value: number) => void;
}

const EntriesPerPage: React.FC<EntriesPerPageProps> = ({
  entriesPerPage,
  setEntriesPerPage,
}) => {
  return (
    <div className="ml-4 text-sm flex items-center justify-end">
      <h2 className="text-sm mr-2">Entries Per Page:</h2>
      <select
        className="border rounded px-2 py-1 mr-3 text-sm"
        value={entriesPerPage}
        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
    </div>
  );
};

export default EntriesPerPage;
