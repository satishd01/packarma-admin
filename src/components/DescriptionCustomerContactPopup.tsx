import React from "react";
import { Textarea, Button } from "flowbite-react";

interface DescriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (description: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const DescriptionPopup: React.FC<DescriptionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  description,
  setDescription,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add Description</h2>
        <Textarea
          id="description"
          placeholder="Enter description here..."
          rows={4}
          className="w-full mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button color="success" onClick={() => onConfirm(description)}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPopup;
