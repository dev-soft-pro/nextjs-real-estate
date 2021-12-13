export default function Watchlist() {
  return <div>Working in Progress.</div>
}

// import { useEffect, useRef, useState } from 'react'
// import Button from 'components/Button'
// import randomColor from 'randomcolor'

// import ComparableCard from './components/ComparableCard'
// import AddModal from '../Compare/components/AddModal'
// import CompareChart from '../Compare/components/CompareChart'

// import SvgAdd from 'assets/images/icons/add_circle_outline.svg'
// import { formatPropertyMetric } from 'consts/data_mapping'
// import styles from './styles.scss?type=global'

// interface WatchlistProps {
//   comparables: TopHap.Comparable[]
//   addComparable: TopHap.CompareCreators['addComparable']
//   removeComparable: TopHap.CompareCreators['removeComparable']
// }

// export default function({
//   comparables,
//   addComparable,
//   removeComparable
// }: WatchlistProps) {
//   const [isAddVisible, showAddModal] = useState(false)
//   const [primary, setPrimary] = useState(0)
//   const colors = useRef<{ [key: string]: string }>({})
//   useEffect(() => {
//     comparables.forEach((e, index) => {
//       colors.current[e.place.id] = randomColor({
//         luminosity: 'bright',
//         seed: (index + 1) * 10
//       })
//     })
//   }, [])

//   function toggleAddModal() {
//     showAddModal(!isAddVisible)
//   }

//   function onAdd(place: TopHap.Place) {
//     if (!comparables.find(e => e.place.id === place.id)) {
//       colors.current[place.id] = randomColor({
//         luminosity: 'bright',
//         seed: (comparables.length + 1) * 10
//       })
//       addComparable(place)
//     }
//     showAddModal(false)
//   }

//   function onRemove(index: number) {
//     removeComparable(comparables[index])
//     delete colors.current[comparables[index].place.id]

//     if (primary === index) setPrimary(0)
//     else if (primary > index) setPrimary(primary - 1)
//   }

//   function _renderMetric(
//     comparable: TopHap.Comparable,
//     metric: TopHap.PropertyMetric,
//     fixed: number,
//     isPrimary: boolean,
//     suffix = '',
//     prefix = ''
//   ) {
//     const diff = isPrimary
//       ? undefined
//       : comparable.data[metric] - comparables[primary].data[metric]

//     return (
//       <td className='th-metric-value'>
//         <div>
//           {prefix}
//           {formatPropertyMetric(metric, comparable.data[metric].toFixed(fixed))}
//           &nbsp;{suffix}
//         </div>
//         {diff && (
//           <div style={{ color: diff > 0 ? '#20cb4c' : '#ff0000' }}>
//             {prefix}
//             {formatPropertyMetric(metric, Math.abs(diff).toFixed(fixed))}
//             &nbsp;{suffix}
//           </div>
//         )}
//       </td>
//     )
//   }

//   return (
//     <div className='th-watchlist container'>
//       <h1 className='th-page-title'>
//         Compare Real Estate Markets and Properties
//       </h1>

//       {comparables.length ? (
//         <CompareChart comparables={comparables} colors={colors.current} />
//       ) : null}

//       <table className='th-table'>
//         <thead>
//           <tr className='th-row th-head-row'>
//             <th className='th-head-item'>
//               <Button
//                 className='th-add-button'
//                 disabled={isAddVisible}
//                 onClick={toggleAddModal}
//               >
//                 <SvgAdd className='th-icon' />
//                 <span>Add property or region</span>
//               </Button>
//             </th>
//             <th className='th-head-item'>Price</th>
//             <th className='th-head-item'>USD per Sqft</th>
//             <th className='th-head-item'>Living Area</th>
//             <th className='th-head-item'>Lot Size</th>
//             <th className='th-head-item'>Bedrooms</th>
//             <th className='th-head-item'>Bathrooms</th>
//             <th className='th-head-item'>Year Built</th>
//           </tr>
//         </thead>

//         <tbody>
//           {comparables.map((e, index) => (
//             <tr key={e.place.id}>
//               <td>
//                 <ComparableCard
//                   color={colors.current[e.place.id]}
//                   comparable={e}
//                   isPrimary={primary === index}
//                   remove={() => onRemove(index)}
//                   setPrimary={() => setPrimary(index)}
//                 />
//               </td>
//               {_renderMetric(e, 'Price', 0, index === primary, '', '$')}
//               {_renderMetric(
//                 e,
//                 'PricePerSqft',
//                 2,
//                 index === primary,
//                 '/ ft²',
//                 '$'
//               )}
//               {_renderMetric(e, 'LivingSqft', 0, index === primary, 'ft²')}
//               {_renderMetric(e, 'LotAcres', 2, index === primary, 'acres')}
//               {_renderMetric(e, 'BedsCount', 0, index === primary, 'bedrooms')}
//               {_renderMetric(
//                 e,
//                 'BathsDecimal',
//                 0,
//                 index === primary,
//                 'bathrooms'
//               )}
//               {_renderMetric(e, 'YearBuilt', 0, index === primary)}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <AddModal visible={isAddVisible} onAdd={onAdd} onClose={toggleAddModal} />
//       <style jsx>{styles}</style>
//     </div>
//   )
// }
