import React from "react";
import { Input } from "../ui/input";

const UrlSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-6">
      <Input
        placeholder="Search your URLs..."
        className="max-w-md bg-white/80 backdrop-blur-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default UrlSearch;