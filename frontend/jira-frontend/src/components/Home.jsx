function Home() {
  const login = () => {
    window.location.href = "http://localhost:3000/auth/jira";
  };

  return (
    <div>
      <h1>Jira OAuth Test</h1>

      <button onClick={login}>
        Login with Jira
      </button>
    </div>
  );
}

export default Home;