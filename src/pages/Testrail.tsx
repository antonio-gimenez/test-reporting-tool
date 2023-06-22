import axios from "axios";
import React, { useEffect, useState } from "react";

function Testrail() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function get_projects() {
    setLoading(true);
    const credentials = `grupocapgemini-services.antonio.gimenez@hp.com:eo2YXKkXYcxTHNV8O2b.-yCweup3f5ombU4Tx7ete`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-ident": "beta",
      Authorization: "Basic " + btoa(credentials),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      // disable content blocking in firefox
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    };
    const response = await fetch("https://hp-testrail.external.hp.com/index.php?/api/v2/get_projects", {
      method: "GET",
      mode: "no-cors",
      credentials: "include",
      headers: headers,
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
    setResponse(response);
  }
  useEffect(() => {
    get_projects();
  }, []);

  return loading && !response ? (
    <div>Loading...</div>
  ) : error ? (
    <div className="text-rose-500 max-w-7xl mx-auto w-full font-semibold">
      <p>Error message: {error.message}</p>
      <p>Error code: {error.code}</p>
      {/* <p>Error config auth username: {error.config.auth.username}</p>
      <p>Error config auth password: {error.config.auth.password}</p>
      <p>Error config headers: {error.config.headers}</p>
      <p>Error config url: {error.config.url}</p>
      <p>Error config method: {error.config.method}</p> */}
    </div>
  ) : (
    <div>
      <h1>Testrail</h1>
      <p>{JSON.stringify(response)}</p>
    </div>
  );
}

export default Testrail;
