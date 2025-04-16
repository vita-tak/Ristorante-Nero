import '../styles/Home.css';
import { Nav } from '../components/Home/Nav';
import { Hero } from '../components/Home/Hero';
import { MenuTeaser } from '../components/Home/MenuTeaser';

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <MenuTeaser />
    </>
  );
}
