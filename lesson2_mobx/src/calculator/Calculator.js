import React from 'react';
import PadPanel from './PadPanel';
import HeadPanel from './HeadPanel';
import HistoryPanel from './HistoryPanel';
import { Panel } from 'tinper-bee';
import { observer, inject } from 'mobx-react';

const keyTypes = ['%', 'CE', 'C', '÷', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '±', '0', '.', '='];
// 加减乘除求余正在表达式
const INVALID_RESULT = 'invalid result';

/**
 * 所有的Panel组件都是无状态组件
 * 所有的状态都提升到Calculator组件中
 */
@observer
@inject('myStore')
class Calculator extends React.Component {
	/**
	 * 删除历史记录
	 * @param ids
	 */
	delHistory(ids) {
		if (ids && ids.length) {
			let calcHistory = JSON.parse(JSON.stringify(this.state.calcHistory));
			calcHistory = calcHistory.filter(item => !ids.includes(item.id));
			this.setState({calcHistory});
		}
	}

	/**
	 * 点击事件回调
	 * @param keyType
	 */
	onKeyClick(keyType) {
		this.onBeforeClick().then(
			() => {
				this.props.myStore.doKeyPress(keyType);
				this.onAfterClick(keyType);
			},
			() => {
				if (/^([0-9.C]|CE)$/.test(keyType)) {
					this.props.myStore.doReset();
				}
			});
	}


	/**
	 * 点击前事件
	 * @returns {Promise<unknown>}
	 */
	onBeforeClick = async () => {
		return new Promise((resolve, reject) => {
			if (this.props.myStore.currValue !== INVALID_RESULT) {
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
		this.setState({
			lastKey: (keyType === 'CE') ? '0' : keyType
		});
		if (keyType === '=') {
			const calcHistory = [...this.state.calcHistory];
			calcHistory.push({
				expression: this.state.expression.join(''),
				result: this.state.currValue,
				id: Math.random().toString(16).slice(2)
			});
			this.setState({calcHistory});
		}
	}

	showHideModal() {
		this.props.myStore.showHideModal();
	}

	render() {
		return (
			<div>
				<Panel header="Win10 计算器 React 版本">
					<div className="clearfix calculator-area">
						<div className="left-panel">
							<HeadPanel/>
							<PadPanel keyTypes={keyTypes} onKeyClick={keyType => this.onKeyClick(keyType)}/>
						</div>
						<div className="right-panel">
							<HistoryPanel calcHistory={this.state.calcHistory} showHideModal={() => this.showHideModal()}/>
						</div>
					</div>
				</Panel>
				{/*<HistoryModal showModal={this.state.showModal} calcHistory={this.state.calcHistory}
											delHistory={(ids) => this.delHistory(ids)} showHideModal={() => this.showHideModal()}/>*/}
			</div>
		);
	}
}

export default Calculator;