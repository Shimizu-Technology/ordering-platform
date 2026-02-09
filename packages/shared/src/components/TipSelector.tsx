import { useState } from 'react';

export interface TipOption {
  label: string;
  percentage?: number;
  amount?: number;
}

interface TipSelectorProps {
  subtotal: number;
  onTipChange: (tipAmount: number, tipPercentage: number | null) => void;
  defaultPercentage?: number;
  className?: string;
}

const DEFAULT_OPTIONS: TipOption[] = [
  { label: 'No Tip', percentage: 0 },
  { label: '15%', percentage: 15 },
  { label: '20%', percentage: 20 },
  { label: '25%', percentage: 25 },
  { label: 'Custom', percentage: undefined },
];

export function TipSelector({
  subtotal,
  onTipChange,
  defaultPercentage = 20,
  className = '',
}: TipSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<number | 'custom'>(
    DEFAULT_OPTIONS.findIndex(opt => opt.percentage === defaultPercentage) ?? 2
  );
  const [customAmount, setCustomAmount] = useState<string>('');

  const calculateTip = (percentage: number) => {
    return Math.round(subtotal * (percentage / 100) * 100) / 100;
  };

  const handleOptionClick = (index: number) => {
    const option = DEFAULT_OPTIONS[index];
    
    if (option.percentage === undefined) {
      // Custom option
      setSelectedOption('custom');
      const amount = parseFloat(customAmount) || 0;
      onTipChange(amount, null);
    } else {
      setSelectedOption(index);
      const tipAmount = calculateTip(option.percentage);
      onTipChange(tipAmount, option.percentage);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    const formatted = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitized;
    
    setCustomAmount(formatted);
    const amount = parseFloat(formatted) || 0;
    onTipChange(amount, null);
  };

  const formatPrice = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-text-primary">
        Add a tip
      </label>
      
      {/* Tip Options Grid */}
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_OPTIONS.map((option, index) => {
          const isSelected = selectedOption === index || 
            (option.percentage === undefined && selectedOption === 'custom');
          const tipAmount = option.percentage !== undefined 
            ? calculateTip(option.percentage) 
            : null;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => handleOptionClick(index)}
              className={`
                px-2 py-3 rounded-lg border-2 text-center transition-all
                ${isSelected 
                  ? 'border-brand bg-brand-light text-brand font-semibold' 
                  : 'border-border-default bg-surface-card hover:border-brand/50'
                }
              `}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              {tipAmount !== null && tipAmount > 0 && (
                <span className="block text-xs text-text-muted mt-0.5">
                  {formatPrice(tipAmount)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Amount Input */}
      {selectedOption === 'custom' && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full pl-7 pr-4 py-3 rounded-lg border border-border-default bg-surface-card
                       text-text-primary placeholder:text-text-muted
                       focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      )}
    </div>
  );
}
