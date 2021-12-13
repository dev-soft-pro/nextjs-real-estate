export default function mergeArray(a1: any[], a2: any[], id: string) {
  const len1 = a1.length

  for (let x = 0; x < a2.length; x++) {
    let found = false

    for (let y = 0; y < len1; y++) {
      if (a2[x][id] === a1[y][id]) {
        found = true
        break
      }
    }

    if (!found) {
      a1.push(a2.splice(x--, 1)[0])
    }
  }

  return a1
}

export function mergeObjectArray(a1: any[], a2: any[], key: string) {
  return a1.map(item1 => {
    const item2 = a2.find(e => e[key] === item1[key])
    return item2 ? { ...item1, ...item2 } : item1
  })
}
