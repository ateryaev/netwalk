import Modal from "./components/Modal";

export function PageSettings({ shown, onBack, onClose }) {
    return (
        <Modal shown={shown} title={"Settings"} onBack={onBack} onClose={onClose}>
            <div className='flex p-2 flex-col'>
                sound
                <br />
                vibro
                <br />
                music
                <br />
                name
            </div>
        </Modal >);
}