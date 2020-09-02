import React from 'react';
import { Button, Icon } from 'tinper-bee';
import { observer, inject } from 'mobx-react';

@inject('calcStore')
@observer
class HistoryPanel extends React.Component {

	render() {
		const calcHistory = [...this.props.calcStore.calcHistory];
		return (
			<div className="history-panel">
				<div className="history-header">
					<div className="history-title">历史记录</div>
					<div className="history-icon">
						<Button shape="icon" bordered onClick={() => this.props.calcStore.showHideModal()}><Icon
							type="uf-table"/></Button>
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


}

export default HistoryPanel;