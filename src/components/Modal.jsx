import { useEffect, useRef, useState, ViewTransition } from 'react';
import { BaseButton, MainButton, MenuButton, PinkButton, RoundButton, TabButton } from './Button';
import { cn } from '../utils/cn';
import { preBeepButton } from '../utils/beep';
import { BigTitled, Inv, Titled } from './UI';
import { SvgClose, SvgBack } from './Svg';

//starting:text-gray-600/5 transition-all duration-1000
export function SubHeader({ className, children }) {
    return (<div
        className={cn('uppercase text-gray-600 mx-0 px-4 py-2.5 sticky top-0 z-10 flex',
            //'starting:text-gray-600/20  starting:translate-x-2 transition-all',
            ' bg-gray-100 hue-rotate-180', className)}>
        {children}
    </div>)
}

export function SubContent({ className, children }) {
    return (<div className={cn('flex flex-col bg-white mx-0 p-0',
        //'starting:translate-x-2 starting:opacity-20  transition-all',
        className)}>
        {children}
    </div>)
}

const Modal = ({ shown, onBack, onClose, title, subtitle, children, reversed }) => {
    const dialogRef = useRef(null);

    const [useSubTransition, setUseSubTransition] = useState(false);

    const isStartPage = subtitle?.toLowerCase().includes("welcome");
    useEffect(() => {
        shown && dialogRef.current?.showModal();
        !shown && dialogRef.current?.close();
        setUseSubTransition(shown);
    }, [shown]);

    function handleCancel(e) {
        e.preventDefault();
        (onClose && onClose());
        (!onClose && onBack && onBack());
    }

    function handleBackdropClick(e) {
        if (e.target === dialogRef.current) {
            handleCancel(e)
        }
    }

    return (
        <dialog ref={dialogRef} onCancel={handleCancel}
            onClick={handleBackdropClick}
            onPointerDown={(e) => e.target === dialogRef.current && preBeepButton()}
            className={cn(
                "transition-all duration-1000x select-none",
                "z-10 bg-black/50",
                "backdrop:bg-black/0",
                "overflow-hidden",
                "starting:translate-y-20 starting:opacity-0",
                "not-open:translate-y-20 not-open:hidden not-open:opacity-0 transition-discrete",
                "min-w-svw -my-20 min-h-[calc(100svh+80px)] grid items-end justify-center",
            )}>

            <div className={cn("h-[80svh] max-w-svw w-xl outline-none bg-white flex flex-col",
                "rounded-t-xs overflow-hidden ring-4 ring-black/10"
            )}
                tabIndex={0}>
                <div className="flex items-center gap-2 text-white z-10 bg-puzzle
                justify-center p-4  pt-5 text-left sticky left-0">

                    <BigTitled title={title}
                        className={cn("flex-1 text-left")}>
                        <div key={subtitle}
                            className={cn("transition-all",
                                "starting:opacity-50 starting:scale-y-0 ",
                            )}>
                            {subtitle}
                        </div>
                    </BigTitled>

                    {onBack && <RoundButton className={cn("bg-white/10 text-white", "starting:text-white/50 starting:-rotate-180 transition-all")} onClick={onBack}><SvgBack /></RoundButton>}
                    {onClose && <RoundButton className={cn("bg-white/10 text-white", "starting:text-white/50 starting:rotate-180 transition-all")} onClick={onClose}><SvgClose /></RoundButton>}

                </div>

                <div
                    key={subtitle}
                    className={cn('sticky left-0 origin-right flex-1 flex flex-col overflow-x-hidden xhidden w-full overflow-y-auto items-stretch',
                        'starting:translate-x-10 starting:opacity-20 xduration-1000 transition-all',
                        !useSubTransition && "starting:translate-x-0",
                        isStartPage && useSubTransition && "starting:-translate-x-10",
                    )}>
                    {children}
                    <div className='bg-black/5 sticky bottom-0 z-50 min-h-1 w-full'></div>
                </div>
            </div>
        </dialog >
    );
};

export default Modal;