
function generateNickname(): string {
    // 1. List of 100 Adjectives
    const adjectives: string[] = [
        "Silent", "Crimson", "Swift", "Blazing", "Arctic", "Cobalt", "Stealthy", "Vivid", "Cosmic", "Iron",
        "Golden", "Silver", "Shadow", "Raging", "Mystic", "Fierce", "Noble", "Wicked", "Dashing", "Grand",
        "Tiny", "Giant", "Electric", "Solar", "Lunar", "Whispering", "Frosty", "Obsidian", "Savage", "Zenith",
        "Ancient", "Future", "Digital", "Pixelated", "Gritty", "Smooth", "Sharp", "Velvet", "Thundering", "Crystal",
        "Emerald", "Azure", "Scarlet", "Glimmering", "Steady", "Reckless", "Wary", "Clever", "Humble", "Proud",
        "Bold", "Wily", "Shifty", "Vast", "Deep", "Shallow", "Burning", "Hidden", "Exiled", "Hallowed",
        "Sacred", "Corrupted", "Unseen", "Fading", "Rising", "Flying", "Wandering", "Eternal", "Brief", "Quaking",
        "Stellar", "Volatile", "Turbo", "Quick", "Slow", "Heavy", "Light", "Zero", "Prime", "Last",
        "First", "Wild", "Tame", "Mechanical", "Organic", "Lethal", "Vital", "Hollow", "Solid", "Roaring",
        "Gentle", "Rough", "Bright", "Dull", "Mad", "Calm", "Frail", "Sturdy", "Weeping", "Joyous"
    ];

    // 2. List of 100 Nouns
    const nouns: string[] = [
        "Phantom", "Ninja", "Phoenix", "Comet", "Sphinx", "Warrior", "Wizard", "Specter", "Viper", "Gryphon",
        "Rocket", "Anchor", "Wanderer", "Stalker", "Pixel", "Dragon", "Hunter", "Maverick", "Sentinel", "Oracle",
        "Blade", "Shield", "Vortex", "Talon", "Spirit", "Ghost", "Forge", "Core", "Gate", "Vault",
        "Glitch", "Byte", "Vector", "Circuit", "Kraken", "Cyclops", "Titan", "Nomad", "Vagrant", "Jester",
        "Monarch", "Rebel", "Zephyr", "Echo", "Stream", "Torrent", "Summit", "Ridge", "Canyon", "Abyss",
        "Rune", "Scepter", "Amulet", "Scroll", "Helm", "Glove", "Mask", "Crown", "Whisper", "Scream",
        "Storm", "Gale", "Current", "Wave", "Tide", "Sand", "Stone", "Relic", "Artifact", "Engine",
        "Mantis", "Hawk", "Cobra", "Puma", "Rhino", "Whale", "Octopus", "Raven", "Crow", "Wren",
        "Trapper", "Scout", "Warden", "Judge", "Marshal", "Agent", "Pilot", "Tuner", "Diver", "Hacker",
        "Cadet", "Rook", "King", "Queen", "Knight", "Bishop", "Pawn", "Shogun", "Ronin", "Samurai"
    ];

    // Helper function remains the same
    const getRandomElement = (arr: string[]): string => {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    };

    const randomAdjective: string = getRandomElement(adjectives);
    const randomNoun: string = getRandomElement(nouns);

    return `${randomAdjective}${randomNoun}`;
}

export function normalizeNickname(name: string | null | undefined): string {
    if (!name || name.trim().length < 6) return generateNickname();
    return name.trim();
}

//console.log(generateNickname()); // Example: "CosmicGryphon"