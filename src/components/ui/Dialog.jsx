import React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="mt-2 px-3 py-1 bg-gray-200 rounded"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
