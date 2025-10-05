import { useEffect, useRef, useState } from 'react';
import { BackButton, Button, CloseButton, MenuButton, PinkButton, SvgBack } from './Button';
import { cn } from '../utils/cn';

const Modal = ({ shown, onBack, onClose, title, children }) => {
    const dialogRef = useRef(null);
    const scrollRef = useRef(null);

    const [reallyShown, setReallyShown] = useState(shown);

    useEffect(() => {
        const to = setTimeout(() => {
            setReallyShown(shown);
        }, shown ? 100 : 200);
        return () => clearTimeout(to);
    }, [shown]);

    useEffect(() => {
        reallyShown && (scrollRef.current.scrollTop = 0);
        reallyShown && dialogRef.current?.showModal();
        reallyShown || dialogRef.current?.close();
    }, [reallyShown]);

    function handleCancel(e) {
        e.preventDefault();
        onBack && onBack();
        !onBack && onClose && onClose();
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
            className="backdrop:bg-black/0 z-10 bg-white/0 select-none p-0 xtext-[16px]
             grid min-w-svw  min-h-svh max-h-svh  justify-center items-center ">

            <div className={cn("flex-1 ring-2 ring-black/10 scale-90",
                "opacity-10 duration-200 transition-all",
                "flex flex-col bg-white max-h-[min(600px,90svh)] max-w-[90svw] w-xl",
                (reallyShown) && "scale-100 opacity-100",
                (!shown) && "scale-90 opacity-0",
                "outline-none xhue-rotate-180 "
            )} tabIndex={0}>
                <div className="bg-puzzle flex items-center gap-4 justify-between p-2 text-white uppercase font-extrabold">
                    <BackButton onClick={onBack} disabled={!onBack} />
                    <div className='overflow-hidden xbg-amber-500 xtext-ellipsis xp-4 xwhitespace-nowrap flex-1 text-center xpe-18  xtext-[120%]'>
                        {title}
                    </div>
                    <CloseButton onClick={onClose} disabled={!onClose} />

                </div>

                <div ref={scrollRef}
                    className={cn("flex-1 bg-white items-stretch w-full overflow-y-auto flex flex-col-reverse")}>
                    {children}
                </div>

                <div className=" bg-puzzle/20 p-2 flex items-stretch justify-stretch flex-col">
                </div>

            </div>

        </dialog >
    );
};

export default Modal;