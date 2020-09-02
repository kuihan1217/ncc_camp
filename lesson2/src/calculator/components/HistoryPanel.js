import React from 'react';
import { Button, Icon } from 'tinper-bee';

/**
 * 历史面板，无状态组件
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function HistoryPanel(props) {
	const calcHistory = [...props.calcHistory];
	return (
		<div className="history-panel">
			<div className="history-header">
				<div className="history-title">历史记录</div>
				<div className="history-icon">
					<Button shape="icon" bordered onClick={props.showHideModal}><Icon type="uf-table"/></Button>
				</div>
			</div>
			<div className="history-list">
				{
					calcHistory.reverse().slice(0, 5).map((obj, index) => {
						return (
							<div key={index}>
								<div className="text-right">{obj.expression}</div>
								<div className="text-right history-value">{obj.result}</div>
							</div>
						);
					})
				}
			</div>
		</div>
	);
}

export default HistoryPanel;