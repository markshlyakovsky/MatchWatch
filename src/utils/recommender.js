/**
 * recommender.js
 * Curated offline cinematic database (50 titles) and client-side scoring engine.
 */

export const OFFLINE_CATALOG = [
  {
    id: 101,
    title: "Inception",
    type: "movie",
    year: 2010,
    runtime: "148m",
    rating: 8.8,
    genres: ["Sci-Fi", "Action", "Thriller"],
    synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    vibes: { mindBending: 10, spineChilling: 4, actionPacked: 8, deepThoughtful: 7, laughOutLoud: 1, heartWarming: 3 },
    streamingProviders: ["Netflix", "Max"],
    trailerUrl: "YoHD9XEInc0",
    backdrop: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg"
  },
  {
    id: 102,
    title: "Interstellar",
    type: "movie",
    year: 2014,
    runtime: "169m",
    rating: 8.7,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    synopsis: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival in a dying world.",
    vibes: { mindBending: 9, spineChilling: 3, actionPacked: 6, deepThoughtful: 10, laughOutLoud: 1, heartWarming: 8 },
    streamingProviders: ["Prime", "Paramount+"],
    trailerUrl: "zSWdZAibgB4",
    backdrop: "https://image.tmdb.org/t/p/w1280/2ssWTSVklAEc98frZUQhgtGHx7s.jpg"
  },
  {
    id: 103,
    title: "Breaking Bad",
    type: "tv",
    year: 2008,
    runtime: "5 seasons",
    rating: 9.5,
    genres: ["Crime", "Drama", "Thriller"],
    synopsis: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.",
    vibes: { mindBending: 6, spineChilling: 8, actionPacked: 7, deepThoughtful: 9, laughOutLoud: 4, heartWarming: 2 },
    streamingProviders: ["Netflix"],
    trailerUrl: "HhesaQXLuRY",
    backdrop: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg"
  },
  {
    id: 104,
    title: "Stranger Things",
    type: "tv",
    year: 2016,
    runtime: "4 seasons",
    rating: 8.7,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    synopsis: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    vibes: { mindBending: 7, spineChilling: 7, actionPacked: 6, deepThoughtful: 5, laughOutLoud: 5, heartWarming: 9 },
    streamingProviders: ["Netflix"],
    trailerUrl: "b9EkMc79ZSU",
    backdrop: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg"
  },
  {
    id: 105,
    title: "Severance",
    type: "tv",
    year: 2022,
    runtime: "1 season",
    rating: 8.7,
    genres: ["Sci-Fi", "Thriller", "Mystery"],
    synopsis: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.",
    vibes: { mindBending: 10, spineChilling: 6, actionPacked: 3, deepThoughtful: 9, laughOutLoud: 3, heartWarming: 4 },
    streamingProviders: ["Apple TV+"],
    trailerUrl: "xKTgPRHkwhc",
    backdrop: "https://image.tmdb.org/t/p/w1280/ixgFmf1X59PUZam2qbAfskx2gQr.jpg"
  },
  {
    id: 106,
    title: "Knives Out",
    type: "movie",
    year: 2019,
    runtime: "130m",
    rating: 7.9,
    genres: ["Comedy", "Mystery", "Crime"],
    synopsis: "A detective investigates the death of the patriarch of an eccentric, combative family in this clever modern whodunnit.",
    vibes: { mindBending: 6, spineChilling: 2, actionPacked: 4, deepThoughtful: 4, laughOutLoud: 8, heartWarming: 6 },
    streamingProviders: ["Prime", "Netflix"],
    trailerUrl: "qGqiHJTsRkQ",
    backdrop: "https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg"
  },
  {
    id: 107,
    title: "Everything Everywhere All at Once",
    type: "movie",
    year: 2022,
    runtime: "139m",
    rating: 8.7,
    genres: ["Sci-Fi", "Action", "Comedy", "Drama"],
    synopsis: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes.",
    vibes: { mindBending: 10, spineChilling: 3, actionPacked: 9, deepThoughtful: 8, laughOutLoud: 9, heartWarming: 9 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "wxN1T1uxQ2g",
    backdrop: "https://image.tmdb.org/t/p/w1280/ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg"
  },
  {
    id: 108,
    title: "Parasite",
    type: "movie",
    year: 2019,
    runtime: "132m",
    rating: 8.6,
    genres: ["Drama", "Thriller", "Dark Comedy"],
    synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    vibes: { mindBending: 8, spineChilling: 7, actionPacked: 5, deepThoughtful: 9, laughOutLoud: 6, heartWarming: 2 },
    streamingProviders: ["Max", "Hulu"],
    trailerUrl: "5xH0HfJHsaY",
    backdrop: "https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg"
  },
  {
    id: 109,
    title: "The Dark Knight",
    type: "movie",
    year: 2008,
    runtime: "152m",
    rating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    vibes: { mindBending: 7, spineChilling: 6, actionPacked: 10, deepThoughtful: 7, laughOutLoud: 1, heartWarming: 3 },
    streamingProviders: ["Max", "Apple TV+"],
    trailerUrl: "EXeTwQWrcwY",
    backdrop: "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg"
  },
  {
    id: 110,
    title: "Dune",
    type: "movie",
    year: 2021,
    runtime: "155m",
    rating: 8.0,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    synopsis: "A noble family becomes embroiled in a war for control of the galaxy's most valuable asset, while its heir is haunted by visions of a dark future.",
    vibes: { mindBending: 8, spineChilling: 4, actionPacked: 8, deepThoughtful: 8, laughOutLoud: 1, heartWarming: 4 },
    streamingProviders: ["Max", "Prime"],
    trailerUrl: "8g18jFHCLXk",
    backdrop: "https://image.tmdb.org/t/p/w1280/zRKQW58MBEY078AxkHxEJzUskCl.jpg"
  },
  {
    id: 111,
    title: "Ted Lasso",
    type: "tv",
    year: 2020,
    runtime: "3 seasons",
    rating: 8.8,
    genres: ["Comedy", "Drama", "Sports"],
    synopsis: "An American football coach is hired to manage a British soccer team. What he lacks in knowledge, he makes up for with optimism and biscuits.",
    vibes: { mindBending: 1, spineChilling: 1, actionPacked: 2, deepThoughtful: 6, laughOutLoud: 9, heartWarming: 10 },
    streamingProviders: ["Apple TV+"],
    trailerUrl: "3u7EIiohs6U",
    backdrop: "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg"
  },
  {
    id: 112,
    title: "The White Lotus",
    type: "tv",
    year: 2021,
    runtime: "2 seasons",
    rating: 8.0,
    genres: ["Comedy", "Drama", "Mystery"],
    synopsis: "A sharp social satire following the exploits of various employees and guests at an exclusive Hawaiian resort over the span of one highly eventful week.",
    vibes: { mindBending: 4, spineChilling: 4, actionPacked: 2, deepThoughtful: 8, laughOutLoud: 8, heartWarming: 4 },
    streamingProviders: ["Max"],
    trailerUrl: "TGLq7_DewZ8",
    backdrop: "https://image.tmdb.org/t/p/w1280/rCTLaPwuApDx8vLGjYZ9pRl7zRB.jpg"
  },
  {
    id: 113,
    title: "The Matrix",
    type: "movie",
    year: 1999,
    runtime: "136m",
    rating: 8.7,
    genres: ["Sci-Fi", "Action"],
    synopsis: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    vibes: { mindBending: 10, spineChilling: 5, actionPacked: 9, deepThoughtful: 8, laughOutLoud: 2, heartWarming: 3 },
    streamingProviders: ["Max", "Prime"],
    trailerUrl: "m8e-FF8MsqU",
    backdrop: "https://image.tmdb.org/t/p/w1280/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg"
  },
  {
    id: 114,
    title: "Black Mirror",
    type: "tv",
    year: 2011,
    runtime: "6 seasons",
    rating: 8.7,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    synopsis: "An anthology series exploring a twisted, high-tech near-future where humanity's greatest innovations and darkest instincts collide.",
    vibes: { mindBending: 10, spineChilling: 8, actionPacked: 4, deepThoughtful: 10, laughOutLoud: 3, heartWarming: 2 },
    streamingProviders: ["Netflix"],
    trailerUrl: "V0XOApF5nLU",
    backdrop: "https://image.tmdb.org/t/p/w1280/dg3OindVAGZBjlT3xYKqIAdukPL.jpg"
  },
  {
    id: 115,
    title: "Spirited Away",
    type: "movie",
    year: 2001,
    runtime: "125m",
    rating: 8.6,
    genres: ["Animation", "Fantasy", "Family"],
    synopsis: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    vibes: { mindBending: 8, spineChilling: 4, actionPacked: 4, deepThoughtful: 7, laughOutLoud: 4, heartWarming: 10 },
    streamingProviders: ["Max"],
    trailerUrl: "ByXuk9QqQkk",
    backdrop: "https://image.tmdb.org/t/p/w1280/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg"
  },
  {
    id: 116,
    title: "Whiplash",
    type: "movie",
    year: 2014,
    runtime: "106m",
    rating: 8.5,
    genres: ["Drama", "Music"],
    synopsis: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    vibes: { mindBending: 5, spineChilling: 7, actionPacked: 7, deepThoughtful: 8, laughOutLoud: 2, heartWarming: 4 },
    streamingProviders: ["Netflix", "Apple TV+"],
    trailerUrl: "7d_jQyG8Y_E",
    backdrop: "https://image.tmdb.org/t/p/w1280/wbQa0EnWUyRzQ5d1pHLNRlmsCUP.jpg"
  },
  {
    id: 117,
    title: "The Silence of the Lambs",
    type: "movie",
    year: 1991,
    runtime: "118m",
    rating: 8.6,
    genres: ["Thriller", "Crime", "Horror"],
    synopsis: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.",
    vibes: { mindBending: 7, spineChilling: 10, actionPacked: 5, deepThoughtful: 7, laughOutLoud: 1, heartWarming: 1 },
    streamingProviders: ["Prime", "Max"],
    trailerUrl: "W6Mm8Sbe__o",
    backdrop: "https://image.tmdb.org/t/p/w1280/aYcnDyLMnpKce1FOYUpZrXtgUye.jpg"
  },
  {
    id: 118,
    title: "Succession",
    type: "tv",
    year: 2018,
    runtime: "4 seasons",
    rating: 8.9,
    genres: ["Drama", "Dark Comedy"],
    synopsis: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down.",
    vibes: { mindBending: 5, spineChilling: 5, actionPacked: 3, deepThoughtful: 8, laughOutLoud: 7, heartWarming: 3 },
    streamingProviders: ["Max"],
    trailerUrl: "OzYxJV_7Izo",
    backdrop: "https://image.tmdb.org/t/p/w1280/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg"
  },
  {
    id: 119,
    title: "Zootopia",
    type: "movie",
    year: 2016,
    runtime: "108m",
    rating: 8.0,
    genres: ["Animation", "Comedy", "Family"],
    synopsis: "In a city of anthropomorphic animals, a rookie bunny cop and a cynical con artist fox must work together to uncover a conspiracy.",
    vibes: { mindBending: 4, spineChilling: 2, actionPacked: 6, deepThoughtful: 5, laughOutLoud: 8, heartWarming: 9 },
    streamingProviders: ["Disney+"],
    trailerUrl: "jWM0ct-OLsM",
    backdrop: "https://image.tmdb.org/t/p/w1280/9tOkjBEiiGcaClgJFtwocStZvIT.jpg"
  },
  {
    id: 120,
    title: "Get Out",
    type: "movie",
    year: 2017,
    runtime: "104m",
    rating: 7.8,
    genres: ["Horror", "Mystery", "Thriller"],
    synopsis: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception eventually reaches a boiling point.",
    vibes: { mindBending: 8, spineChilling: 9, actionPacked: 5, deepThoughtful: 8, laughOutLoud: 3, heartWarming: 2 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "sRfnec9zII8",
    backdrop: "https://image.tmdb.org/t/p/w1280/o8dPH0ZSIyyViP6rjRX1djwCUwI.jpg"
  },
  {
    id: 121,
    title: "The Grand Budapest Hotel",
    type: "movie",
    year: 2014,
    runtime: "99m",
    rating: 8.1,
    genres: ["Comedy", "Drama", "Adventure"],
    synopsis: "A writer relates his adventures at a renowned European resort hotel between the first and second World Wars with a concierge who is wrongly framed for murder.",
    vibes: { mindBending: 5, spineChilling: 2, actionPacked: 5, deepThoughtful: 6, laughOutLoud: 8, heartWarming: 8 },
    streamingProviders: ["Disney+", "Hulu"],
    trailerUrl: "1Fg5iWmQjwk",
    backdrop: "https://image.tmdb.org/t/p/w1280/9udCLTxTFl28RxnK8Q05E154ZGa.jpg"
  },
  {
    id: 122,
    title: "Chernobyl",
    type: "tv",
    year: 2019,
    runtime: "1 season",
    rating: 9.4,
    genres: ["Drama", "History", "Thriller"],
    synopsis: "In April 1986, an explosion at the Chernobyl nuclear power plant in the Union of Soviet Socialist Republics becomes one of the world's worst man-made catastrophes.",
    vibes: { mindBending: 4, spineChilling: 10, actionPacked: 4, deepThoughtful: 10, laughOutLoud: 0, heartWarming: 3 },
    streamingProviders: ["Max"],
    trailerUrl: "s9APLXM9Ei8",
    backdrop: "https://image.tmdb.org/t/p/w1280/3URK0z9PzpVNJrGE7XOuyy6KFzk.jpg"
  },
  {
    id: 123,
    title: "Spider-Man: Into the Spider-Verse",
    type: "movie",
    year: 2018,
    runtime: "117m",
    rating: 8.4,
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    synopsis: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    vibes: { mindBending: 8, spineChilling: 3, actionPacked: 10, deepThoughtful: 6, laughOutLoud: 8, heartWarming: 9 },
    streamingProviders: ["Disney+", "Hulu"],
    trailerUrl: "tg52up16eq0",
    backdrop: "https://image.tmdb.org/t/p/w1280/8mnXR9rey5uQ08rZAvzojKWbDQS.jpg"
  },
  {
    id: 124,
    title: "The Good Place",
    type: "tv",
    year: 2016,
    runtime: "4 seasons",
    rating: 8.2,
    genres: ["Comedy", "Fantasy", "Drama"],
    synopsis: "Four people and their otherworldly savior struggle in the afterlife to define what it means to be good, while living in a seemingly perfect heaven.",
    vibes: { mindBending: 8, spineChilling: 2, actionPacked: 2, deepThoughtful: 8, laughOutLoud: 9, heartWarming: 9 },
    streamingProviders: ["Netflix"],
    trailerUrl: "RfBgT5yVy50",
    backdrop: "https://image.tmdb.org/t/p/w1280/tZmlWeFEMvxrjJhBJJcLNXpSRiG.jpg"
  },
  {
    id: 125,
    title: "Fight Club",
    type: "movie",
    year: 1999,
    runtime: "139m",
    rating: 8.8,
    genres: ["Drama", "Thriller"],
    synopsis: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    vibes: { mindBending: 10, spineChilling: 6, actionPacked: 7, deepThoughtful: 9, laughOutLoud: 4, heartWarming: 2 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "qtRKdVHc-cE",
    backdrop: "https://image.tmdb.org/t/p/w1280/xRyINp9KfMLVjRiO5nCsoRDdvvF.jpg"
  },
  {
    id: 126,
    title: "Pulp Fiction",
    type: "movie",
    year: 1994,
    runtime: "154m",
    rating: 8.9,
    genres: ["Crime", "Drama"],
    synopsis: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    vibes: { mindBending: 7, spineChilling: 5, actionPacked: 7, deepThoughtful: 6, laughOutLoud: 8, heartWarming: 2 },
    streamingProviders: ["Max", "Hulu"],
    trailerUrl: "s7EdQ4FqbhY",
    backdrop: "https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg"
  },
  {
    id: 127,
    title: "The Queen's Gambit",
    type: "tv",
    year: 2020,
    runtime: "1 season",
    rating: 8.6,
    genres: ["Drama", "History"],
    synopsis: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.",
    vibes: { mindBending: 6, spineChilling: 3, actionPacked: 3, deepThoughtful: 8, laughOutLoud: 2, heartWarming: 7 },
    streamingProviders: ["Netflix"],
    trailerUrl: "CDrieqwSdgI",
    backdrop: "https://image.tmdb.org/t/p/w1280/34OGjFEbHj0E3lE2w0iTUVq0CBz.jpg"
  },
  {
    id: 128,
    title: "Fleabag",
    type: "tv",
    year: 2016,
    runtime: "2 seasons",
    rating: 8.7,
    genres: ["Comedy", "Drama"],
    synopsis: "A dry-witted woman, known only as Fleabag, navigates life and love in London while trying to cope with tragedy.",
    vibes: { mindBending: 3, spineChilling: 1, actionPacked: 1, deepThoughtful: 8, laughOutLoud: 10, heartWarming: 6 },
    streamingProviders: ["Prime"],
    trailerUrl: "I5Uv6cb9YQE",
    backdrop: "https://image.tmdb.org/t/p/w1280/hXdQ4MWsEOX6qg6VydKrLb3YJ4g.jpg"
  },
  {
    id: 129,
    title: "Black Panther",
    type: "movie",
    year: 2018,
    runtime: "134m",
    rating: 7.3,
    genres: ["Action", "Adventure", "Sci-Fi"],
    synopsis: "T'Challa, heir to the hidden and advanced kingdom of Wakanda, must step forward to lead his people into a new future and confront a challenger from his country's past.",
    vibes: { mindBending: 4, spineChilling: 3, actionPacked: 10, deepThoughtful: 7, laughOutLoud: 4, heartWarming: 7 },
    streamingProviders: ["Disney+"],
    trailerUrl: "xjDjIWPwcPU",
    backdrop: "https://image.tmdb.org/t/p/w1280/19Ed4XgjahPm4U8JT7SnntERIlt.jpg"
  },
  {
    id: 130,
    title: "The Truman Show",
    type: "movie",
    year: 1998,
    runtime: "103m",
    rating: 8.2,
    genres: ["Drama", "Comedy", "Sci-Fi"],
    synopsis: "An insurance salesman discovers his whole life is actually a reality TV show watched by billions of people around the globe.",
    vibes: { mindBending: 9, spineChilling: 3, actionPacked: 3, deepThoughtful: 9, laughOutLoud: 7, heartWarming: 8 },
    streamingProviders: ["Paramount+", "Prime"],
    trailerUrl: "dlnmQbPGuls",
    backdrop: "https://image.tmdb.org/t/p/w1280/aCHn2TXYJfzPXQKA6r9mKPbMlUB.jpg"
  },
  {
    id: 131,
    title: "Inside Out",
    type: "movie",
    year: 2015,
    runtime: "95m",
    rating: 8.1,
    genres: ["Animation", "Comedy", "Family", "Drama"],
    synopsis: "After a young girl is uprooted from her Midwestern life and moved to San Francisco, her emotions - Joy, Fear, Anger, Disgust and Sadness - conflict on how best to navigate a new city, house and school.",
    vibes: { mindBending: 7, spineChilling: 2, actionPacked: 4, deepThoughtful: 8, laughOutLoud: 8, heartWarming: 10 },
    streamingProviders: ["Disney+"],
    trailerUrl: "yRUAzGQ3nSY",
    backdrop: "https://image.tmdb.org/t/p/w1280/o3i6AfTcWAuNvzAUV3q5lOmi6Gx.jpg"
  },
  {
    id: 132,
    title: "The Shawshank Redemption",
    type: "movie",
    year: 1994,
    runtime: "142m",
    rating: 9.3,
    genres: ["Drama"],
    synopsis: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    vibes: { mindBending: 4, spineChilling: 4, actionPacked: 3, deepThoughtful: 8, laughOutLoud: 3, heartWarming: 10 },
    streamingProviders: ["Max", "Prime"],
    trailerUrl: "PLl99DlL6b4",
    backdrop: "https://image.tmdb.org/t/p/w1280/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg"
  },
  {
    id: 133,
    title: "Breaking Bad: El Camino",
    type: "movie",
    year: 2019,
    runtime: "122m",
    rating: 7.3,
    genres: ["Action", "Crime", "Drama"],
    synopsis: "In the wake of his dramatic escape from captivity, Jesse Pinkman must come to terms with his past in order to design some kind of future.",
    vibes: { mindBending: 5, spineChilling: 6, actionPacked: 7, deepThoughtful: 7, laughOutLoud: 2, heartWarming: 4 },
    streamingProviders: ["Netflix"],
    trailerUrl: "1JKL30AObU4",
    backdrop: "https://image.tmdb.org/t/p/w1280/uLXK1LQM28XovWHPao3ViTeggXA.jpg"
  },
  {
    id: 134,
    title: "Avatar: The Last Airbender",
    type: "tv",
    year: 2005,
    runtime: "3 seasons",
    rating: 9.3,
    genres: ["Animation", "Action", "Adventure", "Fantasy"],
    synopsis: "In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar, and bring peace to the world.",
    vibes: { mindBending: 6, spineChilling: 4, actionPacked: 9, deepThoughtful: 8, laughOutLoud: 7, heartWarming: 10 },
    streamingProviders: ["Netflix", "Paramount+"],
    trailerUrl: "Rz7Es54jKNo",
    backdrop: "https://image.tmdb.org/t/p/w1280/7oBGhqJIghRBvOwo5Qe0yM0cnMc.jpg"
  },
  {
    id: 135,
    title: "Arrival",
    type: "movie",
    year: 2016,
    runtime: "116m",
    rating: 7.9,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    synopsis: "A linguist works with the military to communicate with alien-creatures that have appeared on Earth, discovering a mind-bending perception of time.",
    vibes: { mindBending: 10, spineChilling: 4, actionPacked: 3, deepThoughtful: 10, laughOutLoud: 1, heartWarming: 7 },
    streamingProviders: ["Paramount+", "Prime"],
    trailerUrl: "AMgy7Sg1UtM",
    backdrop: "https://image.tmdb.org/t/p/w1280/uKPbFF08QkRMvIAsgCh1soeyPhZ.jpg"
  },
  {
    id: 136,
    title: "Knives Out: Glass Onion",
    type: "movie",
    year: 2022,
    runtime: "139m",
    rating: 7.1,
    genres: ["Comedy", "Mystery", "Crime"],
    synopsis: "Famed Southern detective Benoit Blanc travels to Greece for his latest case, peeling back the layers of a mystery involving a tech billionaire.",
    vibes: { mindBending: 7, spineChilling: 2, actionPacked: 4, deepThoughtful: 4, laughOutLoud: 9, heartWarming: 5 },
    streamingProviders: ["Netflix"],
    trailerUrl: "gj5ibYSz8C0",
    backdrop: "https://image.tmdb.org/t/p/w1280/dKqa850uvbNSCaQCV4Im1XlzEtQ.jpg"
  },
  {
    id: 137,
    title: "Dune: Part Two",
    type: "movie",
    year: 2024,
    runtime: "166m",
    rating: 8.9,
    genres: ["Sci-Fi", "Action", "Adventure"],
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.",
    vibes: { mindBending: 8, spineChilling: 6, actionPacked: 10, deepThoughtful: 8, laughOutLoud: 1, heartWarming: 4 },
    streamingProviders: ["Max"],
    trailerUrl: "Way9Dexny3w",
    backdrop: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"
  },
  {
    id: 138,
    title: "Eternal Sunshine of the Spotless Mind",
    type: "movie",
    year: 2004,
    runtime: "108m",
    rating: 8.3,
    genres: ["Sci-Fi", "Drama", "Romance"],
    synopsis: "When their relationship turns sour, a young couple undergoes a medical procedure to have each other erased from their memories.",
    vibes: { mindBending: 9, spineChilling: 3, actionPacked: 2, deepThoughtful: 9, laughOutLoud: 5, heartWarming: 8 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "yE-f1alkq9I",
    backdrop: "https://image.tmdb.org/t/p/w1280/W1ffLQGHoxfAOq0ZYdPtJlvAdb.jpg"
  },
  {
    id: 139,
    title: "Rick and Morty",
    type: "tv",
    year: 2013,
    runtime: "7 seasons",
    rating: 9.1,
    genres: ["Animation", "Sci-Fi", "Comedy"],
    synopsis: "An animated series that follows the exploits of a super scientist and his easily influenced grandson on space-hopping, dimension-tearing adventures.",
    vibes: { mindBending: 9, spineChilling: 3, actionPacked: 7, deepThoughtful: 7, laughOutLoud: 10, heartWarming: 4 },
    streamingProviders: ["Max", "Hulu"],
    trailerUrl: "uR-Vcd5YdF8",
    backdrop: "https://image.tmdb.org/t/p/w1280/Ao5pBFuWY32cVuh6iYjEjZMEscN.jpg"
  },
  {
    id: 140,
    title: "Shutter Island",
    type: "movie",
    year: 2010,
    runtime: "138m",
    rating: 8.2,
    genres: ["Mystery", "Thriller", "Drama"],
    synopsis: "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane on a remote island.",
    vibes: { mindBending: 10, spineChilling: 8, actionPacked: 4, deepThoughtful: 8, laughOutLoud: 1, heartWarming: 1 },
    streamingProviders: ["Paramount+", "Prime"],
    trailerUrl: "5iaYLCip5Qk",
    backdrop: "https://image.tmdb.org/t/p/w1280/rbZvGN1A1QyZuoKzhCw8QPmf2q0.jpg"
  },
  {
    id: 141,
    title: "Parks and Recreation",
    type: "tv",
    year: 2009,
    runtime: "7 seasons",
    rating: 8.6,
    genres: ["Comedy"],
    synopsis: "The absurd antics of an Indiana town's public officials as they pursue sundry projects to make their city a better place.",
    vibes: { mindBending: 1, spineChilling: 0, actionPacked: 1, deepThoughtful: 4, laughOutLoud: 10, heartWarming: 9 },
    streamingProviders: ["Peacock"],
    trailerUrl: "cK2X99X8Kpw",
    backdrop: "https://image.tmdb.org/t/p/w1280/frwl2zBNAl5ZbFDJGoJv0mYo0rF.jpg"
  },
  {
    id: 142,
    title: "Brooklyn Nine-Nine",
    type: "tv",
    year: 2013,
    runtime: "8 seasons",
    rating: 8.4,
    genres: ["Comedy", "Crime"],
    synopsis: "Comedy series following the exploits of Detective Jake Peralta and his diverse, lovable colleagues as they police the NYPD's 99th Precinct.",
    vibes: { mindBending: 1, spineChilling: 1, actionPacked: 4, deepThoughtful: 3, laughOutLoud: 10, heartWarming: 8 },
    streamingProviders: ["Peacock", "Netflix"],
    trailerUrl: "sEOuJ4z5aTc",
    backdrop: "https://image.tmdb.org/t/p/w1280/wyspZaGs7CXceV3Ct7NJhcKNDkn.jpg"
  },
  {
    id: 143,
    title: "Schitt's Creek",
    type: "tv",
    year: 2015,
    runtime: "6 seasons",
    rating: 8.5,
    genres: ["Comedy"],
    synopsis: "When a wealthy family suddenly finds themselves broke, they are forced to rebuild their empire in their only remaining asset: a depressing small town they once bought as a joke.",
    vibes: { mindBending: 1, spineChilling: 0, actionPacked: 1, deepThoughtful: 4, laughOutLoud: 9, heartWarming: 10 },
    streamingProviders: ["Hulu", "Prime"],
    trailerUrl: "W0uMvChsJn4",
    backdrop: "https://image.tmdb.org/t/p/w1280/ftNmVV8LuNVmtB8mzoUTucozVKE.jpg"
  },
  {
    id: 144,
    title: "Paddington 2",
    type: "movie",
    year: 2017,
    runtime: "103m",
    rating: 7.8,
    genres: ["Comedy", "Family", "Adventure"],
    synopsis: "Paddington, now happily settled with the Brown family, picks up a series of odd jobs to buy the perfect present for his Aunt Lucy's 100th birthday, only for the gift to be stolen.",
    vibes: { mindBending: 1, spineChilling: 1, actionPacked: 3, deepThoughtful: 4, laughOutLoud: 8, heartWarming: 10 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "52x5HJ918Dw",
    backdrop: "https://image.tmdb.org/t/p/w1280/kRVUMsXFzhuXjr20JcCGc6TapxA.jpg"
  },
  {
    id: 145,
    title: "Joker",
    type: "movie",
    year: 2019,
    runtime: "122m",
    rating: 8.4,
    genres: ["Drama", "Thriller", "Crime"],
    synopsis: "A mentally troubled stand-up comedian embarks on a downward spiral that leads to the creation of an iconic villain in a grim, decaying Gotham City.",
    vibes: { mindBending: 6, spineChilling: 8, actionPacked: 4, deepThoughtful: 9, laughOutLoud: 1, heartWarming: 1 },
    streamingProviders: ["Max"],
    trailerUrl: "zAGVQLHvwOY",
    backdrop: "https://image.tmdb.org/t/p/w1280/hO7KbdvGOtDdeg0W4Y5nKEHeDDh.jpg"
  },
  {
    id: 146,
    title: "A Quiet Place",
    type: "movie",
    year: 2018,
    runtime: "90m",
    rating: 7.5,
    genres: ["Horror", "Sci-Fi", "Thriller"],
    synopsis: "A family struggles for survival in a world ravaged by blind, sound-hunting alien creatures. To survive, they must live in complete and total silence.",
    vibes: { mindBending: 5, spineChilling: 10, actionPacked: 6, deepThoughtful: 6, laughOutLoud: 1, heartWarming: 7 },
    streamingProviders: ["Paramount+", "Prime"],
    trailerUrl: "WR7cc5t7tvA",
    backdrop: "https://image.tmdb.org/t/p/w1280/nHRUtBwFNnNN70vcQ7lAsjc2T6S.jpg"
  },
  {
    id: 147,
    title: "The Usual Suspects",
    type: "movie",
    year: 1995,
    runtime: "106m",
    rating: 8.5,
    genres: ["Mystery", "Thriller", "Crime"],
    synopsis: "A sole survivor tells of the twisty events leading up to a horrific gun battle on a boat, which began when five criminals met at a seemingly random police lineup.",
    vibes: { mindBending: 10, spineChilling: 5, actionPacked: 5, deepThoughtful: 8, laughOutLoud: 3, heartWarming: 2 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "9MjV47hAckg",
    backdrop: "https://image.tmdb.org/t/p/w1280/hy0Hx9fMPk2fmw26Li60z1S2giU.jpg"
  },
  {
    id: 148,
    title: "Memento",
    type: "movie",
    year: 2000,
    runtime: "113m",
    rating: 8.4,
    genres: ["Mystery", "Thriller", "Sci-Fi"],
    synopsis: "A man with short-term memory loss attempts to track down his wife's killer, using polaroid photos, notes, and body tattoos to piece together his life in reverse chronological order.",
    vibes: { mindBending: 10, spineChilling: 6, actionPacked: 4, deepThoughtful: 9, laughOutLoud: 1, heartWarming: 2 },
    streamingProviders: ["Prime", "Apple TV+"],
    trailerUrl: "4CV41hoySq8",
    backdrop: "https://image.tmdb.org/t/p/w1280/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg"
  },
  {
    id: 149,
    title: "The Lord of the Rings: The Fellowship of the Ring",
    type: "movie",
    year: 2001,
    runtime: "178m",
    rating: 8.8,
    genres: ["Fantasy", "Action", "Adventure"],
    synopsis: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    vibes: { mindBending: 5, spineChilling: 5, actionPacked: 9, deepThoughtful: 8, laughOutLoud: 4, heartWarming: 9 },
    streamingProviders: ["Max", "Prime"],
    trailerUrl: "V75dMMIW2B4",
    backdrop: "https://image.tmdb.org/t/p/w1280/a0lfia8tk8ifkrve0Tn8wkISUvs.jpg"
  },
  {
    id: 150,
    title: "The Office",
    type: "tv",
    year: 2005,
    runtime: "9 seasons",
    rating: 9.0,
    genres: ["Comedy"],
    synopsis: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    vibes: { mindBending: 1, spineChilling: 0, actionPacked: 1, deepThoughtful: 4, laughOutLoud: 10, heartWarming: 8 },
    streamingProviders: ["Peacock"],
    trailerUrl: "gO8N3L_aERg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mLyW3UTgi2lsMdtueYODcfAB9Ku.jpg"
  }
];

/**
 * Calculates similarities between a candidate title and user search filters or anchors.
 */
export function calculateAffinity(candidate, anchors, dnaSelection, preferences = {}) {
  let score = 0;
  let matchesCount = 0;

  // 1. DNA Vibe Match (if user selected DNA vibes)
  if (dnaSelection && Object.keys(dnaSelection).length > 0) {
    let vibeSum = 0;
    let weightSum = 0;
    
    Object.entries(dnaSelection).forEach(([vibeName, weight]) => {
      // weight is 0-10 or boolean. Convert boolean to 10
      const activeWeight = typeof weight === 'boolean' ? (weight ? 10 : 0) : weight;
      if (activeWeight > 0) {
        const candidateValue = candidate.vibes[vibeName] || 0;
        vibeSum += candidateValue * activeWeight;
        weightSum += activeWeight;
      }
    });

    if (weightSum > 0) {
      // Normalized between 0 and 100
      const vibeScore = (vibeSum / (weightSum * 10)) * 100;
      score += vibeScore * 1.5; // Highly weigh DNA selections
      matchesCount++;
    }
  }

  // 2. Anchor Titles Similarity Match (if user chose anchors)
  if (anchors && anchors.length > 0) {
    let anchorScoreSum = 0;
    let anchorMatched = 0;

    anchors.forEach(anchorTitle => {
      // Find anchor in catalog to match exact profile, if available
      const anchorItem = OFFLINE_CATALOG.find(
        c => c.title.toLowerCase() === anchorTitle.toLowerCase()
      );

      if (anchorItem) {
        anchorMatched++;
        // Compare Genres
        const genreOverlap = candidate.genres.filter(g => anchorItem.genres.includes(g)).length;
        const genreScore = anchorItem.genres.length > 0 ? (genreOverlap / anchorItem.genres.length) * 100 : 0;

        // Compare Vibe Vectors (Cosine-like distance)
        let dotProduct = 0;
        let candidateMag = 0;
        let anchorMag = 0;
        
        Object.keys(candidate.vibes).forEach(v => {
          const cVal = candidate.vibes[v];
          const aVal = anchorItem.vibes[v];
          dotProduct += cVal * aVal;
          candidateMag += cVal * cVal;
          anchorMag += aVal * aVal;
        });

        const vibeCosine = (candidateMag > 0 && anchorMag > 0) 
          ? (dotProduct / (Math.sqrt(candidateMag) * Math.sqrt(anchorMag))) * 100 
          : 0;

        anchorScoreSum += (genreScore * 0.4) + (vibeCosine * 0.6);
      } else {
        // Fallback: If anchor title isn't in offline DB, we do basic generic checks or ignore
        // In real TMDB mode, we will fetch recommendations directly from TMDB API!
      }
    });

    if (anchorMatched > 0) {
      score += (anchorScoreSum / anchorMatched) * 1.5;
      matchesCount++;
    }
  }

  // 3. User Preferences Filters
  if (preferences.streamingPlatforms && preferences.streamingPlatforms.length > 0) {
    const hasPlatform = candidate.streamingProviders.some(
      p => preferences.streamingPlatforms.includes(p)
    );
    if (hasPlatform) {
      score += 15; // Platform matching bonus
    }
  }

  // Final Normalization: make sure the absolute score ranges from 50 to 98% for cinematic realism
  let finalPercentage = 50;
  if (matchesCount > 0) {
    finalPercentage = Math.round(Math.min(99, Math.max(52, (score / matchesCount))));
  } else {
    // Default fallback based on high IMDb rating
    finalPercentage = Math.round(55 + (candidate.rating * 4.5));
  }

  // Boost slightly if global rating is high
  finalPercentage += Math.round((candidate.rating - 7.5) * 2);
  finalPercentage = Math.max(48, Math.min(99, finalPercentage));

  return finalPercentage;
}

/**
 * Core matching function. Filters history and structures the 5 Card Archetypes.
 * Now extended to support triageConfig options A, B, and C.
 */
export function getOfflineRecommendations(
  anchors = [], 
  dnaSelection = {}, 
  watchHistory = [], 
  preferences = {},
  triageConfig = { mode: 'any' }
) {
  // Convert list of history items to flat clean titles
  const historyTitles = watchHistory.map(h => typeof h === 'string' ? h.toLowerCase() : h.cleanTitle.toLowerCase());
  
  // 1. FILTER STEP
  let candidates = OFFLINE_CATALOG.filter(c => {
    // Filter out already watched
    if (historyTitles.includes(c.title.toLowerCase())) return false;
    
    // Filter by type (movie/tv) if configured in preferences
    if (preferences.contentType && preferences.contentType.length > 0) {
      if (!preferences.contentType.includes(c.type)) return false;
    }
    
    // Triage Option C Content-Type filter: Movie vs TV Show
    if (triageConfig.mode === 'mood' && triageConfig.contentType && triageConfig.contentType !== 'any') {
      if (c.type !== triageConfig.contentType) return false;
    }

    // Triage Option B Category filters: Must match at least one selected category if split or consolidated
    if (triageConfig.mode === 'category' && triageConfig.genres && triageConfig.genres.length > 0) {
      const matchesAnyCategory = c.genres.some(g => triageConfig.genres.includes(g));
      if (!matchesAnyCategory) return false;
    }
    
    return true;
  });

  // If we filtered out too many, restore from catalog to avoid empty state
  if (candidates.length < 5) {
    candidates = OFFLINE_CATALOG.filter(c => !historyTitles.includes(c.title.toLowerCase()));
    if (candidates.length < 5) candidates = OFFLINE_CATALOG;
  }

  // Helper: Calculates pacing score for candidates and seeds
  // Pacing = (Action-Packed + Spine-Chilling) - Deep & Thoughtful
  const calculatePacing = (item) => {
    return ((item.vibes?.actionPacked || 0) + (item.vibes?.spineChilling || 0)) - (item.vibes?.deepThoughtful || 0);
  };

  // 2. SCORING STEP
  const scoredList = candidates.map(c => {
    let matchPercentage = 50;

    // A. "I'm up for anything" / Default Mode
    if (triageConfig.mode === 'any') {
      matchPercentage = calculateAffinity(c, anchors, dnaSelection, preferences);
    }
    // B. "Specific categories" Mode
    else if (triageConfig.mode === 'category') {
      const selected = triageConfig.genres || [];
      const overlaps = c.genres.filter(g => selected.includes(g)).length;
      
      let genreScore = 0;
      if (selected.length > 0) {
        // If blend is 'all', heavily reward candidates that match multiple selected categories
        if (triageConfig.blend === 'all') {
          genreScore = (overlaps / selected.length) * 100;
        } else {
          // If split or single, simple overlap match
          genreScore = overlaps > 0 ? 80 + (overlaps * 4) : 50;
        }
      }
      
      // Inject standard DNA vibe scores as a minor stabilizer
      const dnaScore = calculateAffinity(c, anchors, dnaSelection, preferences);
      matchPercentage = Math.round((genreScore * 0.8) + (dnaScore * 0.2));
    }
    // C. "I have a mood just not sure what to watch" Mode
    else if (triageConfig.mode === 'mood') {
      const seeds = triageConfig.anchors || [];
      const aspect = triageConfig.aspect || 'content'; // 'content' (story/vibes) or 'type' (genres/pacing)

      let moodScoreSum = 0;
      let seedMatches = 0;

      // Find average pace of seeds
      let seedPaceSum = 0;
      let seedPaceCount = 0;

      seeds.forEach(sTitle => {
        const sItem = OFFLINE_CATALOG.find(x => x.title.toLowerCase() === sTitle.toLowerCase());
        if (sItem) {
          seedPaceSum += calculatePacing(sItem);
          seedPaceCount++;
        }
      });

      const avgSeedPace = seedPaceCount > 0 ? (seedPaceSum / seedPaceCount) : 0;

      seeds.forEach(seedTitle => {
        const seedItem = OFFLINE_CATALOG.find(
          x => x.title.toLowerCase() === seedTitle.toLowerCase()
        );

        if (seedItem) {
          seedMatches++;

          if (aspect === 'content') {
            // Option C.1.3.1 Content Similarity: Plot vibes vector Cosine similarity
            let dotProduct = 0;
            let cMag = 0;
            let sMag = 0;
            
            Object.keys(c.vibes).forEach(v => {
              const cVal = c.vibes[v];
              const sVal = seedItem.vibes[v];
              dotProduct += cVal * sVal;
              cMag += cVal * cVal;
              sMag += sVal * sVal;
            });

            const vibeCosine = (cMag > 0 && sMag > 0)
              ? (dotProduct / (Math.sqrt(cMag) * Math.sqrt(sMag))) * 100
              : 0;
              
            moodScoreSum += vibeCosine;
          } else {
            // Option C.1.3.2 Type Similarity: Category/genre overlap + Pacing closeness
            const genreOverlap = c.genres.filter(g => seedItem.genres.includes(g)).length;
            const genreScore = seedItem.genres.length > 0 ? (genreOverlap / seedItem.genres.length) * 100 : 0;

            // Pacing Closeness: 100 - absolute difference in pace
            const candidatePace = calculatePacing(c);
            const paceDiff = Math.abs(candidatePace - avgSeedPace);
            const paceScore = Math.max(0, 100 - (paceDiff * 8));

            moodScoreSum += (genreScore * 0.5) + (paceScore * 0.5);
          }
        }
      });

      let finalMoodScore = 50;
      if (seedMatches > 0) {
        finalMoodScore = moodScoreSum / seedMatches;
      }

      // Add regional streaming providers boost
      if (preferences.streamingPlatforms && preferences.streamingPlatforms.length > 0) {
        const hasPlatform = c.streamingProviders.some(p => preferences.streamingPlatforms.includes(p));
        if (hasPlatform) finalMoodScore += 10;
      }

      matchPercentage = Math.round(Math.min(99, Math.max(50, finalMoodScore)));
    }

    // Boost based on high overall ratings
    matchPercentage += Math.round((c.rating - 7.5) * 2);
    matchPercentage = Math.max(48, Math.min(99, matchPercentage));

    return { ...c, matchPercentage };
  });

  // Sort candidates descending
  scoredList.sort((a, b) => b.matchPercentage - a.matchPercentage);

  const result = {
    bestPick: scoredList[0] || null,
    archetypes: []
  };

  if (scoredList.length < 2) return result;

  const backupCandidates = scoredList.slice(1);

  // B.2.2 "Just movies from each category" (Display representatives in drawer cards)
  if (triageConfig.mode === 'category' && triageConfig.blend === 'split' && triageConfig.genres && triageConfig.genres.length > 1) {
    const selectedGenres = triageConfig.genres;
    const drawnIds = new Set([result.bestPick.id]);
    const drawerItems = [];

    // For each selected category, find the single best matching candidate not already selected
    selectedGenres.forEach(genre => {
      const match = backupCandidates.find(c => c.genres.includes(genre) && !drawnIds.has(c.id));
      if (match) {
        drawnIds.add(match.id);
        drawerItems.push({
          ...match,
          archetypeName: `Category: ${genre}`,
          archetypeDesc: `The top-scoring choice specifically representing the ${genre} genre.`
        });
      }
    });

    // Fill remaining drawer slots to keep exactly 5 backup cards
    let fillIdx = 0;
    while (drawerItems.length < 5 && fillIdx < backupCandidates.length) {
      const cand = backupCandidates[fillIdx];
      if (!drawnIds.has(cand.id)) {
        drawnIds.add(cand.id);
        drawerItems.push({
          ...cand,
          archetypeName: "Alternative Pick",
          archetypeDesc: "Highly recommended related genre blend choice."
        });
      }
      fillIdx++;
    }

    result.archetypes = drawerItems.slice(0, 5);
    return result;
  }

  // Otherwise: Standard Archetype Card Allocation
  const directLine = backupCandidates[0] ? {
    ...backupCandidates[0],
    archetypeName: "The Direct Line",
    archetypeDesc: "Highly correlated in genre and emotional vibe."
  } : null;

  const gemIndex = backupCandidates.findIndex(c => c.rating >= 8.2 && (c.vibes.mindBending < 9));
  const hiddenGemItem = gemIndex !== -1 ? backupCandidates.splice(gemIndex, 1)[0] : backupCandidates.splice(1, 1)[0];
  const hiddenGem = hiddenGemItem ? {
    ...hiddenGemItem,
    archetypeName: "The Hidden Gem",
    archetypeDesc: "A critically acclaimed masterwork you might have skipped."
  } : null;

  const bestGenres = result.bestPick ? result.bestPick.genres : [];
  const curveIndex = backupCandidates.findIndex(c => c.genres.every(g => !bestGenres.includes(g)));
  const curveballItem = curveIndex !== -1 ? backupCandidates.splice(curveIndex, 1)[0] : backupCandidates.splice(0, 1)[0];
  const leftField = curveballItem ? {
    ...curveballItem,
    archetypeName: "The Left-Field Curveball",
    archetypeDesc: "An unexpected crossover that perfectly aligns with your mood."
  } : null;

  const crowdIndex = backupCandidates.findIndex(c => c.rating >= 8.7);
  const crowdItem = crowdIndex !== -1 ? backupCandidates.splice(crowdIndex, 1)[0] : backupCandidates.splice(0, 1)[0];
  const crowdPleaser = crowdItem ? {
    ...crowdItem,
    archetypeName: "The Crowd-Pleaser",
    archetypeDesc: "Consistently beloved by audiences worldwide."
  } : null;

  const deepIndex = backupCandidates.findIndex(c => c.vibes.deepThoughtful >= 8);
  const deepItem = deepIndex !== -1 ? backupCandidates.splice(deepIndex, 1)[0] : backupCandidates.splice(0, 1)[0];
  const deepCut = deepItem ? {
    ...deepItem,
    archetypeName: "The Deep Cut",
    archetypeDesc: "Intellectually dense, lingering, and beautiful."
  } : null;

  result.archetypes = [directLine, hiddenGem, leftField, crowdPleaser, deepCut].filter(Boolean);

  return result;
}
