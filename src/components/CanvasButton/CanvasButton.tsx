type Props = {
    label: string;
    onClick: () => void;
    className?: string;
};

const CanvasButton = ({ label, onClick, className }: Props) => {
    return (
        <button
            onClick={onClick}
            className={`
                px-4 py-2
                min-w-[110px] h-12
                bg-neutral-800 text-white
                border border-neutral-700
                rounded-lg
                font-semibold tracking-wide
                text-sm
                shadow-sm
                cursor-pointer

                hover:bg-neutral-700
                hover:border-neutral-600
                active:scale-[0.98]

                focus:outline-none
                focus:ring-2 focus:ring-stone-400

                transition-all duration-200
                ${className ?? ""}
            `}
        >
            {label}
        </button>
    );
};

export default CanvasButton;