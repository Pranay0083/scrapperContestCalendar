const parseDateTime = (event) => {
    if (event.date.toLowerCase() === "live now") {
        return 0;
    }
    const date = new Date(event.date + " " + event.time);
    return date.getTime();
};

export const sortEvents = (events) => {
    return events.sort((a, b) => {
        const dateA = parseDateTime(a);
        const dateB = parseDateTime(b);
        return dateA - dateB;
    });
};

// This exports `sortEvents` using ES module syntax
