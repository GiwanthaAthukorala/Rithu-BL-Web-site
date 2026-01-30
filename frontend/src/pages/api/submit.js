export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const response = await fetch(
        "https://rithu-bl-web-site.vercel.app/api/submissions",
        {
          method: "POST",
          body: req.body,
          headers: {
            Authorization: req.headers.authorization,
            "Content-Type": req.headers["content-type"],
          },
        },
      );

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
