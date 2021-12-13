import React from 'react'
import Cropper from 'react-cropper'

import Button from 'components/Button'

import styles from './styles.scss?type=global'

interface PhotoEditorProps {
  src?: string
  onSelect(dataUrl: any): void
}

export default function PhotoEditor({ src, onSelect }: PhotoEditorProps) {
  const refCropper = React.useRef<Cropper>(null)

  function handleSelect() {
    const cropper = refCropper.current
    if (typeof cropper?.getCroppedCanvas() === 'undefined') {
      return
    }

    onSelect(cropper?.getCroppedCanvas().toDataURL())
  }

  return (
    <div className='th-avatar-editor'>
      <section className='th-crop-section'>
        <Cropper
          // @ts-ignore
          ref={refCropper}
          // @ts-ignore
          src={src}
          preview='.th-preview'
          aspectRatio={1}
          guides={false}
          className='th-crop-wrapper'
          style={{ width: '100%', height: 360 }}
        />
      </section>
      <section className='th-preview-section'>
        <div className='th-preview' />
        <Button className='th-select-button' onClick={handleSelect}>
          Select
        </Button>
      </section>
      <style jsx>{styles}</style>
    </div>
  )
}
