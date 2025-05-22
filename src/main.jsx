import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import './i18n';
import './rtl.css';
import './chart-rtl.css';
import { BrowserRouter } from "react-router-dom";

const Root = () => {
	useEffect(() => {
		const savedLanguage = localStorage.getItem('language') || 'en';
		document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
		
		if (savedLanguage === 'ar') {
			document.body.classList.add('rtl');
		} else {
			document.body.classList.remove('rtl');
		}
	}, []);

	return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<Root />
		</BrowserRouter>
	</React.StrictMode>
);