import { useEffect, useRef, useState } from 'react';
import { BackButton, Button, CloseButton, MenuButton, PinkButton, SvgBack } from './Button';
import { cn } from '../utils/cn';


const Modal = ({ shown, onBack, onClose, title, actionName, onAction, isbottom, children }) => {

    const dialogRef = useRef(null);
    const scrollRef = useRef(null);
    const backdropRef = useRef(null);

    const [reallyShown, setReallyShown] = useState(shown);

    useEffect(() => {
        if (shown) {
            setTimeout(() => {
                setReallyShown(true);
            }, 100);
        } else {
            setTimeout(() => {
                setReallyShown(false);
            }, 200);
        }

    }, [shown]);

    useEffect(() => {
        if (reallyShown) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [reallyShown]);

    function handleCancel(e) {
        //Prevent dialog closing on escape or back button, for hiding animation
        e.preventDefault();
        onClose && onClose();
        !onClose && onBack && onBack();
    }

    function handleBackdropClick(e) {
        if (e.target === backdropRef.current) {
            onCancel();
        }
    }
    if (!reallyShown && !shown) return null;

    return (
        <dialog ref={dialogRef} onCancel={handleCancel}

            className="backdrop:bg-black/0 z-10 bg-white/0 select-none p-0 xtext-[16px]
             grid min-w-svw  min-h-svh max-h-svh  justify-center items-center ">

            {/* <div ref={backdropRef} className="grid [view-transition-namexxx:dialog-backdrop] h-dvh bg-black/0"
                onClick={handleBackdropClick}></div>  */}
            <div className={cn("flex-1 ring-2 ring-black/10 scale-90",
                "opacity-10 duration-200 transition-all",
                "flex flex-col bg-white max-h-[min(600px,90svh)] max-w-[90svw] w-xl",
                (reallyShown) && "scale-100 opacity-100",
                (!shown) && "scale-90 opacity-0",
                "outline-none xhue-rotate-180 "
            )} tabIndex={0}>
                <div className="bg-puzzle flex items-center justify-between p-2 text-white uppercase">
                    <BackButton onClick={onClose || onBack} />
                    <span className='overflow-hidden text-ellipsis  whitespace-nowrap'>{title}</span>
                    <CloseButton disabled={true} onClick={onClose} />

                </div>

                <div ref={scrollRef}
                    className={cn("flex-1 bg-white items-stretch w-full overflow-y-auto flex flex-col",
                        isbottom && "flex-col-reverse",
                    )}>
                    {children}
                </div>

                <div className=" bg-puzzle/20 p-2 flex items-stretch justify-stretch flex-col">


                    {/* <MenuButton onClick={onClose || onBack}>back</MenuButton> */}

                </div>

            </div>

        </dialog >
    );
};

export default Modal;