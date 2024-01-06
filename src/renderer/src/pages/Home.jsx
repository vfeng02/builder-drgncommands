import React from 'react';
import commands from '../db.json';
// import { useState } from "react";
import CommandsList from "../components/CommandsList";
// import Loading from "../components/Loading";
// import Error from "../components/Error";
// import useFetch from "../useFetch";

const Home = () => {
  // const { error, isPending, data: commands } = useFetch('http://localhost:8000/commands');

  return (
    <div className="home">
      {/* { error && <Error errorMessage="Unable to load data" /> }
      { isPending && <Loading />} */}
      { commands && <CommandsList commands={commands} /> }
    </div>
  );
}
 
export default Home;