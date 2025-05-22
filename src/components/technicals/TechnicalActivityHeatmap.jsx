import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const technicalActivityData = [
	{ name: "Mon", "0-4": 22, "4-8": 40, "8-12": 75, "12-16": 90, "16-20": 65, "20-24": 15 },
	{ name: "Tue", "0-4": 18, "4-8": 50, "8-12": 85, "12-16": 95, "16-20": 70, "20-24": 20 },
	{ name: "Wed", "0-4": 25, "4-8": 60, "8-12": 90, "12-16": 100, "16-20": 75, "20-24": 25 },
	{ name: "Thu", "0-4": 30, "4-8": 65, "8-12": 95, "12-16": 105, "16-20": 80, "20-24": 30 },
	{ name: "Fri", "0-4": 28, "4-8": 55, "8-12": 85, "12-16": 95, "16-20": 85, "20-24": 35 },
	{ name: "Sat", "0-4": 15, "4-8": 30, "8-12": 45, "12-16": 60, "16-20": 55, "20-24": 25 },
	{ name: "Sun", "0-4": 10, "4-8": 25, "8-12": 40, "12-16": 50, "16-20": 45, "20-24": 20 },
];

const TechnicalActivityHeatmap = () => {
	return (
		<motion.div
			className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className="text-xl font-semibold text-black mb-4">Technical User Activity Heatmap</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={technicalActivityData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="name" stroke="black" />
						<YAxis stroke="black" />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Bar dataKey="0-4" stackId="a" fill="#2563EB" />
						<Bar dataKey="4-8" stackId="a" fill="#7C3AED" />
						<Bar dataKey="8-12" stackId="a" fill="#DB2777" />
						<Bar dataKey="12-16" stackId="a" fill="#059669" />
						<Bar dataKey="16-20" stackId="a" fill="#D97706" />
						<Bar dataKey="20-24" stackId="a" fill="#1D4ED8" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default TechnicalActivityHeatmap;