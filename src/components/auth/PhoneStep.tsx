import React, { useState } from 'react';

interface PhoneStepProps {
  onNext: (phone: string) => void;
}

const PhoneStep: React.FC<PhoneStepProps> = ({ onNext }) => {
  const [phone, setPhone] = useState('');

  const handleNext = () => {
    if (phone.trim()) {
      onNext(phone.trim());
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Enter your phone number</h2>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="e.g., 0971234567"
        className="w-full p-2 border rounded mb-4"
      />
      <button onClick={handleNext} className="w-full p-2 bg-blue-500 text-white rounded">
        Next
      </button>
    </div>
  );
};

export default PhoneStep;
