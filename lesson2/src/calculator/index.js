import React from 'react';
import PadPanel from './components/PadPanel';
import HeadPanel from './components/HeadPanel';
import HistoryPanel from './components/HistoryPanel';
import HistoryModal from './components/HistoryModal';
import { Panel } from 'tinper-bee';
import { calculate, pushHistory } from './functions/CalcSim';
import { deepClone } from './utils';

const keyTypes = ['%', 'CE', 'C', '÷', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '±', '0', '.', '='];
// 加减乘除求余正在表达式
const INVALID_RESULT = 'invalid result';

/**
 * 所有的Panel组件都是无状态组件
 * 所有的状态都提升到Calculator组件中
 */
class Calculator extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currValue: '0',// 当前值
			calcValue: '',// 计算值
			expression: [],// 表达式
			calcHistory: [],// 计算历史
			lastKey: '',// 上一次按键
			showModal: false// 弹窗
		};
	}

	/**
	 * 删除历史记录
	 * @param ids
	 */
	delHistory(ids) {
		if (ids && ids.length) {
			let calcHistory = deepClone(this.state.calcHistory);
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
				this.setState(calculate(keyType, {...this.state}));
				this.onAfterClick(keyType);
			},
			() => {
				if (/^([0-9.C]|CE)$/.test(keyType)) {
					this.setState({
						calcValue: '',
						expression: [],
						currValue: '0'
					}, () => {
						if (/[0-9.]/.test(keyType)) {
							this.setState(calculate(keyType));
							this.onAfterClick(keyType);
						}
					});
				}
			});
	}


	/**
	 * 点击前事件
	 * @returns {Promise<unknown>}
	 */
	onBeforeClick = async () => {
		return new Promise((resolve, reject) => {
			if (this.state.currValue !== INVALID_RESULT) {
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
		let newState = {
			lastKey: (keyType === 'CE') ? '0' : keyType
		};
		if (keyType === '=') {
			newState = {...newState, ...pushHistory({...this.state})};
		}
		this.setState(newState);
	}

	showHideModal() {
		this.setState({
			showModal: !this.state.showModal
		});
	}

	render() {
		return (
			<div>
				<Panel header="Win10 计算器 React 版本">
					<div className="clearfix calculator-area">
						<div className="left-panel">
							<HeadPanel currValue={this.state.currValue} expression={this.state.expression}/>
							<PadPanel keyTypes={keyTypes} onKeyClick={keyType => this.onKeyClick(keyType)}/>
						</div>
						<div className="right-panel">
							<HistoryPanel calcHistory={this.state.calcHistory} showHideModal={() => this.showHideModal()}/>
						</div>
					</div>
				</Panel>
				<HistoryModal showModal={this.state.showModal} calcHistory={this.state.calcHistory}
											delHistory={(ids) => this.delHistory(ids)} showHideModal={() => this.showHideModal()}/>
			</div>
		);
	}
}

export default Calculator;