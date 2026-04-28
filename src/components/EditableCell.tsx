import React, { useState } from 'react';
import { NumberInput, Switch } from '@tremor/react';

interface EditableCellProps {
  value: number | boolean;
  onChange: (newValue: number | boolean) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = (newValue: number | boolean) => {
    onChange(newValue);
    setIsEditing(false);
  };

  if (isEditing) {
    if (typeof value === 'boolean') {
      return <Switch checked={value} onChange={(checked) => handleBlur(checked)} />;
    }
    return <NumberInput value={value} onValueChange={(val) => {
          if (val === null || val === undefined) return;
          onChange(val);
        }} onBlur={() => setIsEditing(false)} />;
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer">
      {typeof value === 'boolean' ? <Switch checked={value} readOnly /> : (value === -1 ? 'Unlimited' : value)}
    </div>
  );
};

export default EditableCell;
