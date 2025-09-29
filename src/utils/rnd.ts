
export function createRnd(seed: number) {
    return function (max: number) {
        seed |= 0;
        seed = seed + 0x9e3779b9 | 0;
        let t = seed ^ seed >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        const value01 = ((t = t ^ t >>> 15) >>> 0) / 4294967296;
        return Math.min(max, Math.floor(value01 * (max + 1)));
    }
}

// export function getRndFunc(word, level) {
//   //level * (word.charCodeAt(0) + word.charCodeAt(1) + ...)
//   let wordHash = 0;
//   for (let char of word.split("")) {
//     wordHash += char.charCodeAt(0);
//   }
//   wordHash = wordHash * level;
//   return splitmix32(wordHash);
// }
