import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)", // Apply to all paths
				headers: [
					{
						key: "Access-Control-Allow-Origin",
						value: "*", // Allow all during R&D
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "Origin, X-Requested-With, Content-Type, Accept",
					},
				],
			},
		];
	},
};

export default nextConfig;
