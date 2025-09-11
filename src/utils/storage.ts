export function loadFromLocalStorage(key: string, defaultValue: any): any {
    let val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
}

export function saveToLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

