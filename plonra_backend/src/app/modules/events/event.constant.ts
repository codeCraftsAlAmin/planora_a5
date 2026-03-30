// events constant
export const eventSearchedFields = ["title", "organizer.name"];
export const eventFilterableFields = [
  "type",
  "isFeatured",
  "fee",
  "organizerId",
];

export const eventIncludingConfig = {
  organizer: true,
  reviews: true,
  invitations: true,
  eventsRegistrations: true,
};
