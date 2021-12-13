import React, { useState, useEffect } from 'react'
import MUAvatar from '@material-ui/core/Avatar'
import { generate } from '@prescott/geo-pattern'
import { useIsMounted } from 'utils/hook'

interface AvatarProps {
  className?: string
  name?: string
  src?: string
}

export default function Avatar({ className, name, src }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState('')
  const isMounted = useIsMounted()

  useEffect(() => {
    async function getPattern() {
      if (name) {
        const pattern = await generate({
          input: name
        })
        const dataUri = pattern.toDataURL()
        if (isMounted.current) {
          setAvatarUrl(dataUri)
        }
      }
    }
    getPattern()
  }, [name])

  if (src) {
    return <MUAvatar className={className} src={src} />
  } else {
    return (
      <MUAvatar
        className={className}
        style={{
          backgroundImage: `url("${avatarUrl}")`,
          backgroundSize: 'cover'
        }}
      >
        {name
          ? name
              .split(' ')
              .slice(0, 2)
              .map(e => e[0])
              .join('')
          : ''}
      </MUAvatar>
    )
  }
}
