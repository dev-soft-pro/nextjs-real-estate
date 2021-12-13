import React from 'react'
import SvgMail from 'assets/images/card/mail_outline.svg'
import Avatar from 'components/Avatar'
import Button from 'components/Button'
import Modal from 'components/Modal'
import RequestInfo from 'components/RequestInfo'
import styles from './styles.scss?type=global'
import { logEvent } from 'services/analytics'

interface AgentProps {
  property: TopHap.Property
}

export default function Agent({ property }: AgentProps) {
  if (!property.Agents) return null
  const [isModalVisible, showModal] = React.useState(false)

  function closeModal() {
    showModal(false)
  }

  function openModal() {
    logEvent('property_detail', 'request_info', 'modal_open', {
      id: property.id
    })
    showModal(true)
  }

  return (
    <section className='th-agent-section'>
      <Avatar
        className='th-agent-avatar'
        name={property.Agents.List.MemberFullName}
      />
      <div className='th-agent-info'>
        <p className='th-agent-name'>{property.Agents.List.MemberFullName}</p>
        <p className='th-agent-company'>{property.Agents.List.OfficeName}</p>
      </div>
      {property.TophapStatus !== 'Sold' && (
        <>
          <Button className='th-request-info-button' onClick={openModal}>
            <SvgMail /> Request Info
          </Button>

          <Modal visible={isModalVisible} onClose={closeModal}>
            <h3 className='mb-3'>Contact an Agent</h3>
            <RequestInfo property={property} small onClose={closeModal} />
          </Modal>
        </>
      )}

      <style jsx>{styles}</style>
    </section>
  )
}
