import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
    auth, db, signInAnonymously, onAuthStateChanged,
    ref, set, query, orderByChild, limitToLast, onValue, runTransaction, getCurrentUid
} from './firebaseConfig';
import { push, serverTimestamp } from 'firebase/database';
import { fetchCountry } from './utils/country';

const OnlineContext = createContext();

export function useOnline() {
    return useContext(OnlineContext);
}

export function OnlineProvider({ children }) {
    const [loading, setLoading] = useState(true); //auth loading
    const [currentUser, setCurrentUser] = useState(null); //auth user, has currentUser.uid
    const uid = currentUser?.uid;
    const hash = uid?.substr(-4) || "????";
    const [isConnected, setIsConnected] = useState(false); //has real online db connection

    const [scores, setScores] = useState(null); //list of best scores from db
    const [scoresLoading, setScoresLoading] = useState(true); //loading best scores

    const submitTaps = useCallback(async (playerName, mode, level, taps) => {
        if (!uid || !isConnected) return;
        const country = await fetchCountry();
        const submitsRef = ref(db, 'submits');
        const newSubmitRef = push(submitsRef);
        set(newSubmitRef, {
            player: uid,
            name: playerName,
            country: country,
            at: serverTimestamp(),
            mode, level, taps
        });
    }, [uid, isConnected]);

    const submitScore = useCallback(async (playerName, newScore) => {
        if (!uid || !isConnected) return;

        const country = await fetchCountry();
        const bestScoreRef = ref(db, `bestScores/${uid}`);

        try {
            let delta = 0;
            const success = await runTransaction(bestScoreRef, (currentData) => {
                const existingScore = currentData?.score || 0;
                if (newScore <= existingScore) return;
                delta = newScore - existingScore;
                return {
                    score: newScore,
                    name: playerName,
                    country: country,
                    at: serverTimestamp(),
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

    }, [uid, isConnected]);

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

    const value = {
        submitScore, //(playerName, score)
        submitTaps, //(playerName, mode, level, taps)
        scores,
        scoresLoading, //loading in progress
        isOnline: isConnected && currentUser && !loading, //do is online, user is set, auth completed
        hash,
        uid
    };

    // Only render children after initial authentication load
    return (
        <OnlineContext.Provider value={value}>
            {children}
        </OnlineContext.Provider>
    );
}