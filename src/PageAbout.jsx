import Modal from "./components/Modal";


export function PageAbout({ shown, onBack, onClose }) {

    return (
        <Modal shown={shown} title={"About"} onBack={onBack} onClose={onClose}>
            <div className='flex p-2 flex-col'>
                <br /><br />
                Test modal content about the game.
                <br />
                <br />
                More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior. More text to test scrolling behavior.
                <br /><br />
                Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window.
                <br /><br />
                Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window.
                <br /><br />
                Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window.
                <br /><br />
                Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window.
                <br /><br />
                Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window. Even more text to see how it looks when there is a lot of content in the modal window.
            </div>
        </Modal >);
}
