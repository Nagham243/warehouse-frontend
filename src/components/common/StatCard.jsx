import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value, color, isRTL = false }) => {
  return (
    <motion.div
      className='bg-gray-300 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl'
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className='px-4 py-5 sm:p-6'>
        <span className={`flex items-center text-sm font-medium text-black ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Icon 
            size={20} 
            className='mx-2' 
            style={{ color }} 
          />
          {name}
        </span>
        <p className={`mt-1 text-3xl font-semibold text-black ${isRTL ? 'text-right' : 'text-left'}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;