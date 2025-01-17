async function getParquet() {
  const hostname = window.location.hostname;
  // TODO: In the future user's should be shown a list of sources and which
  // ones are active, and should be able to switch between them
  const urls: string[] =
    hostname == "localhost"
      ? // prettier-ignore
        [ "https://live-vis.bvngee.com", "http://localhost", "http://localhost:9000" ]
      : ["https://live-vis.bvngee.com", `https://${hostname}`];

  for (const url of urls.reverse()) {
    console.debug("Trying URL: ", url);
    const resp = await fetch(`${url}/api/available-recordings`);
    if (!resp.ok) {
      console.debug("fetch(", url, ") failed (ok==false).");
      continue;
    }
    return resp.json();
  }
}

export default getParquet;
