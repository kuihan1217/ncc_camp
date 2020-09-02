import BigNumber from 'bignumber.js';
import { deepClone } from '../utils';

/**
 * calculator simulation
 *
 * @param currValue
 * @param calcValue
 * @param expression
 * @param lastKey
 */
// 加减乘除求余正在表达式
const operatorRegExp = /[+\-x÷]/;
const numRegExp = /[0-9.]/;
const INVALID_RESULT = 'invalid result';

export function calculate(keyType, {currValue, calcValue, expression, lastKey} = {
	currValue: '0',
	calcValue: '',
	expression: [],
	lastKey: ''
}) {
	expression = [...expression];
	if (numRegExp.test(keyType)) {
		numKeyPress();
	} else if (operatorRegExp.test(keyType)) {
		operationKeyPress();
	} else {
		functionKeyPress();
	}
	return {
		expression,
		currValue,
		calcValue
	};

	/**
	 * 数字键
	 */
	function numKeyPress() {
		// 如果上一次是求值、加减乘除、%操作
		let tempValue = /[+\-x÷%=]/.test(lastKey) || currValue === '0' ? keyType : currValue + keyType;
		// 如果上一次是%操作，则从expression弹出最后一个元素，这里是模拟win10计算器的操作
		if (lastKey === '%') {
			expression.pop();
		}
		// 小数点默认补齐为0.
		if (tempValue === '.') {
			tempValue = '0.';
		}
		// 如果拼接后的字符是合法的数值，那就赋值
		if (/^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(tempValue)) {
			currValue = tempValue;
		}
	}

	/**
	 * 操作符
	 */
	function operationKeyPress() {
		if (operatorRegExp.test(lastKey)) {
			if (lastKey !== keyType) {//不同的时候才需要替换
				expression.pop();
				expression.push(keyType);
			}
		} else {
			// 如果已经按过等号按键了，需要重置
			if (expression.includes('=')) {
				expression = [];
				calcValue = '';
			}
			// 以小数点结尾的，删除小数点
			if (currValue.endsWith('.')) {
				currValue = currValue.slice(0, -1);
			}
			// 将当前显示值和操作符压入表达式数组
			// 按%键时，已经将currValue压入expression了，所以这里不用在压入了
			if (lastKey !== '%') {
				expression.push(currValue || '0');
			}
			// 尝试计算结果
			doCalculate();
			expression.push(keyType);
		}
	}

	/**
	 * 功能键
	 */
	function functionKeyPress() {
		if (keyType === 'C') {//重置键
			doReset();
		} else if (keyType === '=') {//=键
			onEqualsClick();
		} else if (keyType === '±') {
			// 处理 正负 按键
			if (currValue.startsWith('-')) {
				currValue = currValue.slice(1);
			} else if (currValue && currValue !== '0') {
				currValue = '-' + currValue;
			}
		} else if (keyType === '%') {
			onPercentClick();
		} else if (keyType === 'CE') {
			if (expression.includes('=')) {
				doReset();
			} else {
				currValue = '0';
			}
		}
	}

	// 处理等号按钮
	function onEqualsClick() {
		const len = expression.length;
		// 处理直接=号开始的情况，或者9=9这种特殊情况
		if (len === 0 || expression[1] === '=') {
			expression = [];
			if (currValue && currValue.endsWith('.')) {
				currValue = currValue.slice(0, -1);
			}
			expression.push(currValue || '0');
		} else if (expression.includes('=')) {
			//如果已经按过=号键了,expression是['x1','*','x2','=']这样的结构
			let lastOper = expression[len - 3];//上次计算的运算符
			let lastNum = expression[len - 2];// 上次计算的右侧数值
			expression = [];
			// 重新压入expression
			expression.push(currValue || '0', lastOper, lastNum);
			doCalculate();
		} else {
			// 直接将当前显示的值压入expression，然后计算，并添加=
			// 按%键时，已经将currValue压入expression了，所以这里不用在压入了
			(lastKey !== '%') && expression.push(currValue || '0');
			doCalculate();
		}
		expression.push('=');
	}

	// 处理%按键
	function onPercentClick() {
		const len = expression.length;
		// 处理%操作
		if (len === 0) {
			doReset();
		} else {
			let tempValue;
			if (lastKey === '%' || expression.includes('=')) {
				// 按过=键或%之后
				tempValue = new BigNumber(currValue).multipliedBy(0.01).toString();
				expression = [];
			} else {
				let oper = expression[len - 1];
				if (oper === '+' || oper === '-') {
					tempValue = new BigNumber(expression[len - 2]).multipliedBy(currValue).multipliedBy(0.01).toString();
				} else {
					tempValue = new BigNumber(currValue).multipliedBy(0.01).toString();
				}
			}
			expression.push(tempValue);
		}
	}

	function doCalculate() {
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
			calcValue = tempCalcValue;
			currValue = isFinite(tempCalcValue) ? String(tempCalcValue) : INVALID_RESULT;
		}
	}

	function doReset() {
		calcValue = '';
		expression = [];
		currValue = '0';
	}
}

export function pushHistory({expression, currValue, calcHistory}) {
	calcHistory = deepClone(calcHistory);
	calcHistory.push({
		expression: expression.join(''),
		result: currValue,
		id: Math.random().toString(16).slice(2)
	});
	return {calcHistory};
}