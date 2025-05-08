
export const random_lastname = () => {
    const lastnames = [
        "Smith",
        "Johnson",
        "WilliamsWilliamsWilliamsWilliams",
        "Jones",
        "BrownBrownBrownBrownBrown",
    ];
    return lastnames[Math.floor(Math.random() * lastnames.length)];
}

export const random_firstname = () => {
    const firstnames = [
        "James",
        "John",
        "Robert",
        "Michael",
        "WilliamWilliamWilliamWilliamWilliamWilliam",
    ];
    return firstnames[Math.floor(Math.random() * firstnames.length)];
}

export const random_tags = () => {
    // Could be multiple
    const tags = [
        "VIP",
        "PMR",
        "5 bagages",
    ];

    const nbTags = Math.floor(Math.random() * tags.length);
    return tags.slice(0, nbTags);
}

export const random_car = () => {
    const cars = [
        "Mercecedes Classe S",
        "Mercecedes Classe E",
        "Mercecedes Classe V",
        "Mercecedes Classe C",
    ]

    return cars[Math.floor(Math.random() * cars.length)];
}