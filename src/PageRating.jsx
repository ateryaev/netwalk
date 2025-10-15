import Modal from "./components/Modal";

export function PageRating({ shown, onBack, onClose }) {
    return (
        <Modal shown={shown} title={"Leaderboard"} onBack={onBack} onClose={onClose}>
            <div className='flex p-2 flex-col'>
                NAME/SCORE:
                <br />
                Anton : 2000
                <br />
                Anton : 2000
                <br />
                Anton : 2000
                <br />
                Anton : 2000
                <br />
                Anton : 2000
                <br />
                Anton : 2000
                <br />
                Anton : 2000
                <br />
                Anton : 2000

            </div>
        </Modal >);
}