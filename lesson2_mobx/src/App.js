import React from 'react';
import 'tinper-bee/assets/tinper-bee.css';
import Calculator from './calculator/Calculator';
import './App.css';
import { Provider } from 'mobx-react';
import calcStore from './store/CalcStore';

function App() {
	return (
		<Provider calcStore={calcStore}>
			<div className="app">
				<Calculator/>
			</div>
		</Provider>
	);
}

export default App;
