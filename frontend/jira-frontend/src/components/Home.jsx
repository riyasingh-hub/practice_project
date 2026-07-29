function Home() {
  const login = () => {
    window.location.href = "http://localhost:3000/auth/jira";
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center px-20">
      
      {/* Blue Glow */}
      <div className="absolute left-[-150px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

      {/* Dot Pattern */}
      <div
        className="absolute right-[-100px] top-1/2 -translate-y-1/2 rotate-[-15deg] opacity-60"
        style={{
          width: "700px",
          height: "700px",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 2px, transparent 2px)",
          backgroundSize: "35px 35px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <span className="text-blue-400 text-sm font-semibold tracking-[4px] uppercase">
          Jira Integration
        </span>

        <h1 className="mt-6 text-white font-extrabold leading-none text-7xl">
          Connect your team's
          <br />
          Jira workspace
          <br />
          securely.
        </h1>

        <p className="mt-8 text-gray-400 text-xl leading-8 max-w-2xl">
          Access projects, issues, workflows and integrations
          through OAuth authentication.
        </p>

        <button
          onClick={login}
          className="mt-10 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(38,132,255,0.4)]"
        >
          Continue with Jira →
        </button>
      </div>
    </div>
  );
}

export default Home;