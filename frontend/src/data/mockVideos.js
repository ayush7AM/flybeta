// ── Mock YouTube Video Data ─────────────────────────────────────────────
// Hardcoded curated videos organized by learning track.
// Will be replaced with real YouTube Data API v3 responses in a future phase.

const MOCK_VIDEOS = [
  // ── Cloud Computing ───────────────────────────────────────────────────
  {
    id: 'M988_VALWT8',
    title: 'Cloud Computing Explained — Full Tutorial for Beginners',
    channelName: 'freeCodeCamp',
    thumbnail: 'https://i.ytimg.com/vi/M988_VALWT8/hqdefault.jpg',
    duration: '3:48:20',
    track: 'Cloud Computing',
    trackSlug: 'cloud',
  },
  {
    id: 'M988_fsOSt0',
    title: 'AWS vs Azure vs GCP — Which One Should You Learn?',
    channelName: 'TechWorld with Nana',
    thumbnail: 'https://i.ytimg.com/vi/M988_fsOSt0/hqdefault.jpg',
    duration: '18:42',
    track: 'Cloud Computing',
    trackSlug: 'cloud',
  },
  {
    id: 'lZazuDMOfBw',
    title: 'Docker Tutorial for Beginners — Full Course',
    channelName: 'TechWorld with Nana',
    thumbnail: 'https://i.ytimg.com/vi/lZazuDMOfBw/hqdefault.jpg',
    duration: '2:46:14',
    track: 'Cloud Computing',
    trackSlug: 'cloud',
  },
  {
    id: 'X48VuDVv0do',
    title: 'Kubernetes Course — Full Beginners Tutorial',
    channelName: 'TechWorld with Nana',
    thumbnail: 'https://i.ytimg.com/vi/X48VuDVv0do/hqdefault.jpg',
    duration: '3:36:52',
    track: 'Cloud Computing',
    trackSlug: 'cloud',
  },

  // ── AI & Machine Learning ─────────────────────────────────────────────
  {
    id: 'aircAruvnKk',
    title: 'Neural Networks Explained — Machine Learning Tutorial',
    channelName: '3Blue1Brown',
    thumbnail: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg',
    duration: '19:13',
    track: 'AI & Machine Learning',
    trackSlug: 'ai',
  },
  {
    id: 'i_LwzRVP7bg',
    title: 'Machine Learning Full Course for Beginners',
    channelName: 'freeCodeCamp',
    thumbnail: 'https://i.ytimg.com/vi/i_LwzRVP7bg/hqdefault.jpg',
    duration: '5:24:18',
    track: 'AI & Machine Learning',
    trackSlug: 'ai',
  },
  {
    id: 'HGOBQPFzWKo',
    title: 'Transformers Explained — Attention Is All You Need',
    channelName: 'StatQuest',
    thumbnail: 'https://i.ytimg.com/vi/HGOBQPFzWKo/hqdefault.jpg',
    duration: '16:57',
    track: 'AI & Machine Learning',
    trackSlug: 'ai',
  },
  {
    id: 'WUvTyaaNkzM',
    title: 'ChatGPT & Large Language Models — How They Work',
    channelName: 'IBM Technology',
    thumbnail: 'https://i.ytimg.com/vi/WUvTyaaNkzM/hqdefault.jpg',
    duration: '10:32',
    track: 'AI & Machine Learning',
    trackSlug: 'ai',
  },

  // ── Data Science ──────────────────────────────────────────────────────
  {
    id: 'KkLfNlEF2mI',
    title: 'Data Science Full Course for Beginners',
    channelName: 'Alex The Analyst',
    thumbnail: 'https://i.ytimg.com/vi/KkLfNlEF2mI/hqdefault.jpg',
    duration: '3:12:45',
    track: 'Data Science',
    trackSlug: 'data',
  },
  {
    id: 'r-uOLxNrNk8',
    title: 'Statistics for Data Science — Full University Course',
    channelName: 'freeCodeCamp',
    thumbnail: 'https://i.ytimg.com/vi/r-uOLxNrNk8/hqdefault.jpg',
    duration: '8:15:05',
    track: 'Data Science',
    trackSlug: 'data',
  },
  {
    id: 'vmEHCJofslg',
    title: 'Pandas Tutorial — Python Data Analysis Library',
    channelName: 'Keith Galli',
    thumbnail: 'https://i.ytimg.com/vi/vmEHCJofslg/hqdefault.jpg',
    duration: '1:00:27',
    track: 'Data Science',
    trackSlug: 'data',
  },
  {
    id: 'Vfo5le26IhY',
    title: 'Python Data Visualization with Matplotlib & Seaborn',
    channelName: 'freeCodeCamp',
    thumbnail: 'https://i.ytimg.com/vi/Vfo5le26IhY/hqdefault.jpg',
    duration: '5:40:29',
    track: 'Data Science',
    trackSlug: 'data',
  },
];

// Group videos by track for the ChannelFeed
export const TRACKS = [
  { name: 'Cloud Computing', slug: 'cloud',  color: 'var(--color-cobalt)' },
  { name: 'AI & Machine Learning', slug: 'ai', color: 'var(--color-violet)' },
  { name: 'Data Science', slug: 'data', color: 'var(--color-emerald)' },
];

export const getVideosByTrack = (trackSlug) =>
  MOCK_VIDEOS.filter((v) => v.trackSlug === trackSlug);

export const getVideoById = (id) =>
  MOCK_VIDEOS.find((v) => v.id === id);

export default MOCK_VIDEOS;
