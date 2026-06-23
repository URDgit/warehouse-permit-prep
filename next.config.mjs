/** @type {import('next').NextConfig} */
const nextConfig = {
  // The engine reads the YAML/JSON files in `data/` from disk at request time.
  // On serverless hosts (e.g. Vercel) those files must be bundled into the
  // function, so trace them in explicitly. (Locally this is a no-op.)
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;
