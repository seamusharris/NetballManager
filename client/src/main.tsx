import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from "./App";
import "./index.css";
import Teams from './pages/Teams';
import TeamPlayers from './pages/TeamPlayers';
import Players from './pages/Players';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/teams/:teamId/players" component={TeamPlayers} />
        <Route path="/teams/:teamId" component={Teams} />
        <Route path="/teams" component={Teams} />
        <Route path="/players" component={Players} />
      </Switch>
    </Router>
  );
}

export default App;

function TeamPlayers() {
  return (
    <div>
      <h1>Team Players</h1>
      <p>List of players for the selected team.</p>
    </div>
  );
}

export default TeamPlayers;

function Teams() {
  return (
    <div>
      <h1>Teams</h1>
      <p>List of teams.</p>
    </div>
  );
}

export default Teams;

function Players() {
  return (
    <div>
      <h1>Players</h1>
      <p>List of all players.</p>
    </div>
  );
}

export default Players;

createRoot(document.getElementById("root")!).render(<App />);