import {
	BarChart2,
	DollarSign,
	Menu,
	Settings,
	ShoppingBag,
	ShoppingCart,
	TrendingUp,
	Users,
	LayoutGrid,
	BadgePercent,
	Briefcase,
	Activity,
	Languages
  } from "lucide-react";
  import { useState } from "react";
  import { AnimatePresence, motion } from "framer-motion";
  import { Link, useNavigate } from "react-router-dom";
  import { useTranslation } from 'react-i18next';
  
  const Sidebar = () => {
	const { t, i18n } = useTranslation();
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [expandedTab, setExpandedTab] = useState(null);
	const navigate = useNavigate();
  
	const SIDEBAR_ITEMS = [
	  { name: t('sidebar.overview'), icon: BarChart2, color: "#6366f1", href: "/" },
	  { name: t('sidebar.categories'), icon: LayoutGrid, color: "#F43F5E", href: "/categories" },
	  { name: t('sidebar.products'), icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
	  {
		name: t('sidebar.users'),
		icon: Users,
		color: "#EC4899",
		href: "/users",
		children: [
		  { name: t('sidebar.client'), href: "/clients" },
		  { name: t('sidebar.vendor'), href: "/VendorsPage" },
		  { name: t('sidebar.technicalSupport'), href: "/technicals" },
		  { name: t('sidebar.financialManager'), href: "/financials" },
		],
	  },
	  { name: t('sidebar.usersActivities'), icon: Activity, color: "#A78BFA", href: "/usersActivities" },
	  { name: t('sidebar.vendors'), icon: Briefcase, color: "#14B8A6", href: "/vendors" },
	  { 
		name: t('sidebar.commissions'), 
		icon: DollarSign, 
		color: "#10B981", 
		href: "/commission",
		children: [
		  { name: t('sidebar.commissionSettings'), href: "/VendorCommissions" },
		], 
	  },
	  { name: t('sidebar.offers'), icon: BadgePercent, color: "#EAB308", href: "/offers" },
	  { name: t('sidebar.deals'), icon: ShoppingCart, color: "#F59E0B", href: "/deals" },
	//   { name: t('sidebar.analytics'), icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
	  { name: t('sidebar.language'), icon: Languages, color: "#3B82F6", href:"/language"},
	  { name: t('sidebar.settings'), icon: Settings, color: "#6EE7B7", href: "/settings" },
	];
  
	const handleItemClick = (item) => {
	  navigate(item.href);
	  if (item.children) {
		setExpandedTab((prev) => (prev === item.name ? null : item.name));
	  }
	};
  
	return (
	  <motion.div
		className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"} h-full`}
		animate={{ width: isSidebarOpen ? 256 : 80 }}
	  >
		<div className={`h-full bg-green-800 bg-opacity-50 backdrop-blur-md flex flex-col border-r border-gray-300 ${i18n.dir() === 'rtl' ? 'rtl-sidebar' : ''}`}>
		  <div className={`p-4 ${i18n.dir() === 'rtl' ? 'rtl-flex-row-reverse' : ''}`}>
			<motion.button
			  whileHover={{ scale: 1.1 }}
			  whileTap={{ scale: 0.9 }}
			  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
			  className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
			>
			  <Menu size={24} />
			</motion.button>
		  </div>
  
		  <div className='flex-grow overflow-y-auto'>
			<nav className='px-4 pb-4'>
			  {SIDEBAR_ITEMS.map((item) => {
				const isExpanded = expandedTab === item.name;
				const isExpandable = !!item.children;
  
				return (
				  <div key={item.href}>
					<motion.button
					  onClick={() => handleItemClick(item)}
					  className={`flex items-center w-full p-4 text-sm font-medium rounded-2xl hover:bg-green-300 transition-colors mb-2 ${i18n.dir() === 'rtl' ? 'rtl-flex-row-reverse' : ''}`}
					>
					  <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
					  <AnimatePresence>
						{isSidebarOpen && (
						  <motion.span
							className={`${i18n.dir() === 'rtl' ? 'mr-4' : 'ml-4'} whitespace-nowrap`}
							initial={{ opacity: 0, width: 0 }}
							animate={{ opacity: 1, width: "auto" }}
							exit={{ opacity: 0, width: 0 }}
							transition={{ duration: 0.2, delay: 0.3 }}
						  >
							{item.name}
						  </motion.span>
						)}
					  </AnimatePresence>
					</motion.button>
  
					<AnimatePresence>
					  {isSidebarOpen && isExpanded && isExpandable && (
						<motion.div
						  initial={{ opacity: 0, height: 0 }}
						  animate={{ opacity: 1, height: "auto" }}
						  exit={{ opacity: 0, height: 0 }}
						  transition={{ duration: 0.3 }}
						  className={`${i18n.dir() === 'rtl' ? 'mr-8' : 'ml-8'} overflow-hidden`}
						>
						  {item.children.map((subItem) => (
							<Link key={subItem.href} to={subItem.href}>
							  <div className='text-sm p-2 rounded-lg hover:bg-green-200 transition-colors mb-1'>
								{subItem.name}
							  </div>
							</Link>
						  ))}
						</motion.div>
					  )}
					</AnimatePresence>
				  </div>
				);
			  })}
			</nav>
		  </div>
		</div>
	  </motion.div>
	);
  };
  
  export default Sidebar;