import MiniComponent from "./MiniComponent";
import Posts from "./Posts";

export default function Feed() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-3 md:max-w-6xl mx-auto">
      <section className="md:col-span-2">
        <Posts />
      </section>
      <section className="hidden md:inline-grid md:col-span-1">
        <div className="fixed max-w-max">
          <MiniComponent />
        </div>
      </section>
    </main>
  );
}
