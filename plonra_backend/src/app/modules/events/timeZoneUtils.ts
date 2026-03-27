export const convertDateTime = (date: string) => {
  const offset = new Date(date).getTimezoneOffset() * 60000;
  return new Date(new Date(date).getTime() - offset);
};
