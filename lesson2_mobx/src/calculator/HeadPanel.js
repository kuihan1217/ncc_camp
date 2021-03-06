import React from 'react';

import { observer, inject } from 'mobx-react';

@inject('calcStore')
@observer
class HeadPanel extends React.Component {
	render() {
		let {expression, currValue} = this.props.calcStore;
		return (
			<div className="head-panel">
				<div className="text-right expression-value">{expression}</div>
				<div className="text-right curr-value">{currValue}</div>
			</div>
		);
	}

}

export default HeadPanel;