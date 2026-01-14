import { FiPlus } from "react-icons/fi";

export default function Header({
  onAdd,
  buttonText,
  pageHeader,
  pageSubHeader,
  buttonDisplay,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 md:gap-4 px-4 sm:px-6">
      <div className="flex items-center justify-between w-full sm:w-auto sm:block">
        <div className="flex items-center w-full justify-between md:block">
          <h1 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-bold">
            {pageHeader}
          </h1>
          {/* Mobile Add Button */}
          <button
            onClick={onAdd}
            className={`sm:hidden ${buttonDisplay} flex items-center gap-1 rounded-lg bg-foreground hover:bg-primary transition-all duration-200 px-3 py-2 font-semibold text-background shadow-lg hover:shadow-xl active:scale-95 text-sm`}
          >
            <FiPlus className="text-base" />
            <span>Add</span>
          </button>
        </div>
        <p className="text-text/70 text-sm md:text-base mt-1 hidden sm:block">
          {pageSubHeader}
        </p>
      </div>

      {/* Subtitle for mobile */}
      <p className="text-text/70 text-sm sm:hidden w-full mt-2">
        {pageSubHeader}
      </p>

      {/* Desktop Add Button */}
      <button
        onClick={onAdd}
        className={`hidden sm:${buttonDisplay} sm:flex items-center gap-2 rounded-lg bg-foreground hover:bg-background hover:text-foreground border border-transparent hover:border hover:border-text/40  transition-all hover:cursor-pointer duration-200 px-5 py-3 font-semibold text-background shadow-lg hover:shadow-2xl active:scale-95`}
      >
        <FiPlus className="text-xl" />
        {buttonText}
      </button>
    </div>
  );
}
