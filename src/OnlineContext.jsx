import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    auth, db, signInAnonymously, onAuthStateChanged,
    ref, set, query, orderByChild, limitToLast, onValue, runTransaction, getCurrentUid
} from './firebaseConfig';
import { serverTimestamp } from 'firebase/database';
import { DEFAULT_COUNTRY } from './utils/country';

const DEFAULT_PLAYER_NAME = "Anonymous Player";
const LOCAL_NAME_KEY = 'game_player_name';

const OnlineContext = createContext();

export function useOnline() {
    return useContext(OnlineContext);
}

export function OnlineProvider({ children }) {
    const [loading, setLoading] = useState(true); //auth loading
    const [currentUser, setCurrentUser] = useState(null); //auth user, has currentUser.uid
    const [isConnected, setIsConnected] = useState(false); //has real online db connection

    const [playerName, setPlayerName] = useState(localStorage.getItem(LOCAL_NAME_KEY) || DEFAULT_PLAYER_NAME);
    const [playerCountry, setPlayerCountry] = useState(DEFAULT_COUNTRY);

    // 3. Game Data State
    const [scores, setScores] = useState(null);
    const [scoresLoading, setScoresLoading] = useState(true);

    function updatePlayerName(name) {
        if (name && name.trim().length > 3) {
            setPlayerName(name);
            localStorage.setItem(LOCAL_NAME_KEY, name);
            // Also update the profile in the DB if authenticated
            const uid = getCurrentUid();
            if (uid) {
                set(ref(db, `users/${uid}/name`), name).catch(console.error);
            }
        }
    };

    // --- Core Logic Functions ---

    const submitScore = useCallback(async (newScore) => {
        const uid = currentUser?.uid;
        if (!uid || !isConnected) return;
        const country = await fetchCountry();

        const userRef = ref(db, `users/${uid}`);
        const bestScoreRef = ref(db, `bestScores/${uid}`);
        const submitsRef = ref(db, `submits`);

        try {
            await set(userRef, { name: playerName, country: country });

            //store for history, cheating check
            const newSubmitRef = ref(db, 'submits').push();
            await set(newSubmitRef, { id: newSubmitRef.key, player: uid, at: serverTimestamp(), score: newScore });


            //write to bestScore
            const success = await runTransaction(bestScoreRef, (currentData) => {
                const existingScore = currentData?.score || 0;
                if (newScore <= existingScore) return;
                return {
                    score: newScore,
                    name: playerName,
                    country: country,
                    updatedAt: serverTimestamp(),
                };
            });

            if (success.committed) {
                console.log("Score submitted successfully or updated as new high score!");
            } else {
                console.log("Score not submitted: It was not a high score.");
            }

        } catch (error) {
            console.error("Error submitting score:", error);
        }

    }, [currentUser, playerName, isConnected]);

    // Firebase Auth Listener
    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(false);
            if (!user) {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Anonymous sign-in failed:", error);
                }
            }
        });
    }, []);


    // Connection Listener
    useEffect(() => {
        const connectedRef = ref(db, '.info/connected');
        const unsubscribeConn = onValue(connectedRef, (snap) => {
            setIsConnected(snap.val() === true);
        });
        return unsubscribeConn;
    }, []);


    // Leader Board Listener
    useEffect(() => {
        setScoresLoading(true);
        // Use RTDB Query: Order by score and limit to the top 100
        const scoresQuery = query(ref(db, 'bestScores'), orderByChild('score'), limitToLast(100));

        // onValue loads once and then updates in real-time
        return onValue(scoresQuery, (snapshot) => {
            const scoresList = [];
            snapshot.forEach((childSnapshot) => {
                scoresList.push({
                    uid: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Reverse to get descending order (highest score first)
            setScores(scoresList.reverse());
            setScoresLoading(false);
        }, (error) => {
            console.error("Error fetching scores:", error);
            // If offline and no initial data, scores will be empty/null, and loading false
            setScoresLoading(false);
        });

    }, []);


    // useEffect(() => {
    //     if (isConnected && currentUser && !loading) {
    //         submitScore(1)
    //     }

    // }, [isConnected, currentUser, loading])

    const value = {
        playerName,
        playerCountry,
        updatePlayerName,
        submitScore,
        scores,
        scoresLoading, //loading in progress
        isConnected,
        isOnline: isConnected && currentUser && !loading,
        uid: currentUser?.uid
    };

    // Only render children after initial authentication load
    return (
        <OnlineContext.Provider value={value}>
            {!loading && children}
        </OnlineContext.Provider>
    );
}