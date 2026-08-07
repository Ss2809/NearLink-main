import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  
  const handleNext = () => {
  console.log("Next Clicked");

  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>

      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index + 1)}
          className={`w-10 h-10 rounded-lg font-semibold transition ${
            currentPage === index + 1
              ? "bg-green-500 text-white"
              : "border border-gray-300 hover:bg-gray-100"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default Pagination;