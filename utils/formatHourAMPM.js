module.exports = (hour24) => {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12; // convert 0 -> 12
    return `${hour12}:00 ${period}`;
};
