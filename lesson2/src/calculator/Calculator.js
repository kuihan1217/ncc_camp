import React from 'react';
import PadPanel from './PadPanel';
import HeadPanel from './HeadPanel';
import HistoryPanel from './HistoryPanel';
import HistoryModal from './HistoryModal';
import { Panel } from 'tinper-bee';
import BigNumber from 'bignumber.js';

const keyTypes = ['%', 'CE', 'C', '÷', '7', '8', '9', 'x', '4', '5', '6', '-', '1', '2', '3', '+', '±', '0', '.', '='];
// 加减乘除求余正在表达式
const operatorRegExp = /[+\-x÷]/;
const numRegExp = /[0-9.]/;
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
	 * 重置计算器
	 */
	resetCalculator() {
		this.setState({
			calcValue: '',
			expression: [],
			currValue: '0'
		});
	}

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
				if (numRegExp.test(keyType)) {
					this.numKeyPress(keyType);
				} else if (operatorRegExp.test(keyType)) {
					this.operationKeyPress(keyType);
				} else {
					this.functionKeyPress(keyType);
				}
				this.onAfterClick(keyType);
			},
			() => {
				if (/^([0-9.C]|CE)$/.test(keyType)) {
					this.resetCalculator();
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

	/**
	 * 数字键
	 * @param keyType
	 */
	numKeyPress(keyType) {
		// 如果上一次是求值、加减乘除、%操作
		const {lastKey, currValue} = this.state;
		let tempValue = /[+\-x÷%=]/.test(lastKey) || currValue === '0' ? keyType : currValue + keyType;
		// 如果上一次是%操作，则从expression弹出最后一个元素，这里是模拟win10计算器的操作
		if (lastKey === '%') {
			let expression = [...this.state.expression];
			expression.pop();
			this.setState({expression});
		}
		// 小数点默认补齐为0.
		if (tempValue === '.') {
			tempValue = '0.';
		}
		// 如果拼接后的字符是合法的数值，那就赋值
		if (/^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(tempValue)) {
			this.setState({currValue: tempValue});
		}
	}

	/**
	 * 操作符
	 * @param keyType
	 */
	operationKeyPress(keyType) {
		const {lastKey, currValue} = this.state;
		const expression = [...this.state.expression];
		if (operatorRegExp.test(lastKey)) {
			if (lastKey !== keyType) {//不同的时候才需要替换
				expression.pop();
				expression.push(keyType);
				this.setState({expression});
			}
		} else {
			// 如果已经按过等号按键了，需要重置
			if (expression.includes('=')) {
				expression.length = 0;
				this.setState({calcValue: '', expression});
			}
			// 以小数点结尾的，删除小数点
			if (currValue.endsWith('.')) {
				this.setState({currValue: currValue.slice(0, -1)});
			}
			// 将当前显示值和操作符压入表达式数组
			// 按%键时，已经将currValue压入expression了，所以这里不用在压入了
			if (lastKey !== '%') {
				expression.push(currValue || '0');
			}
			// 尝试计算结果
			this.doEval();
			expression.push(keyType);
			this.setState({expression});
		}
	}

	/**
	 * 功能键
	 * @param keyType
	 */
	functionKeyPress(keyType) {
		if (keyType === 'C') {//重置键
			this.resetCalculator();
		} else if (keyType === '=') {//=键
			this.onEqualsClick();
		} else if (keyType === '±') {
			// 处理 正负 按键
			const {currValue} = this.state;
			if (currValue.startsWith('-')) {
				this.setState({currValue: currValue.slice(1)});
			} else if (currValue && currValue !== '0') {
				this.setState({currValue: '-' + currValue});
			}
		} else if (keyType === '%') {
			this.onPercentClick();
		} else if (keyType === 'CE') {
			const {expression} = this.state;
			if (expression.includes('=')) {
				this.resetCalculator();
			} else {
				this.setState({currValue: '0'});
			}
		}
	}

	// 处理等号按钮
	onEqualsClick() {
		const {currValue, lastKey} = this.state;
		const expression = [...this.state.expression];
		const len = expression.length;
		// 处理直接=号开始的情况，或者9=9这种特殊情况
		if (len === 0 || expression[1] === '=') {
			expression.length = 0;
			if (currValue && currValue.endsWith('.')) {
				this.setState({currValue: currValue.slice(0, -1)});
			}
			expression.push(currValue || '0');
			this.setState({expression});
		} else if (expression.includes('=')) {
			//如果已经按过=号键了,expression是['x1','*','x2','=']这样的结构
			let lastOper = expression[len - 3];//上次计算的运算符
			let lastNum = expression[len - 2];// 上次计算的右侧数值
			expression.length = 0;
			// 重新压入expression
			expression.push(currValue || '0', lastOper, lastNum);
			this.setState({
				expression,
				currValue: ''
			});
			this.doEval();
		} else {
			// 直接将当前显示的值压入expression，然后计算，并添加=
			// 按%键时，已经将currValue压入expression了，所以这里不用在压入了
			if (lastKey !== '%') {
				expression.push(currValue || '0');
				this.setState({expression});
			}
			this.doEval();
		}
		expression.push('=');
		this.setState({expression});
	}

	// 处理%按键
	onPercentClick() {
		const expression = [...this.state.expression];
		const {lastKey, currValue} = this.state;
		const len = expression.length;
		// 处理%操作
		if (len === 0) {
			this.resetCalculator();
		} else {
			let tempValue;
			if (lastKey === '%' || expression.includes('=')) {
				// 按过=键或%之后
				tempValue = new BigNumber(currValue).multipliedBy(0.01).toString();
				expression.length = 0;
			} else {
				let oper = expression[len - 1];
				if (oper === '+' || oper === '-') {
					tempValue = new BigNumber(expression[len - 2]).multipliedBy(currValue).multipliedBy(0.01).toString();
				} else {
					tempValue = new BigNumber(currValue).multipliedBy(0.01).toString();
				}
			}
			expression.push(tempValue);
			this.setState({
				expression,
				currValue: tempValue
			});
		}
	}

	doEval() {
		const {expression, calcValue} = this.state;
		const len = expression.length;
		// 如果压入操作数组的元素超过3个
		// 最根本的原则，就是获取表达式数组最后3个元素，进行计算
		if (len >= 3) {
			let op1 = Number(expression[len - 3]);
			let oper = expression[len - 2];
			let op2 = Number(expression[len - 1]);
			// 如果上次计算的结果是number类型
			if (typeof calcValue === 'number') {
				op1 = calcValue;
			}
			let tempCalcValue;
			switch (oper) {
				case '-':
					tempCalcValue = new BigNumber(op1).minus(op2).toNumber();
					break;
				case '+':
					tempCalcValue = new BigNumber(op1).plus(op2).toNumber();
					break;
				case 'x':
					tempCalcValue = new BigNumber(op1).multipliedBy(op2).toNumber();
					break;
				case '÷':
					tempCalcValue = new BigNumber(op1).dividedBy(op2).toNumber();
					break;
				default:
					return;
			}

			this.setState({
				calcValue: tempCalcValue,
				currValue: isFinite(tempCalcValue) ? String(tempCalcValue) : INVALID_RESULT
			});
		}
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