import Agent from '../Agent'

import styles from './styles.scss?type=global'

interface MainSectionDesktopProps {
  property: TopHap.Property
}

export default function MainSectionDesktop({
  property
}: MainSectionDesktopProps) {
  return (
    <>
      <Agent property={property} />

      <section id='description' className='th-description-section'>
        <h4 className='th-section-title'>Description</h4>
        <p>{property.PublicRemarks}</p>
      </section>

      <style jsx>{styles}</style>
    </>
  )
}
