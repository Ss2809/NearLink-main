import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination() {
  return (
    <div className="flex justify-center items-center gap-3 mt-2">

      <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100">
        <ChevronLeft size={18} />
      </button>

      <button className="w-10 h-10 rounded-lg bg-green-500 text-white font-semibold">
        1
      </button>

      <button className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100">
        2
      </button>

      <button className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100">
        3
      </button>

      <span className="text-gray-500">...</span>

      <button className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100">
        12
      </button>

      <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100">
        <ChevronRight size={18} />
      </button>

    </div>
  );
}

export default Pagination;