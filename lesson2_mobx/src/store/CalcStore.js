import { observable, action } from 'mobx';
import BigNumber from 'bignumber.js';
import { configure } from 'mobx';
// 加减乘除求余正在表达式
const operatorRegExp = /[+\-x÷]/;
const numRegExp = /[0-9.]/;
const INVALID_RESULT = 'invalid result';
configure({enforceActions: 'observed'});

let _calcValue = '';
let _lastKey = '';

class CalcStore {
	@observable currValue = '0';
	@observable expression = [];
	@observable calcHistory = [];
	@observable showModal = false;

	@action delHistory = (ids) => {
		if (ids && ids.length) {
			this.calcHistory = this.calcHistory.filter(item => !ids.includes(item.id));
		}
	};

	@action showHideModal = () => {
		this.showModal = !this.showModal;
	};

	setLastKey(newValue) {
		_lastKey = newValue;
	}

	@action pushHistory = () => {
		this.calcHistory.push({
			expression: this.expression.join(''),
			result: this.currValue,
			id: Math.random().toString(16).slice(2)
		});
	};

	@action doKeyPress = (keyType) => {
		if (numRegExp.test(keyType)) {
			this.numKeyPress(keyType);
		} else if (operatorRegExp.test(keyType)) {
			this.operationKeyPress(keyType);
		} else {
			this.functionKeyPress(keyType);
		}
	};

	/**
	 * 重置计算器
	 */
	@action doReset() {
		_calcValue = '';
		this.expression = [];
		this.currValue = '';
	}

	/**
	 * 数字键
	 * @param keyType
	 */
	numKeyPress(keyType) {
		// 如果上一次是求值、加减乘除、%操作
		let tempValue = /[+\-x÷%=]/.test(_lastKey) || this.currValue === '0' ? keyType : this.currValue + keyType;
		// 如果上一次是%操作，则从expression弹出最后一个元素，这里是模拟win10计算器的操作
		if (_lastKey === '%') {
			this.expression.pop();
		}
		// 小数点默认补齐为0.
		if (tempValue === '.') {
			tempValue = '0.';
		}
		// 如果拼接后的字符是合法的数值，那就赋值
		if (/^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(tempValue)) {
			this.currValue = tempValue;
		}
	}

	/**
	 * 操作符
	 * @param keyType
	 */
	operationKeyPress(keyType) {
		if (operatorRegExp.test(_lastKey)) {
			if (_lastKey !== keyType) {//不同的时候才需要替换
				this.expression.splice(this.expression.length - 1, 1, keyType);
			}
		} else {
			// 如果已经按过等号按键了，需要重置
			if (this.expression.includes('=')) {
				this.expression = [];
				_calcValue = '';
			}
			// 以小数点结尾的，删除小数点
			if (this.currValue.endsWith('.')) {
				this.currValue = this.currValue.slice(0, -1);
			}
			// 将当前显示值和操作符压入表达式数组
			// 按%键时，已经将currValue压入expression了，所以这里不用在压入了
			if (_lastKey !== '%') {
				this.expression.push(this.currValue || '0');
			}
			// 尝试计算结果
			this.doEval();
			this.expression.push(keyType);
		}
	}

	/**
	 * 功能键
	 * @param keyType
	 */
	functionKeyPress(keyType) {
		if (keyType === 'C') {//重置键
			this.doReset();
		} else if (keyType === '=') {//=键
			this.onEqualsClick();
		} else if (keyType === '±') {
			// 处理 正负 按键
			if (this.currValue.startsWith('-')) {
				this.currValue = this.currValue.slice(1);
			} else if (this.currValue && this.currValue !== '0') {
				this.currValue = '-' + this.currValue;
			}
		} else if (keyType === '%') {
			this.onPercentClick();
		} else if (keyType === 'CE') {
			if (this.expression.includes('=')) {
				this.doReset();
			} else {
				this.currValue = '0';
			}
		}
	}

	// 处理等号按钮
	onEqualsClick() {
		const len = this.expression.length;
		// 处理直接=号开始的情况，或者9=9这种特殊情况
		if (len === 0 || this.expression[1] === '=') {
			this.expression = [];
			if (this.currValue && this.currValue.endsWith('.')) {
				this.currValue = this.currValue.slice(0, -1);
			}
			this.expression.push(this.currValue || '0');
		} else if (this.expression.includes('=')) {
			//如果已经按过=号键了,expression是['x1','*','x2','=']这样的结构
			let lastOper = this.expression[len - 3];//上次计算的运算符
			let lastNum = this.expression[len - 2];// 上次计算的右侧数值
			this.expression = [];
			// 重新压入expression
			this.expression.push(this.currValue || '0', lastOper, lastNum);
			this.currValue = '';
			this.doEval();
		} else {
			// 直接将当前显示的值压入expression，然后计算，并添加=
			// 按%键时，已经将currValue压入expression了，所以这里不用在压入了
			if (_lastKey !== '%') {
				this.expression.push(this.currValue || '0');
			}
			this.doEval();
		}
		this.expression.push('=');
	}

	// 处理%按键
	onPercentClick() {
		const len = this.expression.length;
		// 处理%操作
		if (len === 0) {
			this.doReset();
		} else {
			let tempValue;
			if (_lastKey === '%' || this.expression.includes('=')) {
				// 按过=键或%之后
				tempValue = new BigNumber(this.currValue).multipliedBy(0.01).toString();
				this.expression = [];
			} else {
				let oper = this.expression[len - 1];
				if (oper === '+' || oper === '-') {
					tempValue = new BigNumber(this.expression[len - 2]).multipliedBy(this.currValue).multipliedBy(0.01).toString();
				} else {
					tempValue = new BigNumber(this.currValue).multipliedBy(0.01).toString();
				}
			}
			this.expression.push(tempValue);
			this.currValue = tempValue;
		}
	}

	doEval() {
		const len = this.expression.length;
		// 如果压入操作数组的元素超过3个
		// 最根本的原则，就是获取表达式数组最后3个元素，进行计算
		if (len >= 3) {
			let op1 = Number(this.expression[len - 3]);
			let oper = this.expression[len - 2];
			let op2 = Number(this.expression[len - 1]);
			// 如果上次计算的结果是number类型
			if (typeof _calcValue === 'number') {
				op1 = _calcValue;
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
			_calcValue = tempCalcValue;
			this.currValue = isFinite(tempCalcValue) ? String(tempCalcValue) : INVALID_RESULT;
		}
	}
}

export default new CalcStore();