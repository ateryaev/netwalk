import { useCallback, useEffect, useState } from "react";

export const usePageHistory = () => {
    const [currentPage, setCurrentPage] = useState(window.history.state?.page ? window.history.state.page : location.pathname);
    const [currentData, setCurrentData] = useState(window.history.state?.data ? window.history.state.data : null);

    useEffect(() => {
        const handlePopState = (event: any) => {
            const newPage = (event.state && event.state.page) ? event.state.page : "/";
            const newData = (event.state && event.state.data) ? event.state.data : null;
            console.log("usePageHistory.handlePopState", newPage, newData)
            setCurrentPage(newPage); // Update internal hook state
            setCurrentData(newData);
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        const main = document.title.split("/")[0];
        if (!currentPage || currentPage === "/") {
            document.title = main;
            return;
        }
        const newTitle = main + currentPage;
        document.title = newTitle;
    }, [currentPage]);

    const pushPage = useCallback((pageName: string, data: any) => {
        console.log("usePageHistory.pushPage", pageName, data)
        window.history.pushState({ page: pageName }, "");
        setCurrentPage(pageName);
        setCurrentData(data);
    }, []);

    const replacePage = useCallback((pageName: string, data: any) => {
        console.log("usePageHistory.replacePage", pageName, data)
        window.history.replaceState({ page: pageName, data: data }, "");
        setCurrentPage(pageName);
        setCurrentData(data);
    }, []);

    const goBack = useCallback((delta = 1) => {
        window.history.go(-delta);
    }, []);


    return { currentPage, currentData, pushPage, replacePage, goBack };
};