import SearchInput from "./SearchInput";
import FilterSelect from "./FilterSelect";

export default function TransactionFilters({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  categoryValue,
  onCategoryChange,
}) {
  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Transactions" },
    { value: "salary", label: "Salary" },
    { value: "groceries", label: "Groceries" },
    { value: "bills", label: "Bills" },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-4">
      {/* Search */}
      <SearchInput
        placeholder="Search transactions"
        value={searchValue}
        onChange={onSearchChange}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <FilterSelect
          label="Sort by"
          value={sortValue}
          onChange={onSortChange}
          options={sortOptions}
        />

        <FilterSelect
          label="Category"
          value={categoryValue}
          onChange={onCategoryChange}
          options={categoryOptions}
        />
      </div>
    </div>
  );
}
