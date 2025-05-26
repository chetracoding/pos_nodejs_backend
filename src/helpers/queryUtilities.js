import merge from 'lodash.merge'
export function mapResult(obj) {
  const expand = (str, value) => {
    return str.split('.').reduceRight((acc, currentVal) => {
      return {
        [currentVal]: acc
      }
    }, value)
  }
  return obj.map((item) => {
    let tmp = {}
    for (const keys in item) {
      tmp = merge(tmp, expand(keys, item[keys]))
    }
    return tmp
  })
}

export function getDefinedValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key, value]) => value !== null && value !== undefined
    )
  )
}

export function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index)
}
