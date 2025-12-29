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

    const [scores, setScores] = useState([]); //list of best scores from db
    const [events, setEvents] = useState([]); //list of best scores from db

    const [scoresLoading, setScoresLoading] = useState(true); //loading best scores

    const submitScore = useCallback(async (playerName, score) => {
        if (!uid || !isConnected) return;

        const country = await fetchCountry();
        const bestScoreRef = ref(db, `bestScores/${uid}`);

        try {
            let delta = 0;
            const success = await runTransaction(bestScoreRef, (currentData) => {
                const existingScore = currentData?.score || 0;
                delta = score - existingScore;
                if (score <= existingScore) return;
                return { score, name: playerName, country, at: serverTimestamp() };
            });

            if (!success.committed) return;

            if (delta > 0) {
                const eventRef = ref(db, `events/${uid}`);
                await set(eventRef, {
                    name: playerName,
                    country,
                    at: serverTimestamp(),
                    msg: "+" + delta
                });
            }
            // const allEventRef = push(ref(db, 'allevents'));
            // set(allEventRef, { player: uid, at: serverTimestamp(), delta });

        } catch (error) {
            console.error("Error submitting score:", error);
        }

    }, [uid, isConnected]);

    // Firebase Auth Listener
    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {

            if (!user) {
                setLoading(true);
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Anonymous sign-in failed:", error);
                }
            } else {
                setCurrentUser(user);
                console.log("Auth state changed, user:", user);
                setLoading(false);
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
        if (!uid) return;
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

            // scoresList.push({ uid: "1b2c", at: 1763800000000, country: "US", name: "SirSnortsalot", score: 100 });
            // scoresList.push({ uid: "4d5e", at: 1763900000000, country: "GB", name: "DukeQuackenstein", score: 200 });
            // scoresList.push({ uid: "7f8g", at: 1764000000000, country: "CA", name: "ProfessorNoodlepants", score: 400 });
            // scoresList.push({ uid: "9h0i", at: 1764100000000, country: "DE", name: "BaronvonBubblewrap", score: 800 });
            // scoresList.push({ uid: "abc1", at: 1764200000000, country: "FR", name: "LadyGigglemuffin", score: 1600 });

            scoresList.sort((a, b) => a.score > b.score ? 1 : -1);
            setScores(scoresList.reverse().slice(0, 100));

            setScoresLoading(false);
        }, (error) => {
            console.error("Error fetching scores:", error);
            // If offline and no initial data, scores will be empty/null, and loading false
            setScoresLoading(false);
        });

    }, [uid]);

    // Events Listener
    useEffect(() => {
        if (!uid) return;
        // Use RTDB Query: Order by "at" and limit to the top 10
        const eventsQuery = query(ref(db, 'events'), orderByChild('at'), limitToLast(10));

        // onValue loads once and then updates in real-time
        return onValue(eventsQuery, (snapshot) => {
            const eventList = [];
            snapshot.forEach((childSnapshot) => {
                eventList.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Add some seeded events for demo/offline use
            // eventList.push({ id: 'e1', player: '1b2c', name: 'SirSnortsalot', country: 'US', at: 1763800000000, msg: '+100' });
            // eventList.push({ id: 'e2', player: '4d5e', name: 'DukeQuackenstein', country: 'GB', at: 1763900000000, msg: '+200' });
            // eventList.push({ id: 'e3', player: '7f8g', name: 'ProfessorNoodlepants', country: 'CA', at: 1764000000000, msg: '+400' });
            // eventList.push({ id: 'e4', player: '9h0i', name: 'BaronvonBubblewrap', country: 'DE', at: 1764100000000, msg: '+800' });
            // eventList.push({ id: 'e5', player: 'abc1', name: 'LadyGigglemuffin', country: 'FR', at: 1764200000000, msg: '+1600' });

            // Sort by timestamp (oldest -> newest) then reverse so newest appear first
            eventList.sort((a, b) => (a.at || 0) > (b.at || 0) ? 1 : -1);
            console.log("eventList", eventList);
            setEvents(eventList.reverse().slice(0, 10));
        }, (error) => {
            console.error("Error fetching events:", error);
        });

    }, [uid]);

    const value = {
        submitScore, //(playerName, score)
        events,
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