import { useEffect } from "react";
import axios from "axios";

function App() {
  useEffect(() => {
    axios
      .get("/api")
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);

  return <div>React (Vite) Frontend Connected to Express Backend</div>;
}

export default App;
