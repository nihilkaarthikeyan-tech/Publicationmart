export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-oxblood px-4 py-2 text-xs font-semibold uppercase tracking-widest text-paper transition duration-150 ease-in-out hover:bg-oxblood-deep focus:bg-oxblood-deep focus:outline-none focus:ring-2 focus:ring-oxblood focus:ring-offset-2 active:bg-oxblood-night dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
