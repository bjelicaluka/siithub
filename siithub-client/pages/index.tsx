import { HomeView } from "../features/home/home-view";

export default function Home() {
  return <HomeView />;
}

Home.requireAuth = true;
