"use client";

type OptionButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

const OptionButton = ({ label, onClick, className }: OptionButtonProps) => {
    return (
        <button
            className={className ?? `
                w-64 h-12 
                bg-gray-500 text-white 
                border border-gray-600 
                rounded-lg 
                hover:bg-stone-600 
                hover:border-stone-700 
                focus:ring-2 focus:ring-stone-400 
                cursor-pointer 
                text-center 
                font-medium 
                text-xl 
                transition-colors 
                duration-200
            `}
            onClick={onClick}
        >
            {label}
        </button>
    );
};

export default OptionButton;