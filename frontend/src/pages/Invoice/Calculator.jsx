import React, { useState } from 'react';

const buttonLayout = [
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', 'C', '+'],
  ['=', '']
];

const Calculator = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handleButtonClick = (value) => {
    if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '=') {
      try {
        // eslint-disable-next-line no-eval
        const evalResult = eval(input.replace(/\u00D7/g, '*').replace(/\u00F7/g, '/'));
        setResult(evalResult);
      } catch {
        setResult('Error');
      }
    } else {
      setInput((prev) => prev + value);
      setResult('');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '.'].includes(e.key)) {
      setInput((prev) => prev + e.key);
    } else if (e.key === 'Enter') {
      handleButtonClick('=');
    } else if (e.key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
    } else if (e.key === 'Escape') {
      onClose && onClose();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="mb-4">
          <input
            className="w-full text-right text-2xl p-2 border-b border-gray-200 focus:outline-none bg-gray-50 rounded"
            value={input}
            readOnly
            placeholder="0"
          />
          <div className="text-right text-lg text-blue-600 min-h-[1.5em]">{result !== '' ? result : '\u00A0'}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','+','='].map((btn, idx) => (
            btn ? (
              <button
                key={btn+idx}
                className={`py-3 rounded text-lg font-semibold ${btn === '=' ? 'col-span-4 bg-blue-500 text-white hover:bg-blue-600' : btn === 'C' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                style={btn === '=' ? { gridColumn: 'span 4' } : {}}
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </button>
            ) : <div key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator; 