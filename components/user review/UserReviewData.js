export const userReviews = [
  {
    rating: 5,
    title: "Finally, all my township newspapers in one app!",
    body:
      "I used to follow 3 different Facebook pages to read local news. Now with PressPass, I just open one app. It’s like Netflix, but for real local stories I care about.",
    name: "Thuli",
    location: "Umlazi",
  },
  {
    rating: 5,
    title: "Easy to read, even on my phone.",
    body:
      "The articles load fast, and I love that it’s mobile-friendly. I can read while commuting and catch up on what’s happening around me.",
    name: "Sipho",
    location: "Khayelitsha",
  },
  {
    rating: 5,
    title: "Supporting my community while staying informed.",
    body:
      "It feels good to know my clicks are helping local publishers earn. I’ve discovered so many small community papers I didn’t even know existed!",
    name: "Zanele",
    location: "Tembisa",
  },
  {
    rating: 5,
    title: "Great design, but I wish I could save articles offline.",
    body:
      "The layout is simple and clean. It would be cool to download stories or get notifications by area. Still a must-have app though!",
    name: "Mpho",
    location: "Diepsloot",
  },
];

export default function useUserReviews() {
  return userReviews;
}
