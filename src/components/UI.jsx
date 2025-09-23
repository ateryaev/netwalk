export function Inv({ children, className, ...props }) {
    return (
        <span className={"hue-rotate-180 " + className} {...props}>
            {children}
        </span>
    )
}