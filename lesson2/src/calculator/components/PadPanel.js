import React from 'react';

import { Button } from 'tinper-bee';

/**
 * 按键面板，封装了Button组件，这是一个无状态组件
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function PadPanel(props) {
	const {keyTypes} = props;
	return (<div className="pad-panel">
		{keyTypes.map(keyType => {
			let className = /[0-9.±]/.test(keyType) ? 'num-key' : 'other-key';
			if (keyType === '=') {
				className = 'equal-key';
			}
			return (<div key={keyType} className="btn-col">
				<Button className={className}
								onClick={() => props.onKeyClick(keyType)}>
					{keyType}
				</Button>
			</div>);
		})}
	</div>);
}

export default PadPanel;