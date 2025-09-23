import Modal from "./components/Modal";

export function PageAbout({ shown, onBack }) {
    return (
        <Modal shown={shown} title={"about"} onBack={onBack}>
            <div className='flex flex-col gap-2 items-stretch p-4 m-auto'>
                ABOUT
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
        </Modal>
    )
}
