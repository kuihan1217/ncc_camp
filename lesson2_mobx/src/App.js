import React from 'react';
import 'tinper-bee/assets/tinper-bee.css';
import Calculator from './calculator/Calculator';
import './App.css';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import myStore from './mobx/MyStore';

function App() {
	return (
		<Provider myStore={myStore}>
			<div className="app">
				<Calculator/>
			</div>
		</Provider>
	);
}

configure({
	enforceActions: true
});
export default App;
