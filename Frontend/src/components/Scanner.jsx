import React from "react";

const Scanner = () => {
  return (
    <>
      <div className="w-48 h-48 border-2 border-solid border-gray-300 rounded-md mx-auto mt-4">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-2 border-dashed border-black rounded-full animate-spin "></div>
        </div>
      </div>
      <h1 className="mt-6">Your Link :- </h1>
    </>
  );
};

export default Scanner;
