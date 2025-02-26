export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to Artemis
        </h1>
        <p className="text-center mb-8">
          Your AI-powered knowledge management system
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            title="Bi-Directional Linking"
            description="Create and visualize connections between your notes"
            icon="🔗"
          />
          <FeatureCard
            title="AI Assistance"
            description="Get help with writing, organizing, and exploring your knowledge"
            icon="🤖"
          />
          <FeatureCard
            title="Structured Data"
            description="Organize your notes with custom properties and views"
            icon="🗃️"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
      <h2 className={`text-2xl font-semibold mb-3`}>
        {icon} {title}
      </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>{description}</p>
    </div>
  );
}
