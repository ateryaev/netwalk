import { useEffect, useRef, useState, ViewTransition } from 'react';
import { BaseButton, MainButton, MenuButton, PinkButton, RoundButton, TabButton } from './Button';
import { cn } from '../utils/cn';
import { preBeepButton } from '../utils/beep';
import { BigTitled, Inv, Titled } from './UI';
import { SvgClose, SvgBack } from './Svg';

export function SubHeader({ className, children }) {
    return (<div
        className={cn('uppercase text-gray-600 mx-0 px-4 py-2.5 sticky top-0 z-10 flex',
            ' bg-gray-200 xhue-rotate-180', className)}>
        {children}
    </div>)
}

export function SubContent({ className, children }) {
    return (<div className={cn('flex flex-col mx-0 p-4 gap-5 bg-gray-100',
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
                "transition-all transition-discrete select-none",
                "z-10 bg-black/0 hidden",
                "backdrop:bg-transparent",
                "overflow-hidden",
                "starting:bg-black/0 duration-200",
                "not-open:hidden not-open:bg-black/0 ",
                "open:block open:bg-black/50",
                "min-w-svw  min-h-svh grid items-end justify-center",
            )}>

            <div className={cn("h-[85svh] max-w-svw w-xl  outline-none  flex flex-col",
                "overflow-hidden bg-white duration-200 transition-all",
                "fixed bottom-0 right-0 left-0 mx-auto translate-y-full translate-0 opacity-100",
                "starting:translate-y-1/4 starting:opacity-0",
                "not-in-open:translate-y-1/4 not-in-open:opacity-0"
            )}
                tabIndex={0}>
                <div className="flex items-center gap-2 text-white z-10 bg-puzzle
                justify-center p-4 pr-2xx  pt-5 text-left sticky left-0 ">

                    <BigTitled title={title} subtitle={subtitle} className={cn("flex-1 text-left")} />

                    {onBack && <RoundButton onClick={onBack}><SvgBack /></RoundButton>}
                    {onClose && <RoundButton onClick={onClose}><SvgClose /></RoundButton>}

                </div>

                <div
                    key={subtitle}
                    className={cn('sticky left-0 origin-right flex-1 flex flex-col overflow-x-hidden w-full overflow-y-auto items-stretch',
                        "bg-gray-100",
                        'translate-0 opacity-100 starting:translate-x-10 starting:opacity-20 xduration-1000 transition-all',
                        !useSubTransition && "starting:translate-x-0",
                        isStartPage && useSubTransition && "starting:-translate-x-10",
                    )}>
                    {children}
                    <div className='flex-1'></div>
                    <div className='bg-black/5 sticky bottom-0 z-50 min-h-1 w-full pb-(--safe-area-bottom,0px)'></div>


                </div>
            </div>
        </dialog >
    );
};

export default Modal;