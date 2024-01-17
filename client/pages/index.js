import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  console.log("LANDING PAGE!");
  const client = buildClient(context);
  const response = await client.get("/api/users/currentuser").catch((err) => {
    console.log("error", err);
  });

  return response ? { ...response.data } : {};
};

export default LandingPage;
