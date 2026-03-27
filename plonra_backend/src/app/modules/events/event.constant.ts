// events constant
export const eventSearchedFields = ["title", "description"];
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
