import { useEffect, useRef, useState } from 'react';
import { BaseButton, MainButton, MenuButton, PinkButton, RoundButton, TabButton } from './Button';
import { cn } from '../utils/cn';
import { preBeepButton } from '../utils/beep';
import { BigTitled, Inv, Titled } from './UI';
import { SvgClose, SvgBack } from './Svg';

export function SubHeader({ className, children }) {
    return (<div
        className={cn('uppercase text-puzzle-600 mx-0 px-6 py-4 sticky top-0 z-10',
            ' bg-puzzle-50', className)}>
        {children}
    </div>)
}

export function SubContent({ className, children }) {
    return (<div className={cn('flex flex-col bg-white mx-0 p-0', className)}>
        {children}
    </div>)
}


const Modal = ({ shown, onBack, onClose, title, subtitle, children, reversed }) => {
    const dialogRef = useRef(null);
    const scrollRef = useRef(null);

    const [reallyShown, setReallyShown] = useState(shown);

    useEffect(() => {
        const to = setTimeout(() => {
            setReallyShown(shown);
        }, 200);
        return () => clearTimeout(to);
    }, [shown]);

    useEffect(() => {
        if (reallyShown) {
            setTimeout(() => {
                const element = document.querySelector(".scrolltoitem");
                element?.scrollIntoView({ block: "end", inline: "nearest" });
                if (!element) scrollRef.current.scrollTop = 0;
            }, 0)
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [reallyShown]);

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
    if (!reallyShown && !shown) return null;

    return (
        <dialog ref={dialogRef} onCancel={handleCancel}
            onClick={handleBackdropClick}
            onPointerDown={(e) => e.target === dialogRef.current && preBeepButton()}
            className="backdrop:bg-black/0 z-10 bg-white/0 select-none p-0 xtext-[16px]
             grid min-w-svw  min-h-svh max-h-svh  justify-center items-center ">

            <div className={cn("flex-1 ring-2 ring-black/10 scale-90 border-puzzle-200",
                "opacity-10 duration-200 transition-all overflow-hidden",
                "flex flex-col max-h-[min(600px,90svh)] max-w-[90svw] w-xl",
                (reallyShown) && "scale-100 opacity-100",
                (!shown) && "scale-90 opacity-10",
                "outline-none"
            )} tabIndex={0}>
                <div className="flex items-center gap-3 text-white puzzle-100 z-10 bg-puzzle-500
                justify-center p-6 text-left ">
                    {/* <RoundButton disabled={!onBack} onClick={onBack}><SvgBack /></RoundButton> */}

                    <BigTitled title={title}
                        className={cn("flex-1 text-left", onBack && "xtext-right")}>
                        {subtitle}
                    </BigTitled>

                    <RoundButton className={cn("bg-white/50 text-puzzle-600", !onBack && "invisible")} onClick={onBack}><SvgBack /></RoundButton>
                    <RoundButton className={"invisiblex bg-white/50 text-puzzle-600"} onClick={onClose}><SvgClose /></RoundButton>



                </div >

                <div ref={scrollRef}
                    className={cn("flex-1  bg-white",
                        "items-stretch w-full overflow-y-auto  flex flex-col",
                        reversed && "flex-col-reverse"
                    )}>
                    {children}

                </div>
                {/* <div className="z-10 p-1 px-6 xring-4 ring-puzzle-50/50 text-center xfont-light bg-puzzle-50
                text-x[70%] xuppercase text-puzzle-600 white  xtext-shadow-sm puzzle-600">
                    vervsion 202511
                </div> */}





            </div >


        </dialog >
    );
};

export default Modal;