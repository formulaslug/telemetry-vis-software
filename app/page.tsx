import Image from "next/image";

export default function Home() {
  return (
    <div className="py-20 px-10">
        <main>
          <div className={"w-screen bg-white"}>
              <div className={"bg-slate-800 w-1/2 h-1/2"}>
                  <p>Example Graph</p>
              </div>

          </div>
      </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p>FS Live Visualization Demo</p>
      </footer>
    </div>
  );
}
