import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const clientActivityData = [
	{ name: "Mon", "0-4": 15, "4-8": 35, "8-12": 55, "12-16": 75, "16-20": 95, "20-24": 25 },
	{ name: "Tue", "0-4": 25, "4-8": 45, "8-12": 65, "12-16": 85, "16-20": 105, "20-24": 35 },
	{ name: "Wed", "0-4": 35, "4-8": 55, "8-12": 75, "12-16": 95, "16-20": 115, "20-24": 45 },
	{ name: "Thu", "0-4": 45, "4-8": 65, "8-12": 85, "12-16": 105, "16-20": 125, "20-24": 55 },
	{ name: "Fri", "0-4": 55, "4-8": 75, "8-12": 95, "12-16": 115, "16-20": 135, "20-24": 65 },
	{ name: "Sat", "0-4": 35, "4-8": 55, "8-12": 75, "12-16": 95, "16-20": 115, "20-24": 45 },
	{ name: "Sun", "0-4": 25, "4-8": 45, "8-12": 65, "12-16": 85, "16-20": 105, "20-24": 35 },
];

const ClientActivityHeatmap = () => {
	return (
		<motion.div
			className="bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className="text-xl font-semibold text-black mb-4">Client Activity Heatmap</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={clientActivityData}>
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
						<Bar dataKey="0-4" stackId="a" fill="#6366F1" />
						<Bar dataKey="4-8" stackId="a" fill="#8B5CF6" />
						<Bar dataKey="8-12" stackId="a" fill="#EC4899" />
						<Bar dataKey="12-16" stackId="a" fill="#10B981" />
						<Bar dataKey="16-20" stackId="a" fill="#F59E0B" />
						<Bar dataKey="20-24" stackId="a" fill="#3B82F6" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default ClientActivityHeatmap;