export const getEighteenYearsAgo = (): Date => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
};
