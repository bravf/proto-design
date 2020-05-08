
// // 为了简化数据变化的存储和传输，用 object 来模拟 array
// // 值当 key
// // 索引当 value
// // {
// //   value1: 1,
// //   value2: 2,
// // }
// let create = () => {
//   return {
//     // 特殊属性，不能覆盖
//     $count: 0,
//   }
// }
// let getIndex = (o) => {
//   return o['$count'] ++
// }
// let getIndex2 = (start, end) => {
//   return (start + end) / 2
// }
// let getLength = (o) => {
//   return Object.keys(o).length - 1
// }
// let getValues = (o) => {
//   let o2 = {}
//   for (let key in o){
//     if (key !== '$count'){
//       let value = o[key]
//       o2[value] = key
//     }
//   }
//   return Object.keys(o2).sort((a, b) => a - b).map(i => o2[i])
// }
// export {
//   create,
//   getIndex,
//   getIndex2,
//   getLength,
//   getValues,
// }

// // test
// // let m = create()
// // m['你好'] = getIndex(m)
// // m['你好2'] = getIndex(m)
// // m['你好3'] = getIndex(m)
// // m['你好1.5'] = getIndex2(1,2)
// // console.log(getValues(m), m)
// // console.log(getIndex2(1,2))
let tNumber = (n, x = 2) => {
  let y = Math.pow(10, x)
  return Math.round(n * y) / y
}
let _getMiddleIndex = (start, end) => {
  return start + (end - start) / 2
  // return tNumber(start + (end - start) / 2, 5)
}
let start = 1
let end = 1.125
Array(100).fill('').forEach((x, y) => {
  start = _getMiddleIndex(start, end)
  console.log(start, y)
})