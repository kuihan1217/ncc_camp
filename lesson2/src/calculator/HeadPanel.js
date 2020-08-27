import React from 'react';

/**
 * 头部面板，无状态组件
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function HeadPanel(props) {
	return (
		<div className="head-panel">
			<div className="text-right expression-value">{props.expression}</div>
			<div className="text-right curr-value">{props.currValue}</div>
		</div>
	);
}

export default HeadPanel;