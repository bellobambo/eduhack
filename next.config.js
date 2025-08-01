const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      "*": ["./test/**/*", "./**/test/**/*"],
    },
  },
};

export default nextConfig;
