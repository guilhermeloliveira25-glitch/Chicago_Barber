import type { NextConfig } from "next";

// Libera as fotos do Storage do Supabase no componente <Image>
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Se você usa o site pelo IP da rede no modo dev, mantenha aqui a sua linha:
  // allowedDevOrigins: ["10.84.61.209"],

  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
