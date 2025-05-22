import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const salesData = [
	{ name: "Jul", sales: 4200 },
	{ name: "Aug", sales: 3800 },
	{ name: "Sep", sales: 5100 },
	{ name: "Oct", sales: 4600 },
	{ name: "Nov", sales: 5400 },
	{ name: "Dec", sales: 7200 },
	{ name: "Jan", sales: 6100 },
	{ name: "Feb", sales: 5900 },
	{ name: "Mar", sales: 6800 },
	{ name: "Apr", sales: 6300 },
	{ name: "May", sales: 7100 },
	{ name: "Jun", sales: 7500 },
];
const arabicMonths = {
	Jan: "يناير",
	Feb: "فبراير",
	Mar: "مارس",
	Apr: "أبريل",
	May: "مايو",
	Jun: "يونيو",
	Jul: "يوليو",
	Aug: "أغسطس",
	Sep: "سبتمبر",
	Oct: "أكتوبر",
	Nov: "نوفمبر",
	Dec: "ديسمبر"
  };
const SalesOverviewChart = () => {
	const { t, i18n } = useTranslation();
  	const isRTL = i18n.language === 'ar';
	return (
		<motion.div
			className='bg-gray-300 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-300'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<h2 className='text-lg font-medium mb-4 text-black'>{t('charts.salesOverview.title')}</h2>

			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<LineChart data={salesData} >
						<CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
						<XAxis dataKey={"name"} stroke='black' reversed={isRTL}/>
						<YAxis stroke='black'  orientation={isRTL ? 'right' : 'left'}/>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
								direction: isRTL ? 'rtl' : 'ltr',
                                textAlign: isRTL ? 'right' : 'left'
							}}
							itemStyle={{ color: "#E5E7EB" }}
							labelFormatter={(label) => t('charts.salesOverview.month', { month: label })}
							formatter={(value) => [t('common.currencySymbol') + value, t('charts.salesOverview.sales')]}
						/>
						<Line
							type='monotone'
							dataKey='sales'
							stroke='#6366F1'
							strokeWidth={3}
							dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
							activeDot={{ r: 8, strokeWidth: 2 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};
export default SalesOverviewChart;
