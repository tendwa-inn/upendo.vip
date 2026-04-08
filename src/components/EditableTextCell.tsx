import React, { useState } from 'react';

interface EditableTextCellProps {
  value: string;
  onSave: (newValue: string) => void;
}

const EditableTextCell: React.FC<EditableTextCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="bg-gray-800 text-white p-1 rounded-md"
        autoFocus
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer">
      {value}
    </div>
  );
};

export default EditableTextCell;
