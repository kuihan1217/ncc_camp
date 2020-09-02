function deepClone(item) {
	return JSON.parse(JSON.stringify(item));
}

export {
	deepClone
};