export default async function handler(req, res) {
  return res.status(200).json({
    keyExists: !!process.env.OPENROUTER_API_KEY,
    keyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 12) || "NOT FOUND"
  });
}
