import { useCallback, useEffect, useState } from "react";

export const usePageHistory = () => {
    const [currentPage, setCurrentPage] = useState(window.history.state?.page ? window.history.state.page : location.pathname);
    const [currentData, setCurrentData] = useState(window.history.state?.data ? window.history.state.data : null);

    useEffect(() => {
        const handlePopState = (event: any) => {
            const newPage = (event.state && event.state.page) ? event.state.page : "/";
            const newData = (event.state && event.state.data) ? event.state.data : null;
            setCurrentPage(newPage); // Update internal hook state
            setCurrentData(newData);
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        const main = document.title.split(" ")[0];
        if (!currentPage || currentPage === "/") {
            document.title = main;
            return;
        }
        const newTitle = main + " " + currentPage;
        document.title = newTitle;
    }, [currentPage]);

    const pushPage = useCallback((pageName: string, data: any) => {
        window.history.pushState({ page: pageName, data }, "");
        const event = new PopStateEvent("popstate", { state: { page: pageName, data: data } });
        window.dispatchEvent(event);
    }, []);

    const replacePage = useCallback((pageName: string, data: any) => {
        window.history.replaceState({ page: pageName, data: data }, "");
        const event = new PopStateEvent("popstate", { state: { page: pageName, data: data } });
        window.dispatchEvent(event);
    }, []);

    const goBack = useCallback((delta = 1) => {
        window.history.go(-delta);
    }, []);


    return { currentPage, currentData, pushPage, replacePage, goBack };
};