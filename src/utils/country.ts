export const DEFAULT_COUNTRY = "XX";

let country = DEFAULT_COUNTRY;

export async function fetchCountry() {

    if (country === DEFAULT_COUNTRY) {
        try {
            const API_URL = 'https://ipinfo.io/json';
            //const API_URL = 'https://ip-api.com/json/';
            const response = await fetch(API_URL);
            const data = await response.json();

            //country/region
            //countryCode/regionName
            country = data.countryCode || data.country || DEFAULT_COUNTRY;
            //setUserCountry(countryCode);
            //return countryCode;
        } catch (error) {
            console.warn("Failed to detect country. Using default.");
            return DEFAULT_COUNTRY;
        }
    }
    return country;
}