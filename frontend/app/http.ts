// TODO(jack): this setup is kinda bad cuz every time the function is called it
// tried all URLs, including bad ones, which cause Network Errors to be thrown
// to the console. Idrk how to fix this yet

async function availableRecordings() {
  const hostname = window.location.hostname;
  // TODO: In the future user's should be shown a list of sources and which
  // ones are active, and should be able to switch between them
  const urls: string[] =
    hostname == "localhost"
      ? // prettier-ignore
        [ "https://live-vis.bvngee.com", "http://localhost", "http://localhost:9000" ]
      : ["https://live-vis.bvngee.com", `https://${hostname}`];

  const tryUrl = (): Promise<any> | null => {
    const url = urls.pop();
    if (!url) {
      console.warn("All attempts failed to call to HTTP API!");
      return null;
    }
    console.debug("Trying HTTP API URL: ", url);
    return fetch(`${url}/api/available-recordings`)
      .then((resp) => {
        if (!resp.ok) {
          console.debug("fetch(", url, ") failed (ok==false).");
          return tryUrl();
        }
        console.debug("fetch(", url, ") succeeded!")
        return resp.json();
      })
      .catch((e) => {
        console.debug("A network error occured fetching ", url, ": ", e);
        return tryUrl();
      });
  };
  return tryUrl();
}

export default availableRecordings;
