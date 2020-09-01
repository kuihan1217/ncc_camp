import React from 'react';
import {
	Table,
	Checkbox,
	Button,
	Modal,
	SearchPanel,
	Form,
	FormControl,
	Select,
	Label,
	Row,
	Col,
	Pagination
} from 'tinper-bee';
import multiSelect from 'bee-table/build/lib/multiSelect';

let MultiSelectTable = multiSelect(Table, Checkbox);
const FormItem = Form.FormItem;
const Option = Select.Option;
const AdvancedContainer = SearchPanel.AdvancedContainer;
const INVALID_RESULT = 'invalid result';
const columns = [
	{
		title: 'expression',
		dataIndex: 'expression',
		key: 'expression',
		width: '400px'
	},
	{
		title: 'result',
		dataIndex: 'result',
		key: 'result'
	}
];

/**
 * 弹窗显示历史记录
 */
class HistoryModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchText: '',
			searchType: '',
			activePage: 1,
			cacheData: [],
			tableData: [],
			delIds: []
		};
	}

	handleSelect(eventKey) {
		this.clear();
		this.setState({
			activePage: eventKey
		});
	}

	clear() {
		let {tableData} = this.state;
		tableData.forEach(item => item._checked = false);
		this.setState({
			tableData: JSON.parse(JSON.stringify(tableData))
		});
	};

	onSearch() {
		let tableData = [...this.state.cacheData];
		const searchText = this.props.form.getFieldValue('searchText');
		const searchType = this.props.form.getFieldValue('searchType');
		if (searchText) {
			tableData = tableData.filter(v => v.expression.includes(searchText));
		}
		if (searchType) {
			tableData = tableData.filter(v => {
				if (searchType === 'invalid') {
					return v.result === INVALID_RESULT;
				} else {
					return v.result !== INVALID_RESULT;
				}
			});
		}
		this.setState({
			tableData,
			activePage: 1
		});
	}

	onFormReset() {
		this.props.form.resetFields();
	}

	getSelectedDataFunc(data) {
		const tableData = this.deepClone(this.state.tableData);
		for (let item of tableData) {
			let checkFlag = false;
			for (let checkedItem of data) {
				if (checkedItem.id === item.id) {
					item._checked = true;
					checkFlag = true;
					break;
				}
			}
			if (!checkFlag) {
				item._checked = false;
			}
			checkFlag = false;
		}
		this.setState({tableData});
	}

	onShowModal() {
		this.onFormReset();
		const data = this.deepClone(this.props.calcHistory);
		this.setState({
			cacheData: data,
			tableData: data,
			delIds: [],
			activePage: 1
		});
	}

	onHideModal() {
		const {showHideModal, delHistory} = this.props;
		showHideModal();
		delHistory([...this.state.delIds]);
	}

	deepClone(item) {
		return JSON.parse(JSON.stringify(item));
	}

	onDelHistory() {
		const ids = [];
		this.state.tableData.forEach(item => {
			if (item._checked) {
				ids.push(item.id);
			}
		});
		if (ids.length) {
			Modal.confirm({
				title: '确定要删除已选择的记录吗？',
				content: '删除后将不能恢复。',
				onOk: () => {
					const delIds = [...this.state.delIds];
					delIds.push(...ids);
					let tableData = this.deepClone(this.state.tableData);
					let cacheData = this.deepClone(this.state.cacheData);
					tableData = tableData.filter(item => !ids.includes(item.id));
					cacheData = cacheData.filter(v => !delIds.includes(v.id));
					this.setState({
						tableData, delIds, cacheData, activePage: 1
					});
				},
				onCancel() {
					console.log('Cancel');
				}
			});
		}
	}

	render() {
		const {getFieldProps} = this.props.form;
		let multiObj = {
			type: 'checkbox'
		};
		const {showModal} = this.props;
		const pageStart = (this.state.activePage - 1) * 8;
		let data = this.state.tableData.slice(pageStart, pageStart + 8);
		return (
			<div>
				<Modal
					show={showModal}
					onHide={() => this.onHideModal()}
					size="lg"
					onShow={() => this.onShowModal()}
				>
					<Modal.Header closeButton>
						<Modal.Title>计算器历史记录</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<SearchPanel
							title="查询条件"
							onSearch={() => this.onSearch()}
							onReset={() => this.onFormReset()}
							expanded={true}
							isExpandedBtn={false}
							style={{marginBottom: '20px'}}
						>
							<AdvancedContainer>
								<Form>
									<Row className='edit-panel'>
										<Col lg={6} md={6} xs={12}>
											<FormItem>
												<Label>搜索内容：</Label>
												<FormControl placeholder="请输入" {...getFieldProps('searchText')} />
											</FormItem>
										</Col>
										<Col lg={6} md={6} xs={6}>
											<FormItem>
												<Label>类型：</Label>
												<Select
													style={{width: 200, marginRight: 6}}
													{
														...getFieldProps('searchType', {
																initialValue: ''
															}
														)}
												>
													<Option value="">全部</Option>
													<Option value="valid">有效</Option>
													<Option value="invalid">无效</Option>
												</Select>
											</FormItem>
										</Col>
									</Row>
								</Form>
							</AdvancedContainer>
						</SearchPanel>
						<MultiSelectTable
							style={{height: '360px'}}
							columns={columns}
							data={data}
							multiSelect={multiObj}
							getSelectedDataFunc={(data) => this.getSelectedDataFunc(data)}
						/>
						<Pagination
							first
							last
							prev
							next
							size="md"
							gap={false}
							dataNum={0}
							dataNumSelect={['8']}
							maxButtons={5}
							activePage={this.state.activePage}
							onSelect={this.handleSelect.bind(this)}
							total={this.state.tableData.length}
						/>
					</Modal.Body>

					<Modal.Footer>
						<Button onClick={() => this.clear()} colors="secondary" style={{float: 'left'}}>清空所选</Button>
						<Button onClick={() => this.onDelHistory()} colors="danger"
										style={{float: 'left', marginLeft: '5px'}}>删除所选</Button>
						<Button onClick={() => this.onHideModal()} colors="secondary" style={{marginRight: 8}}>关闭弹窗</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

export default Form.createForm()(HistoryModal);