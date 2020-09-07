import React from 'react';
import PadPanel from './PadPanel';
import HeadPanel from './HeadPanel';
import HistoryPanel from './HistoryPanel';
import HistoryModal from './HistoryModal';
import { Panel } from 'tinper-bee';

import { inject, observer } from 'mobx-react';

/**
 * 所有的Panel组件都是无状态组件
 * 所有的状态都提升到Calculator组件中
 */
@inject('calcStore')
@observer
class Calculator extends React.Component {

	/**
	 * 点击事件回调
	 * @param keyType
	 */
	onKeyClick(keyType) {
		this.onBeforeClick().then(
			() => {
				this.props.calcStore.doKeyPress(keyType);
				this.onAfterClick(keyType);
			},
			() => {
				if (/^([0-9.C]|CE)$/.test(keyType)) {
					this.props.calcStore.doReset();
				}
			});
	}


	/**
	 * 点击前事件
	 * @returns {Promise<unknown>}
	 */
	onBeforeClick = async () => {
		return new Promise((resolve, reject) => {
			if (this.props.calcStore.currValue !== INVALID_RESULT) {
				resolve();
			} else {
				reject();
			}
		});
	};

	/**
	 * 点击后事件
	 * @param keyType
	 */
	onAfterClick(keyType) {
		const {calcStore} = this.props;
		calcStore.setLastKey(keyType === 'CE' ? '0' : keyType);
		(keyType === '=') && calcStore.pushHistory();
	}

	showHideModal() {
		this.props.calcStore.showHideModal();
	}

	render() {
		console.log(this.props.calcStore);
		return (
			<div>
				<Panel header="Win10 计算器 React 版本">
					<div className="clearfix calculator-area">
						<div className="left-panel">
							<HeadPanel/>
							<PadPanel keyTypes={keyTypes} onKeyClick={keyType => this.onKeyClick(keyType)}/>
						</div>
						<div className="right-panel">
							<HistoryPanel/>
						</div>
					</div>
				</Panel>
				<HistoryModal/>
			</div>
		);
	}
}

const keyTypes = ['%', 'CE', 'C', '÷', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '±', '0', '.', '='];

// 加减乘除求余正在表达式
const INVALID_RESULT = 'invalid result';

export default Calculator;